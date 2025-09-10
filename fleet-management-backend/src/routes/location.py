from flask import Blueprint, request, jsonify, session
from src.models.user import db
from src.models.vehicle import Vehicle
from src.models.location import Location

location_bp = Blueprint('location', __name__)

def require_auth():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@location_bp.route('/scan', methods=['POST'])
def scan_qr_code():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    data = request.get_json()
    qr_data = data.get('qr_data')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    address = data.get('address', '')
    
    if not all([qr_data, latitude, longitude]):
        return jsonify({'error': 'QR data, latitude and longitude required'}), 400
    
    try:
        # Parse QR data: vehicle_id|license_plate
        parts = qr_data.split('|')
        if len(parts) != 2:
            return jsonify({'error': 'Invalid QR code format'}), 400
        
        vehicle_id = int(parts[0])
        license_plate = parts[1]
        
        # Verify vehicle exists and license plate matches
        vehicle = Vehicle.query.get(vehicle_id)
        if not vehicle or vehicle.license_plate != license_plate:
            return jsonify({'error': 'Invalid vehicle QR code'}), 400
        
        # Create location record
        location = Location(
            vehicle_id=vehicle_id,
            latitude=float(latitude),
            longitude=float(longitude),
            address=address,
            scanned_by=session['username']
        )
        
        db.session.add(location)
        db.session.commit()
        
        return jsonify({
            'message': 'Location recorded successfully',
            'location': location.to_dict(),
            'vehicle': vehicle.to_dict()
        }), 201
        
    except (ValueError, IndexError):
        return jsonify({'error': 'Invalid QR code or coordinates'}), 400

@location_bp.route('/locations', methods=['GET'])
def get_all_locations():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Get latest location for each vehicle
    subquery = db.session.query(
        Location.vehicle_id,
        db.func.max(Location.scanned_at).label('latest_scan')
    ).group_by(Location.vehicle_id).subquery()
    
    latest_locations = db.session.query(Location).join(
        subquery,
        db.and_(
            Location.vehicle_id == subquery.c.vehicle_id,
            Location.scanned_at == subquery.c.latest_scan
        )
    ).all()
    
    result = []
    for location in latest_locations:
        location_dict = location.to_dict()
        location_dict['vehicle'] = location.vehicle.to_dict()
        result.append(location_dict)
    
    return jsonify(result), 200

@location_bp.route('/vehicles/<int:vehicle_id>/locations', methods=['GET'])
def get_vehicle_locations(vehicle_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    locations = Location.query.filter_by(vehicle_id=vehicle_id).order_by(Location.scanned_at.desc()).all()
    
    return jsonify({
        'vehicle': vehicle.to_dict(),
        'locations': [location.to_dict() for location in locations]
    }), 200

