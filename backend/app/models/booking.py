from app import db
from datetime import datetime
import random, string


class BookingAddon(db.Model):
    __tablename__ = 'booking_addons'
    id         = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'))
    name       = db.Column(db.String(100), nullable=False)
    price      = db.Column(db.Numeric(10,2), nullable=False)


class Booking(db.Model):
    __tablename__ = 'bookings'
    id                  = db.Column(db.Integer, primary_key=True)
    booking_ref         = db.Column(db.String(20), unique=True, nullable=False, index=True)
    customer_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    vehicle_id          = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False, index=True)
    branch_id           = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=True)
    pickup_location     = db.Column(db.String(255), nullable=False)
    dropoff_location    = db.Column(db.String(255), nullable=False)
    pickup_date         = db.Column(db.DateTime, nullable=False)
    return_date         = db.Column(db.DateTime, nullable=False)
    actual_return_date  = db.Column(db.DateTime)
    duration_days       = db.Column(db.Integer, nullable=False)
    base_amount         = db.Column(db.Numeric(12,2), nullable=False)
    addon_amount        = db.Column(db.Numeric(12,2), default=0)
    discount_amount     = db.Column(db.Numeric(12,2), default=0)
    tax_amount          = db.Column(db.Numeric(12,2), default=0)
    total_amount        = db.Column(db.Numeric(12,2), nullable=False)
    deposit_amount      = db.Column(db.Numeric(12,2), default=0)
    coupon_code         = db.Column(db.String(50))
    status              = db.Column(db.String(30), default='pending', index=True)
    # pending/confirmed/active/completed/cancelled/rejected
    driver_name         = db.Column(db.String(150))
    driver_license      = db.Column(db.String(50))
    special_requests    = db.Column(db.Text)
    pickup_odometer     = db.Column(db.Integer)
    return_odometer     = db.Column(db.Integer)
    fuel_level_pickup   = db.Column(db.String(20))
    fuel_level_return   = db.Column(db.String(20))
    damage_notes        = db.Column(db.Text)
    approved_by         = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at         = db.Column(db.DateTime)
    cancelled_at        = db.Column(db.DateTime)
    cancel_reason       = db.Column(db.Text)
    created_at          = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at          = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    addons    = db.relationship('BookingAddon', backref='booking', cascade='all, delete-orphan')
    payments  = db.relationship('Payment', backref='booking', lazy='dynamic')
    review    = db.relationship('Review', backref='booking', uselist=False)

    STATUS_FLOW = ['pending','confirmed','active','completed','cancelled','rejected']

    def to_dict(self):
        return {
            'id': self.id, 'booking_ref': self.booking_ref,
            'customer_id': self.customer_id,
            'customer': self.customer.to_dict() if self.customer else None,
            'vehicle': self.vehicle.to_dict() if self.vehicle else None,
            'pickup_location': self.pickup_location, 'dropoff_location': self.dropoff_location,
            'pickup_date': self.pickup_date.isoformat(), 'return_date': self.return_date.isoformat(),
            'duration_days': self.duration_days,
            'base_amount': float(self.base_amount),
            'addon_amount': float(self.addon_amount or 0),
            'discount_amount': float(self.discount_amount or 0),
            'tax_amount': float(self.tax_amount or 0),
            'total_amount': float(self.total_amount),
            'deposit_amount': float(self.deposit_amount or 0),
            'status': self.status, 'special_requests': self.special_requests,
            'coupon_code': self.coupon_code,
            'addons': [{'name': a.name, 'price': float(a.price)} for a in self.addons],
            'created_at': self.created_at.isoformat(),
        }

    @staticmethod
    def generate_ref():
        chars = string.ascii_uppercase + string.digits
        return 'CR' + ''.join(random.choices(chars, k=8))
