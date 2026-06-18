from app import db
from datetime import datetime


class Review(db.Model):
    __tablename__ = 'reviews'
    id          = db.Column(db.Integer, primary_key=True)
    booking_id  = db.Column(db.Integer, db.ForeignKey('bookings.id'), unique=True)
    vehicle_id  = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False, index=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating      = db.Column(db.Integer, nullable=False)  # 1-5
    title       = db.Column(db.String(200))
    comment     = db.Column(db.Text)
    cleanliness = db.Column(db.Integer)
    comfort     = db.Column(db.Integer)
    value       = db.Column(db.Integer)
    service     = db.Column(db.Integer)
    is_approved = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'vehicle_id': self.vehicle_id,
            'rating': self.rating, 'title': self.title, 'comment': self.comment,
            'cleanliness': self.cleanliness, 'comfort': self.comfort,
            'value': self.value, 'service': self.service,
            'author': self.author.to_dict() if self.author else None,
            'created_at': self.created_at.isoformat(),
        }
