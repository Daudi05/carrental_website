from app import db
from datetime import datetime


class Payment(db.Model):
    __tablename__ = 'payments'
    id              = db.Column(db.Integer, primary_key=True)
    payment_ref     = db.Column(db.String(30), unique=True, nullable=False)
    booking_id      = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False, index=True)
    customer_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount          = db.Column(db.Numeric(12,2), nullable=False)
    currency        = db.Column(db.String(10), default='USD')
    method          = db.Column(db.String(30))  # stripe/paypal/mpesa/cash
    status          = db.Column(db.String(20), default='pending')  # pending/completed/failed/refunded
    gateway_ref     = db.Column(db.String(200))
    gateway_response= db.Column(db.JSON)
    paid_at         = db.Column(db.DateTime)
    refunded_at     = db.Column(db.DateTime)
    refund_amount   = db.Column(db.Numeric(12,2))
    notes           = db.Column(db.Text)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'payment_ref': self.payment_ref,
            'booking_id': self.booking_id, 'amount': float(self.amount),
            'currency': self.currency, 'method': self.method, 'status': self.status,
            'gateway_ref': self.gateway_ref,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat(),
        }
