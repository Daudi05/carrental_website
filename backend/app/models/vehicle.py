from app import db
from datetime import datetime


class VehicleCategory(db.Model):
    __tablename__ = 'vehicle_categories'
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), unique=True, nullable=False)
    slug        = db.Column(db.String(100), unique=True, nullable=False)
    icon        = db.Column(db.String(100))
    description = db.Column(db.Text)
    vehicles    = db.relationship('Vehicle', backref='category', lazy='dynamic')

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'slug': self.slug, 'icon': self.icon}


class VehicleImage(db.Model):
    __tablename__ = 'vehicle_images'
    id         = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id', ondelete='CASCADE'), nullable=False)
    url        = db.Column(db.Text, nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'id': self.id, 'url': self.url, 'is_primary': self.is_primary}


class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    id               = db.Column(db.Integer, primary_key=True)
    name             = db.Column(db.String(150), nullable=False)
    brand            = db.Column(db.String(100), nullable=False)
    model            = db.Column(db.String(100), nullable=False)
    year             = db.Column(db.Integer, nullable=False)
    category_id      = db.Column(db.Integer, db.ForeignKey('vehicle_categories.id'), nullable=False)
    branch_id        = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=True)
    license_plate    = db.Column(db.String(20), unique=True, nullable=False)
    vin              = db.Column(db.String(50), unique=True)
    color            = db.Column(db.String(50))
    fuel_type        = db.Column(db.String(30))   # petrol/diesel/electric/hybrid
    transmission     = db.Column(db.String(20))   # automatic/manual
    seats            = db.Column(db.Integer)
    doors            = db.Column(db.Integer)
    engine_size      = db.Column(db.String(20))
    mileage          = db.Column(db.Integer, default=0)
    daily_rate       = db.Column(db.Numeric(10, 2), nullable=False)
    weekly_rate      = db.Column(db.Numeric(10, 2))
    monthly_rate     = db.Column(db.Numeric(10, 2))
    deposit_amount   = db.Column(db.Numeric(10, 2))
    description      = db.Column(db.Text)
    features         = db.Column(db.JSON)          # ['GPS','Bluetooth',...]
    status           = db.Column(db.String(20), default='available')  # available/rented/maintenance/retired
    is_featured      = db.Column(db.Boolean, default=False)
    is_active        = db.Column(db.Boolean, default=True)
    rating           = db.Column(db.Float, default=0.0)
    total_reviews    = db.Column(db.Integer, default=0)
    total_bookings   = db.Column(db.Integer, default=0)
    insurance_info   = db.Column(db.JSON)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images           = db.relationship('VehicleImage', backref='vehicle', lazy='joined',
                                       cascade='all, delete-orphan',
                                       primaryjoin='Vehicle.id == VehicleImage.vehicle_id')
    bookings         = db.relationship('Booking', backref='vehicle', lazy='dynamic')
    reviews          = db.relationship('Review', backref='vehicle', lazy='dynamic')
    maintenance_records = db.relationship('MaintenanceRecord', backref='vehicle', lazy='dynamic')

    def primary_image(self):
        p = next((i for i in self.images if i.is_primary), None)
        return p.url if p else (self.images[0].url if self.images else None)

    def to_dict(self, detail=False):
        d = {
            'id': self.id, 'name': self.name, 'brand': self.brand, 'model': self.model,
            'year': self.year, 'category': self.category.to_dict() if self.category else None,
            'color': self.color, 'fuel_type': self.fuel_type, 'transmission': self.transmission,
            'seats': self.seats, 'doors': self.doors,
            'daily_rate': float(self.daily_rate),
            'weekly_rate': float(self.weekly_rate) if self.weekly_rate else None,
            'monthly_rate': float(self.monthly_rate) if self.monthly_rate else None,
            'deposit_amount': float(self.deposit_amount) if self.deposit_amount else None,
            'status': self.status, 'is_featured': self.is_featured,
            'rating': self.rating, 'total_reviews': self.total_reviews,
            'total_bookings': self.total_bookings,
            'primary_image': self.primary_image(),
            'images': [img.to_dict() for img in self.images],
        }
        if detail:
            d.update({
                'description': self.description, 'features': self.features or [],
                'mileage': self.mileage, 'engine_size': self.engine_size,
                'license_plate': self.license_plate, 'vin': self.vin,
                'insurance_info': self.insurance_info, 'branch_id': self.branch_id,
            })
        return d
