from models.user import db
from datetime import datetime

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(255), nullable=True)
    scanned_by = db.Column(db.String(80), nullable=False)
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow)

    vehicle = db.relationship('Vehicle', backref=db.backref('locations', lazy=True))

    def __repr__(self):
        return f'<Location Vehicle:{self.vehicle_id} at {self.latitude},{self.longitude}>'

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'scanned_by': self.scanned_by,
            'scanned_at': self.scanned_at.isoformat() if self.scanned_at else None
        }

