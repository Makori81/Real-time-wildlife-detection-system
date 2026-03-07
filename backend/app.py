"""
================================================================
  backend/app.py  — ENTRY POINT
  Run this file to start the backend server:
    python app.py

  This file just wires everything together.
  The actual logic lives in:
    api/routes.py       → All URL endpoints
    database/db.py      → Database connection & queries
    detection/model.py  → YOLOv11 model + video processing
================================================================
"""

from flask import Flask
from flask_cors import CORS

# Import the routes blueprint (all /api/... endpoints)
from api.routes import api_blueprint

app = Flask(__name__)
CORS(app)  # Allow frontend (different port) to call this backend

# Register all API routes under /api prefix
app.register_blueprint(api_blueprint, url_prefix="/api")

if __name__ == "__main__":
    from database.db import init_database
    import os

    init_database()
    os.makedirs("uploads", exist_ok=True)

    print("🚀 Backend running at http://localhost:5000")
    print("   Frontend should point BACKEND_URL to this address.")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
