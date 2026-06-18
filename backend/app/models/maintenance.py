from app import db
from datetime import datetime


class MaintenanceRecord(db.Model):
    __tablename__ = 'maintenance_records'
    id            = db.Column(db.Integer, primary_key=True)
    vehicle_id    = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False, index=True)
    type          = db.Column(db.String(100), nullable=False)
    description   = db.Column(db.Text)
    cost          = db.Column(db.Numeric(10,2))
    performed_by  = db.Column(db.String(150))
    performed_at  = db.Column(db.DateTime, nullable=False)
    next_due_date = db.Column(db.DateTime)
    mileage_at    = db.Column(db.Integer)
    status        = db.Column(db.String(20), default='completed')
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'vehicle_id': self.vehicle_id, 'type': self.type,
            'description': self.description, 'cost': float(self.cost) if self.cost else None,
            'performed_by': self.performed_by,
            'performed_at': self.performed_at.isoformat(),
            'next_due_date': self.next_due_date.isoformat() if self.next_due_date else None,
            'status': self.status,
        }
