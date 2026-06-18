from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app import db
from app.models.review import Review
from app.models.vehicle import Vehicle
from app.models.booking import Booking
from app.utils import ok, err, created, current_user, paginate

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.get('/vehicle/<int:vid>')
def vehicle_reviews(vid):
    page = request.args.get('page', 1, type=int)
    from sqlalchemy import desc
    q = Review.query.filter_by(vehicle_id=vid, is_approved=True).order_by(desc(Review.created_at))
    items, pagination = paginate(q, page, 10)
    return ok(
        [r.to_dict() for r in items],
        pagination=pagination
    )

@reviews_bp.post('')
@jwt_required()
def create_review():
    user = current_user()
    d    = request.get_json() or {}
    booking_id = d.get('booking_id')
    rating     = d.get('rating')
    if not booking_id or not rating:
        return err('booking_id and rating required')
    if not (1 <= int(rating) <= 5):
        return err('Rating must be between 1 and 5')

    booking = Booking.query.filter_by(id=booking_id, customer_id=user.id, status='completed').first()
    if not booking: return err('No completed booking found', 404)
    if Review.query.filter_by(booking_id=booking.id).first():
        return err('Review already submitted for this booking', 409)

    review = Review(
        booking_id  = booking.id,
        vehicle_id  = booking.vehicle_id,
        user_id     = user.id,
        rating      = int(rating),
        title       = d.get('title',''),
        comment     = d.get('comment',''),
        cleanliness = d.get('cleanliness'),
        comfort     = d.get('comfort'),
        value       = d.get('value'),
        service     = d.get('service'),
    )
    db.session.add(review)
    db.session.flush()

    # Update vehicle rating
    vehicle  = booking.vehicle
    reviews  = Review.query.filter_by(vehicle_id=vehicle.id, is_approved=True).all()
    avg      = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    vehicle.rating       = round(avg, 1)
    vehicle.total_reviews = len(reviews)
    db.session.commit()
    return created(review.to_dict(), 'Review submitted')
