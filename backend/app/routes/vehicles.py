from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy import or_, desc, asc, and_
from datetime import datetime
from app import db
from app.models.vehicle import Vehicle, VehicleImage, VehicleCategory
from app.models.booking import Booking
from app.utils import ok, err, created, current_user, require_roles, paginate, audit

vehicles_bp = Blueprint('vehicles', __name__)


@vehicles_bp.get('/categories')
def categories():
    cats = VehicleCategory.query.all()
    return ok([c.to_dict() for c in cats])


@vehicles_bp.get('')
def list_vehicles():
    page       = request.args.get('page', 1, type=int)
    per_page   = min(request.args.get('per_page', 12, type=int), 50)
    category   = request.args.get('category')
    brand      = request.args.get('brand')
    fuel_type  = request.args.get('fuel_type')
    transmission=request.args.get('transmission')
    seats      = request.args.get('seats', type=int)
    min_price  = request.args.get('min_price', type=float)
    max_price  = request.args.get('max_price', type=float)
    search     = request.args.get('search')
    sort       = request.args.get('sort', 'newest')
    featured   = request.args.get('featured')
    pickup     = request.args.get('pickup_date')
    returndt   = request.args.get('return_date')

    q = Vehicle.query.filter_by(is_active=True)

    if category:
        cat = VehicleCategory.query.filter_by(slug=category).first()
        if cat: q = q.filter_by(category_id=cat.id)
    if brand: q = q.filter(Vehicle.brand.ilike(f'%{brand}%'))
    if fuel_type: q = q.filter_by(fuel_type=fuel_type)
    if transmission: q = q.filter_by(transmission=transmission)
    if seats: q = q.filter(Vehicle.seats >= seats)
    if min_price: q = q.filter(Vehicle.daily_rate >= min_price)
    if max_price: q = q.filter(Vehicle.daily_rate <= max_price)
    if featured: q = q.filter_by(is_featured=True)
    if search:
        term = f'%{search}%'
        q = q.filter(or_(
            Vehicle.name.ilike(term), Vehicle.brand.ilike(term),
            Vehicle.model.ilike(term), Vehicle.description.ilike(term),
        ))

    # Check availability for dates
    if pickup and returndt:
        try:
            pd = datetime.fromisoformat(pickup)
            rd = datetime.fromisoformat(returndt)
            booked_ids = db.session.query(Booking.vehicle_id).filter(
                and_(
                    Booking.status.in_(['confirmed','active']),
                    Booking.pickup_date < rd,
                    Booking.return_date > pd,
                )
            ).all()
            booked_ids = [b[0] for b in booked_ids]
            if booked_ids:
                q = q.filter(~Vehicle.id.in_(booked_ids))
        except: pass

    sort_map = {
        'newest': desc(Vehicle.created_at), 'oldest': asc(Vehicle.created_at),
        'price_asc': asc(Vehicle.daily_rate), 'price_desc': desc(Vehicle.daily_rate),
        'rating': desc(Vehicle.rating), 'popular': desc(Vehicle.total_bookings),
    }
    q = q.order_by(sort_map.get(sort, desc(Vehicle.created_at)))

    items, pagination = paginate(q, page, per_page)
    return ok(
        [v.to_dict() for v in items],
        pagination=pagination
    )


@vehicles_bp.get('/<int:vid>')
def get_vehicle(vid):
    v = Vehicle.query.filter_by(id=vid, is_active=True).first_or_404()
    return ok(v.to_dict(detail=True))


@vehicles_bp.get('/<int:vid>/availability')
def check_availability(vid):
    pickup   = request.args.get('pickup_date')
    returndt = request.args.get('return_date')
    if not pickup or not returndt:
        return err('pickup_date and return_date required')
    try:
        pd = datetime.fromisoformat(pickup)
        rd = datetime.fromisoformat(returndt)
    except: return err('Invalid date format')

    conflict = Booking.query.filter(
        and_(
            Booking.vehicle_id == vid,
            Booking.status.in_(['confirmed','active']),
            Booking.pickup_date < rd,
            Booking.return_date > pd,
        )
    ).first()
    return ok({'available': conflict is None})


@vehicles_bp.post('')
@require_roles('super_admin','branch_manager')
def create_vehicle():
    d = request.get_json() or {}
    required = ['name','brand','model','year','category_id','license_plate','daily_rate']
    if not all(d.get(f) for f in required):
        return err(f'Missing required fields: {", ".join(required)}')
    if Vehicle.query.filter_by(license_plate=d['license_plate']).first():
        return err('License plate already exists', 409)

    v = Vehicle(
        name=d['name'], brand=d['brand'], model=d['model'], year=int(d['year']),
        category_id=d['category_id'], license_plate=d['license_plate'],
        vin=d.get('vin'), color=d.get('color'), fuel_type=d.get('fuel_type'),
        transmission=d.get('transmission'), seats=d.get('seats'), doors=d.get('doors'),
        engine_size=d.get('engine_size'), mileage=d.get('mileage',0),
        daily_rate=float(d['daily_rate']),
        weekly_rate=float(d['weekly_rate']) if d.get('weekly_rate') else None,
        monthly_rate=float(d['monthly_rate']) if d.get('monthly_rate') else None,
        deposit_amount=float(d['deposit_amount']) if d.get('deposit_amount') else None,
        description=d.get('description'), features=d.get('features',[]),
        is_featured=d.get('is_featured',False), branch_id=d.get('branch_id'),
        insurance_info=d.get('insurance_info'),
    )
    db.session.add(v)
    db.session.flush()

    for i, url in enumerate(d.get('images',[])):
        db.session.add(VehicleImage(vehicle_id=v.id, url=url, is_primary=(i==0)))

    db.session.commit()
    audit('VEHICLE_CREATED', 'vehicles', v.id)
    return created(v.to_dict(detail=True), 'Vehicle created successfully')


@vehicles_bp.put('/<int:vid>')
@require_roles('super_admin','branch_manager')
def update_vehicle(vid):
    v = Vehicle.query.get_or_404(vid)
    d = request.get_json() or {}
    for f in ['name','brand','model','color','fuel_type','transmission','seats','doors',
              'engine_size','description','features','is_featured','status',
              'is_active','branch_id','insurance_info']:
        if f in d: setattr(v, f, d[f])
    for f in ['daily_rate','weekly_rate','monthly_rate','deposit_amount','mileage']:
        if f in d: setattr(v, f, float(d[f]) if d[f] else None)
    if 'images' in d:
        VehicleImage.query.filter_by(vehicle_id=v.id).delete()
        for i, url in enumerate(d['images']):
            db.session.add(VehicleImage(vehicle_id=v.id, url=url, is_primary=(i==0)))
    db.session.commit()
    audit('VEHICLE_UPDATED', 'vehicles', vid)
    return ok(v.to_dict(detail=True), 'Vehicle updated')


@vehicles_bp.delete('/<int:vid>')
@require_roles('super_admin')
def delete_vehicle(vid):
    v = Vehicle.query.get_or_404(vid)
    v.is_active = False
    db.session.commit()
    audit('VEHICLE_DELETED', 'vehicles', vid)
    return ok(message='Vehicle removed')


@vehicles_bp.get('/brands')
def brands():
    brands = db.session.query(Vehicle.brand).filter_by(is_active=True).distinct().all()
    return ok([b[0] for b in brands if b[0]])
