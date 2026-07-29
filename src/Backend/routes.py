"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify, request, Blueprint
from flask_migrate import Migrate
from flask_cors import CORS
from Backend.utils import APIException, generate_sitemap
from Backend.admin import setup_admin
from Backend.models import db
from sqlalchemy import select, insert, delete
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from Backend.blueprints.user_bp import user_bp
from Backend.blueprints.pokemon_bp import pokemon_bp

api = Blueprint('api', __name__)

# Agrega esta línea justo aquí abajo para activar los permisos de CORS
CORS(api)


# REGISTRO DE BLUEPRINTS
# Todas las rutas de usuarios comenzarán con /auth (ej: /auth/login)
api.register_blueprint(user_bp, url_prefix='/auth')

# Todas las rutas de pokémon comenzarán con /pok (ej: /pok/pokemon)
api.register_blueprint(pokemon_bp, url_prefix='/pok')
