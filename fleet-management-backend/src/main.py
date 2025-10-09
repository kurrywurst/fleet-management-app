import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

# Initialisiere SQLAlchemy ohne App-Kontext
db = SQLAlchemy()

app = Flask(__name__, static_folder="static", static_url_path="")

# Production configuration for Render
if os.environ.get("FLASK_ENV") == "production":
    # Use Render's assigned port
    port = int(os.environ.get("PORT", 5000))
    # Ensure database directory exists
    db_dir = "/opt/render/project/src/.database"
    # Create the directory if it doesn't exist
    os.makedirs(db_dir, exist_ok=True)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_dir}/app.db"
else:
    # Local development configuration
    port = 5000
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database/app.db"

# Initialisiere db mit der App nach der Konfiguration
db.init_app(app)

# Enable CORS for specific origins
CORS(app, origins=[
    "https://fleet-management-frontend-nu5y.onrender.com", # Ihre Frontend-URL
    "http://localhost:5173" # Für lokale Entwicklung
] )

# Import models and routes after app and db are defined
from models.user import User
from models.vehicle import Vehicle
from models.location import Location
from routes.auth import auth_bp
from routes.vehicle import vehicle_bp
from routes.location import location_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(vehicle_bp, url_prefix="/api/vehicles")
app.register_blueprint(location_bp, url_prefix="/api/locations")

# Serve React App
@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        # Erstelle Standardbenutzer, falls sie nicht existieren
        if not User.query.filter_by(username="manager").first():
            hashed_password = generate_password_hash("test123", method="pbkdf2:sha256")
            manager_user = User(username="manager", password=hashed_password, role="manager")
            db.session.add(manager_user)
            print("Manager user created.")
        
        if not User.query.filter_by(username="fahrer").first():
            hashed_password = generate_password_hash("test123", method="pbkdf2:sha256")
            driver_user = User(username="fahrer", password=hashed_password, role="driver")
            db.session.add(driver_user)
            print("Driver user created.")
        
        db.session.commit()
    
    # Production vs development server configuration
    if os.environ.get("FLASK_ENV") == "production":
        app.run(host="0.0.0.0", port=port)
    else:
        app.run(host="0.0.0.0", port=port, debug=True)
