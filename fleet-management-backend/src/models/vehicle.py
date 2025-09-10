from src.models.user import db
from datetime import datetime

class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vehicle_number = db.Column(db.String(20), unique=True, nullable=False)
    license_plate = db.Column(db.String(20), unique=True, nullable=False)
    model = db.Column(db.String(100), nullable=False)
    tuv_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Vehicle {self.vehicle_number} - {self.license_plate}>'

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_number': self.vehicle_number,
            'license_plate': self.license_plate,
            'model': self.model,
            'tuv_date': self.tuv_date.isoformat() if self.tuv_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

