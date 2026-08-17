"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from Backend.utils import APIException, generate_sitemap
from Backend.admin import setup_admin
from Backend.models import db
from flask_jwt_extended import JWTManager
from Backend.routes import api
from Backend.extensions import bcrypt

load_dotenv()

app = Flask(__name__)

CORS(app)

# Nota: este fallback es para trabajar en modo local desde VS Code/localhost.
app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY', 'local-dev-secret-key')

jwt = JWTManager(app)

# UNIÓN OFICIAL: Aquí le inyectamos el motor Flask a Bcrypt
bcrypt.init_app(app)

app.url_map.strict_slashes = False

db_url = os.getenv("DATABASE_URL")
if db_url is not None and not db_url.startswith("sqlite:///"):
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    # Bloque especial para Windows Local
    base_dir = os.path.abspath(os.path.dirname(__file__))
    instance_dir = os.path.join(base_dir, 'instance')

    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir)

    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(instance_dir, 'example.db')}"

MIGRATE = Migrate(app, db)
db.init_app(app)
CORS(app)
setup_admin(app)


# REGISTRO DE BLUEPRINTS
# Registramos el blueprint maestro 'api' que viene de routes.py
app.register_blueprint(api, url_prefix='/api')


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    return generate_sitemap(app)


# this only runs if `$ python src/app.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=PORT, debug=False)
