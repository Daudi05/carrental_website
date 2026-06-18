from app import db
from datetime import datetime


class Coupon(db.Model):
    __tablename__ = 'coupons'
    id            = db.Column(db.Integer, primary_key=True)
    code          = db.Column(db.String(50), unique=True, nullable=False)
    description   = db.Column(db.Text)
    discount_type = db.Column(db.String(20), nullable=False)  # percentage/fixed
    discount_value= db.Column(db.Numeric(10,2), nullable=False)
    min_amount    = db.Column(db.Numeric(10,2), default=0)
    max_discount  = db.Column(db.Numeric(10,2))
    usage_limit   = db.Column(db.Integer)
    used_count    = db.Column(db.Integer, default=0)
    valid_from    = db.Column(db.DateTime, nullable=False)
    valid_until   = db.Column(db.DateTime, nullable=False)
    is_active     = db.Column(db.Boolean, default=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'code': self.code, 'description': self.description,
            'discount_type': self.discount_type, 'discount_value': float(self.discount_value),
            'min_amount': float(self.min_amount), 'is_active': self.is_active,
        }
