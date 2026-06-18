from app import db
from datetime import datetime

class Role(db.Model):
    __tablename__ = 'roles'
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    users       = db.relationship('User', backref='role', lazy='dynamic')

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'description': self.description}


class User(db.Model):
    __tablename__ = 'users'
    id                = db.Column(db.Integer, primary_key=True)
    first_name        = db.Column(db.String(80), nullable=False)
    last_name         = db.Column(db.String(80), nullable=False)
    email             = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone             = db.Column(db.String(20))
    password          = db.Column(db.String(255), nullable=False)
    role_id           = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False, default=4)
    branch_id         = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=True)
    avatar_url        = db.Column(db.Text)
    license_number    = db.Column(db.String(50))
    license_expiry    = db.Column(db.Date)
    date_of_birth     = db.Column(db.Date)
    address           = db.Column(db.Text)
    city              = db.Column(db.String(100))
    country           = db.Column(db.String(100))
    id_number         = db.Column(db.String(50))
    is_active         = db.Column(db.Boolean, default=True, nullable=False)
    is_verified       = db.Column(db.Boolean, default=False, nullable=False)
    email_verified_at = db.Column(db.DateTime)
    login_attempts    = db.Column(db.Integer, default=0)
    locked_until      = db.Column(db.DateTime)
    last_login        = db.Column(db.DateTime)
    stripe_customer_id= db.Column(db.String(100))
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at        = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings          = db.relationship('Booking', backref='customer', lazy='dynamic', foreign_keys='Booking.customer_id')
    reviews           = db.relationship('Review', backref='author', lazy='dynamic')
    notifications     = db.relationship('Notification', backref='user', lazy='dynamic')

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def to_dict(self, include_sensitive=False):
        d = {
            'id': self.id, 'first_name': self.first_name, 'last_name': self.last_name,
            'full_name': self.full_name, 'email': self.email, 'phone': self.phone,
            'role': self.role.to_dict() if self.role else None,
            'avatar_url': self.avatar_url, 'city': self.city, 'country': self.country,
            'is_active': self.is_active, 'is_verified': self.is_verified,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_sensitive:
            d.update({
                'license_number': self.license_number, 'id_number': self.id_number,
                'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
                'license_expiry': self.license_expiry.isoformat() if self.license_expiry else None,
                'address': self.address, 'branch_id': self.branch_id,
            })
        return d

    def __repr__(self):
        return f'<User {self.email}>'
