from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import db
from app.models.vehicle import Vehicle, VehicleCategory
from app.models.branch import Branch
from app.models.notification import Notification
from app.utils import ok

public_bp = Blueprint('public', __name__)


@public_bp.get('/stats')
def stats():
    from app.models.booking import Booking
    from app.models.user import User, Role
    from app.models.payment import Payment
    from sqlalchemy import func
    total_vehicles  = Vehicle.query.filter_by(is_active=True).count()
    total_customers = User.query.join(Role).filter(Role.name=='customer').count()
    total_bookings  = Booking.query.filter(Booking.status.in_(['completed','active'])).count()
    total_branches  = Branch.query.filter_by(is_active=True).count()
    return ok({'vehicles': total_vehicles, 'customers': total_customers,
               'bookings': total_bookings, 'branches': total_branches, 'years': 5})


@public_bp.get('/notifications')
@jwt_required(optional=True)
def notifications():
    uid    = get_jwt_identity()
    notifs = Notification.query.filter_by(user_id=uid).order_by(Notification.created_at.desc()).limit(20).all()
    unread = sum(1 for n in notifs if not n.is_read)
    return ok({'notifications': [n.to_dict() for n in notifs], 'unread': unread})


@public_bp.patch('/notifications/<int:nid>/read')
@jwt_required(optional=True)
def mark_read(nid):
    uid = get_jwt_identity(optional=True)
    n   = Notification.query.filter_by(id=nid, user_id=uid).first_or_404()
    n.is_read = True
    db.session.commit()
    return ok(message='Marked as read')


@public_bp.get('/locations')
def locations():
    branches = Branch.query.filter_by(is_active=True).all()
    return ok([b.to_dict() for b in branches])
