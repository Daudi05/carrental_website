from app import db
from datetime import datetime


class Branch(db.Model):
    __tablename__ = 'branches'
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(150), nullable=False)
    code        = db.Column(db.String(20), unique=True, nullable=False)
    address     = db.Column(db.Text, nullable=False)
    city        = db.Column(db.String(100), nullable=False)
    country     = db.Column(db.String(100), nullable=False)
    phone       = db.Column(db.String(20))
    email       = db.Column(db.String(255))
    latitude    = db.Column(db.Float)
    longitude   = db.Column(db.Float)
    opening_hours = db.Column(db.JSON)
    is_active   = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    vehicles    = db.relationship('Vehicle', backref='branch', lazy='dynamic')
    bookings    = db.relationship('Booking', backref='branch', lazy='dynamic')
    staff       = db.relationship('User', backref='branch', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'code': self.code,
            'address': self.address, 'city': self.city, 'country': self.country,
            'phone': self.phone, 'email': self.email,
            'latitude': self.latitude, 'longitude': self.longitude,
            'opening_hours': self.opening_hours, 'is_active': self.is_active,
        }
