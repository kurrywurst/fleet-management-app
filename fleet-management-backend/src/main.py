import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.models.vehicle import Vehicle
from src.models.location import Location
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.vehicle import vehicle_bp
from src.routes.location import location_bp

app = Flask(__name__, static_folder='static', static_url_path='')
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Production configuration for Render
if os.environ.get('FLASK_ENV') == 'production':
    # Use Render\'s assigned port
    port = int(os.environ.get('PORT', 5000))
    # Ensure database directory exists
    db_dir = '/opt/render/project/src/database'
    os.makedirs(db_dir, exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_dir}/app.db'
else:
    # Local development configuration
    port = 5000
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_dir}/app.db'


# Enable CORS for all routes
CORS(app, origins="*") # oder CORS(app, origins=['http://localhost:5173', 'https://your-frontend-url.onrender.com']
# Your existing configuration and routes...

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Production vs development server configuration
    if os.environ.get('FLASK_ENV') == 'production':
        app.run(host='0.0.0.0', port=port)
    else:
        app.run(host='0.0.0.0', port=port, debug=True)


# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(vehicle_bp, url_prefix='/api')
app.register_blueprint(location_bp, url_prefix='/api')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
