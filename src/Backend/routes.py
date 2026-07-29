"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Blueprint
from flask_cors import CORS
from Backend.blueprints.user_bp import user_bp
from Backend.blueprints.pokemon_bp import pokemon_bp

api = Blueprint('api', __name__)

# REGISTRO DE BLUEPRINTS
# Todas las rutas de usuarios comenzarán con /auth (ej: /auth/login)
api.register_blueprint(user_bp, url_prefix='/auth')

# Todas las rutas de pokémon comenzarán con /pok (ej: /pok/pokemon)
api.register_blueprint(pokemon_bp, url_prefix='/pok')
