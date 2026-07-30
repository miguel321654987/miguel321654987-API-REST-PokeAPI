"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Blueprint
from Backend.blueprints.user_bp import user_bp
from Backend.blueprints.pokemon_bp import pokemon_bp
from Backend.blueprints.favorites_bp import favorites_bp

api = Blueprint('api', __name__)

# REGISTRO DE BLUEPRINTS
# REGISTRO DE BLUEPRINTS
api.register_blueprint(user_bp, url_prefix='/auth')
api.register_blueprint(pokemon_bp, url_prefix='/pok')
api.register_blueprint(favorites_bp, url_prefix='/favorites')
