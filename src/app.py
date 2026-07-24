"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify, request, Blueprint
from flask_migrate import Migrate
from flask_cors import CORS
from utils import APIException, generate_sitemap
from admin import setup_admin
from models import db, User, Pokemon
from sqlalchemy import select, insert, delete
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from blueprints.user_bp import user_bp
from blueprints.pokemon_bp import pokemon_bp


app = Flask(__name__)
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
# Todas las rutas de usuarios comenzarán con /auth (ej: /auth/login)
app.register_blueprint(user_bp, url_prefix='/auth')

# Todas las rutas de pokémon comenzarán con /api (ej: /api/pokemon)
app.register_blueprint(pokemon_bp, url_prefix='/api')


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
