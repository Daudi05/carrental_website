from flask import Blueprint, request
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app import db
from app.models.user import User, Role
from app.models.vehicle import Vehicle, VehicleCategory
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.branch import Branch
from app.models.maintenance import MaintenanceRecord
from app.models.coupon import Coupon
from app.models.audit import AuditLog
from app.utils import ok, err, require_roles, current_user, paginate, audit

admin_bp = Blueprint('admin', __name__)


@admin_bp.get('/dashboard')
@require_roles('super_admin','branch_manager')
def dashboard():
    now    = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    total_revenue = db.session.query(func.sum(Payment.amount)).filter_by(status='completed').scalar() or 0
    monthly_rev   = db.session.query(func.sum(Payment.amount)).filter(
        Payment.status=='completed', Payment.paid_at >= month_start).scalar() or 0
    total_bookings   = Booking.query.count()
    active_bookings  = Booking.query.filter_by(status='active').count()
    pending_bookings = Booking.query.filter_by(status='pending').count()
    total_vehicles   = Vehicle.query.filter_by(is_active=True).count()
    available_vehicles = Vehicle.query.filter_by(status='available', is_active=True).count()
    total_customers  = User.query.join(Role).filter(Role.name=='customer').count()

    # Revenue last 6 months
    monthly_data = []
    for i in range(5,-1,-1):
        start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0)
        end   = (start + timedelta(days=32)).replace(day=1)
        rev   = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status=='completed', Payment.paid_at >= start, Payment.paid_at < end
        ).scalar() or 0
        bk    = Booking.query.filter(Booking.created_at >= start, Booking.created_at < end).count()
        monthly_data.append({'month': start.strftime('%b %Y'), 'revenue': float(rev), 'bookings': bk})

    # Vehicles by status
    v_status = db.session.query(Vehicle.status, func.count()).filter_by(is_active=True).group_by(Vehicle.status).all()
    # Top vehicles
    top_vehicles = db.session.query(Vehicle, func.count(Booking.id).label('cnt')).join(
        Booking, Booking.vehicle_id == Vehicle.id
    ).group_by(Vehicle.id).order_by(desc('cnt')).limit(5).all()

    recent_bookings = Booking.query.order_by(Booking.created_at.desc()).limit(8).all()

    return ok({
        'metrics': {
            'total_revenue': float(total_revenue), 'monthly_revenue': float(monthly_rev),
            'total_bookings': total_bookings, 'active_bookings': active_bookings,
            'pending_bookings': pending_bookings, 'total_vehicles': total_vehicles,
            'available_vehicles': available_vehicles, 'total_customers': total_customers,
            'utilization_rate': round((total_vehicles - available_vehicles) / total_vehicles * 100, 1) if total_vehicles else 0,
        },
        'monthly_revenue': monthly_data,
        'vehicle_status': [{'status': s, 'count': c} for s, c in v_status],
        'top_vehicles': [{'vehicle': v.to_dict(), 'bookings': cnt} for v, cnt in top_vehicles],
        'recent_bookings': [b.to_dict() for b in recent_bookings],
    })


@admin_bp.get('/users')
@require_roles('super_admin')
def list_users():
    page   = request.args.get('page', 1, type=int)
    role   = request.args.get('role')
    search = request.args.get('search')
    from sqlalchemy import or_
    q = User.query
    if role: q = q.join(Role).filter(Role.name == role)
    if search:
        term = f'%{search}%'
        q = q.filter(or_(User.first_name.ilike(term), User.last_name.ilike(term), User.email.ilike(term)))
    q = q.order_by(User.created_at.desc())
    result = paginate(q, page, 20)
    return ok([u.to_dict() for u in result['items']],
              pagination={k: result[k] for k in ['total','page','pages']})


@admin_bp.patch('/users/<int:uid>/toggle')
@require_roles('super_admin')
def toggle_user(uid):
    u = User.query.get_or_404(uid)
    u.is_active = not u.is_active
    db.session.commit()
    return ok(u.to_dict(), f"User {'activated' if u.is_active else 'deactivated'}")


