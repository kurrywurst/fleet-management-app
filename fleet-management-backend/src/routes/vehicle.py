from flask import Blueprint, request, jsonify, session
from models.user import db
from models.vehicle import Vehicle
from datetime import datetime
import qrcode
import io
import base64

vehicle_bp = Blueprint('vehicle', __name__)

def require_auth():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

def require_manager():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    if session.get('role') != 'manager':
        return jsonify({'error': 'Manager role required'}), 403
    return None

@vehicle_bp.route('/vehicles', methods=['GET'])
def get_vehicles():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    vehicles = Vehicle.query.all()
    return jsonify([vehicle.to_dict() for vehicle in vehicles]), 200

@vehicle_bp.route('/vehicles', methods=['POST'])
def create_vehicle():
    manager_error = require_manager()
    if manager_error:
        return manager_error
    
    data = request.get_json()
    vehicle_number = data.get('vehicle_number')
    license_plate = data.get('license_plate')
    model = data.get('model')
    tuv_date_str = data.get('tuv_date')
    
    if not all([vehicle_number, license_plate, model, tuv_date_str]):
        return jsonify({'error': 'All fields required'}), 400
    
    try:
        tuv_date = datetime.strptime(tuv_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    if Vehicle.query.filter_by(vehicle_number=vehicle_number).first():
        return jsonify({'error': 'Vehicle number already exists'}), 400
    
    if Vehicle.query.filter_by(license_plate=license_plate).first():
        return jsonify({'error': 'License plate already exists'}), 400
    
    vehicle = Vehicle(
        vehicle_number=vehicle_number,
        license_plate=license_plate,
        model=model,
        tuv_date=tuv_date
    )
    
    db.session.add(vehicle)
    db.session.commit()
    
    return jsonify({
        'message': 'Vehicle created successfully',
        'vehicle': vehicle.to_dict()
    }), 201

@vehicle_bp.route('/vehicles/<int:vehicle_id>/qr', methods=['GET'])
def get_vehicle_qr(vehicle_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    
    # QR Code content: vehicle_id and license_plate
    qr_data = f"{vehicle.id}|{vehicle.license_plate}"
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_str = base64.b64encode(img_buffer.getvalue()).decode()
    
    return jsonify({
        'vehicle': vehicle.to_dict(),
        'qr_code': f"data:image/png;base64,{img_str}",
        'qr_data': qr_data
    }), 200

@vehicle_bp.route('/vehicles/<int:vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    manager_error = require_manager()
    if manager_error:
        return manager_error
    
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    
    return jsonify({'message': 'Vehicle deleted successfully'}), 200

