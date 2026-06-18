from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from datetime import datetime
from app import db
from app.models.booking import Booking, BookingAddon
from app.models.vehicle import Vehicle
from app.models.notification import Notification
from app.models.coupon import Coupon
from app.utils import ok, err, created, current_user, require_roles, paginate, audit, generate_ref

bookings_bp = Blueprint('bookings', __name__)

TAX_RATE = 0.16  # 16%


def calc_duration(pd, rd):
    return max(1, (rd - pd).days)


def calc_amount(vehicle, days, coupon=None):
    if days >= 30 and vehicle.monthly_rate:
        months = days / 30
        base = float(vehicle.monthly_rate) * months
    elif days >= 7 and vehicle.weekly_rate:
        weeks = days / 7
        base = float(vehicle.weekly_rate) * weeks
    else:
        base = float(vehicle.daily_rate) * days

    discount = 0.0
    if coupon:
        if coupon.discount_type == 'percentage':
            discount = base * float(coupon.discount_value) / 100
            if coupon.max_discount:
                discount = min(discount, float(coupon.max_discount))
        else:
            discount = float(coupon.discount_value)

    tax   = (base - discount) * TAX_RATE
    total = base - discount + tax
    return {'base': round(base,2), 'discount': round(discount,2),
            'tax': round(tax,2), 'total': round(total,2)}


@bookings_bp.post('/quote')
def get_quote():
    d = request.get_json() or {}
    vehicle_id  = d.get('vehicle_id')
    pickup_date = d.get('pickup_date')
    return_date = d.get('return_date')
    coupon_code = d.get('coupon_code')
    if not all([vehicle_id, pickup_date, return_date]):
        return err('vehicle_id, pickup_date and return_date required')
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    try:
        pd = datetime.fromisoformat(pickup_date)
        rd = datetime.fromisoformat(return_date)
    except: return err('Invalid date format')
    if rd <= pd: return err('Return date must be after pickup date')

    days   = calc_duration(pd, rd)
    coupon = None
    if coupon_code:
        coupon = Coupon.query.filter_by(code=coupon_code.upper(), is_active=True).first()
        if not coupon: return err('Invalid coupon code')

    amounts = calc_amount(vehicle, days, coupon)
    return ok({**amounts, 'days': days, 'daily_rate': float(vehicle.daily_rate),
               'deposit_amount': float(vehicle.deposit_amount or 0)})


@bookings_bp.post('')
@jwt_required()
def create_booking():
    user = current_user()
    d    = request.get_json() or {}
    required = ['vehicle_id','pickup_location','dropoff_location','pickup_date','return_date']
    if not all(d.get(f) for f in required):
        return err(f'Missing required fields')

    vehicle = Vehicle.query.filter_by(id=d['vehicle_id'], is_active=True).first()
    if not vehicle: return err('Vehicle not found', 404)
    if vehicle.status != 'available': return err('Vehicle is not available')

    try:
        pd = datetime.fromisoformat(d['pickup_date'])
        rd = datetime.fromisoformat(d['return_date'])
    except: return err('Invalid date format')
    if rd <= pd: return err('Return date must be after pickup date')
    if pd < datetime.utcnow(): return err('Pickup date cannot be in the past')

    # Check availability
    from sqlalchemy import and_
    conflict = Booking.query.filter(
        and_(
            Booking.vehicle_id == vehicle.id,
            Booking.status.in_(['confirmed','active']),
            Booking.pickup_date < rd, Booking.return_date > pd,
        )
    ).first()
    if conflict: return err('Vehicle is not available for selected dates')

    coupon = None
    coupon_code = (d.get('coupon_code') or '').upper()
    if coupon_code:
        coupon = Coupon.query.filter_by(code=coupon_code, is_active=True).first()
        if not coupon: return err('Invalid coupon code')
        if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
            return err('Coupon has reached its usage limit')

    days    = calc_duration(pd, rd)
    amounts = calc_amount(vehicle, days, coupon)

    booking = Booking(
        booking_ref      = generate_ref('BK'),
        customer_id      = user.id,
        vehicle_id       = vehicle.id,
        branch_id        = vehicle.branch_id,
        pickup_location  = d['pickup_location'],
        dropoff_location = d['dropoff_location'],
        pickup_date      = pd, return_date = rd,
        duration_days    = days,
        base_amount      = amounts['base'],
        discount_amount  = amounts['discount'],
        tax_amount       = amounts['tax'],
        total_amount     = amounts['total'],
        deposit_amount   = vehicle.deposit_amount or 0,
        coupon_code      = coupon_code or None,
        driver_name      = d.get('driver_name', user.full_name),
        driver_license   = d.get('driver_license', user.license_number),
        special_requests = d.get('special_requests',''),
        status           = 'pending',
    )
    db.session.add(booking)
    db.session.flush()

    for addon in d.get('addons', []):
        db.session.add(BookingAddon(booking_id=booking.id,
                                    name=addon['name'], price=float(addon['price'])))

    if coupon:
        coupon.used_count = (coupon.used_count or 0) + 1

    db.session.add(Notification(
        user_id = user.id,
        title   = 'Booking Created!',
        message = f'Your booking {booking.booking_ref} has been submitted. Awaiting confirmation.',
        type    = 'info', link = f'/bookings/{booking.id}',
    ))

    db.session.commit()
    vehicle.total_bookings = (vehicle.total_bookings or 0) + 1
    db.session.commit()
    audit('BOOKING_CREATED', 'bookings', booking.id)
    return created(booking.to_dict(), 'Booking created successfully')