@admin_bp.post('/users')
@require_roles('super_admin')
def create_staff():
    from app import bcrypt
    d = request.get_json() or {}
    if not all([d.get('first_name'),d.get('last_name'),d.get('email'),d.get('role')]):
        return err('first_name, last_name, email and role required')
    if User.query.filter_by(email=d['email'].lower()).first():
        return err('Email already registered', 409)
    role = Role.query.filter_by(name=d['role']).first()
    if not role: return err('Invalid role')
    pw = bcrypt.generate_password_hash('TempPassword@2025!').decode()
    user = User(first_name=d['first_name'], last_name=d['last_name'],
                email=d['email'].lower(), phone=d.get('phone',''),
                password=pw, role_id=role.id, branch_id=d.get('branch_id'))
    db.session.add(user)
    db.session.commit()
    return ok(user.to_dict(), 'Staff created. Temporary password: TempPassword@2025!', code=201)


@admin_bp.get('/branches')
@require_roles('super_admin','branch_manager')
def list_branches():
    branches = Branch.query.filter_by(is_active=True).all()
    return ok([b.to_dict() for b in branches])


@admin_bp.post('/branches')
@require_roles('super_admin')
def create_branch():
    d = request.get_json() or {}
    if not all([d.get('name'),d.get('code'),d.get('address'),d.get('city'),d.get('country')]):
        return err('Missing required branch fields')
    b = Branch(**{k: d[k] for k in ['name','code','address','city','country','phone','email','latitude','longitude','opening_hours'] if k in d})
    db.session.add(b)
    db.session.commit()
    return ok(b.to_dict(), 'Branch created', code=201)


@admin_bp.get('/maintenance')
@require_roles('super_admin','branch_manager')
def list_maintenance():
    page   = request.args.get('page', 1, type=int)
    q      = MaintenanceRecord.query.order_by(MaintenanceRecord.performed_at.desc())
    result = paginate(q, page, 20)
    return ok([m.to_dict() for m in result['items']],
              pagination={k: result[k] for k in ['total','page','pages']})


@admin_bp.post('/maintenance')
@require_roles('super_admin','branch_manager','staff')
def create_maintenance():
    d = request.get_json() or {}
    if not all([d.get('vehicle_id'),d.get('type'),d.get('performed_at')]):
        return err('vehicle_id, type and performed_at required')
    m = MaintenanceRecord(
        vehicle_id=d['vehicle_id'], type=d['type'],
        description=d.get('description',''), cost=d.get('cost'),
        performed_by=d.get('performed_by'), mileage_at=d.get('mileage_at'),
        performed_at=datetime.fromisoformat(d['performed_at']),
        next_due_date=datetime.fromisoformat(d['next_due_date']) if d.get('next_due_date') else None,
    )
    db.session.add(m)
    v = Vehicle.query.get(d['vehicle_id'])
    if v and d.get('status') == 'in_progress': v.status = 'maintenance'
    db.session.commit()
    return ok(m.to_dict(), 'Maintenance record created', code=201)


@admin_bp.get('/coupons')
@require_roles('super_admin','branch_manager')
def list_coupons():
    coupons = Coupon.query.order_by(Coupon.created_at.desc()).all()
    return ok([c.to_dict() for c in coupons])


@admin_bp.post('/coupons')
@require_roles('super_admin')
def create_coupon():
    d = request.get_json() or {}
    if not all([d.get('code'),d.get('discount_type'),d.get('discount_value'),d.get('valid_from'),d.get('valid_until')]):
        return err('Missing required coupon fields')
    c = Coupon(
        code=d['code'].upper(), description=d.get('description',''),
        discount_type=d['discount_type'], discount_value=float(d['discount_value']),
        min_amount=float(d.get('min_amount',0)),
        max_discount=float(d['max_discount']) if d.get('max_discount') else None,
        usage_limit=d.get('usage_limit'),
        valid_from=datetime.fromisoformat(d['valid_from']),
        valid_until=datetime.fromisoformat(d['valid_until']),
    )
    db.session.add(c)
    db.session.commit()
    return ok(c.to_dict(), 'Coupon created', code=201)


@admin_bp.get('/audit-logs')
@require_roles('super_admin')
def audit_logs():
    page   = request.args.get('page', 1, type=int)
    result = paginate(AuditLog.query.order_by(AuditLog.created_at.desc()), page, 50)
    return ok([l.to_dict() for l in result['items']],
              pagination={k: result[k] for k in ['total','page','pages']})