@bookings_bp.get('/my')
@jwt_required()
def my_bookings():
    user     = current_user()
    page     = request.args.get('page', 1, type=int)
    status   = request.args.get('status')
    q = Booking.query.filter_by(customer_id=user.id)
    if status: q = q.filter_by(status=status)
    q = q.order_by(Booking.created_at.desc())
    items, pagination = paginate(q, page, 10)
    return ok([b.to_dict() for b in items],
              pagination=pagination)


@bookings_bp.get('/my/<int:bid>')
@jwt_required()
def my_booking_detail(bid):
    user    = current_user()
    booking = Booking.query.filter_by(id=bid, customer_id=user.id).first_or_404()
    return ok(booking.to_dict())


@bookings_bp.post('/my/<int:bid>/cancel')
@jwt_required()
def cancel_booking(bid):
    user    = current_user()
    booking = Booking.query.filter_by(id=bid, customer_id=user.id).first_or_404()
    if booking.status not in ('pending','confirmed'):
        return err('Booking cannot be cancelled at this stage')
    booking.status        = 'cancelled'
    booking.cancelled_at  = datetime.utcnow()
    booking.cancel_reason = request.get_json().get('reason','Customer cancelled') if request.is_json else 'Customer cancelled'
    db.session.commit()
    audit('BOOKING_CANCELLED', 'bookings', bid)
    return ok(message='Booking cancelled')


@bookings_bp.get('')
@require_roles('super_admin','branch_manager','staff')
def all_bookings():
    page     = request.args.get('page', 1, type=int)
    status   = request.args.get('status')
    search   = request.args.get('search')
    from sqlalchemy import or_
    from app.models.user import User
    q = Booking.query.join(User, Booking.customer_id == User.id)
    if status: q = q.filter(Booking.status == status)
    if search:
        term = f'%{search}%'
        q = q.filter(or_(
            Booking.booking_ref.ilike(term),
            User.first_name.ilike(term),
            User.last_name.ilike(term),
            User.email.ilike(term),
        ))
    q = q.order_by(Booking.created_at.desc())
    items, pagination = paginate(q, page, 20)
    return ok([b.to_dict() for b in items],
              pagination=pagination)


@bookings_bp.get('/<int:bid>')
@require_roles('super_admin','branch_manager','staff')
def booking_detail(bid):
    b = Booking.query.get_or_404(bid)
    return ok(b.to_dict())


@bookings_bp.patch('/<int:bid>/status')
@require_roles('super_admin','branch_manager','staff')
def update_status(bid):
    booking = Booking.query.get_or_404(bid)
    d       = request.get_json() or {}
    status  = d.get('status')
    if status not in Booking.STATUS_FLOW:
        return err(f'Invalid status. Must be one of: {", ".join(Booking.STATUS_FLOW)}')
    old_status      = booking.status
    booking.status  = status
    staff           = current_user()
    if status == 'confirmed':
        booking.approved_by = staff.id
        booking.approved_at = datetime.utcnow()
        if booking.vehicle:
            booking.vehicle.status = 'rented'
    elif status in ('completed','cancelled','rejected'):
        if booking.vehicle:
            booking.vehicle.status = 'available'

    db.session.add(Notification(
        user_id = booking.customer_id,
        title   = f'Booking {status.title()}',
        message = f'Your booking {booking.booking_ref} has been {status}.',
        type    = 'success' if status in ('confirmed','completed') else 'warning',
        link    = f'/bookings/{booking.id}',
    ))
    db.session.commit()
    audit('BOOKING_STATUS_UPDATED', 'bookings', bid, {'from': old_status, 'to': status})
    return ok(booking.to_dict(), f'Booking {status}')
