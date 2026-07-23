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


# ==========================================
# REGISTRO DE BLUEPRINTS
# ==========================================
# Todas las rutas de usuarios comenzarán con /auth (ej: /auth/login)
app.register_blueprint(user_bp, url_prefix='/auth')

# Todas las rutas de pokémon comenzarán con /api (ej: /api/pokemon)
app.register_blueprint(pokemon_bp, url_prefix='/api')
# ==========================================


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    return generate_sitemap(app)


@app.route('/pokemon', methods=['GET'])
def get_all_pokemon():
    # Obtenemos la lista de objetos Pokemon desde la base de datos
    pokemon_list = db.session.execute(select(Pokemon)).scalars().all()
    # Convertimos la lista de objetos a una lista de diccionarios usando map
    return jsonify(list(map(lambda p: p.serialize(), pokemon_list))), 200


@app.route('/pokemon/<int:person_id>', methods=['GET'])
def get_pokemon_by_id(person_id):
    # Buscamos el Pokémon en la base de datos usando su ID
    pokemon = Pokemon.query.get(person_id)

    # Si el Pokémon no existe, devolvemos un error 404
    if pokemon is None:
        return jsonify({"msg": f"Pokémon with id {person_id} not found"}), 404

    # Si existe, lo serializamos y lo devolvemos con un estado 200
    return jsonify(pokemon.serialize()), 200


@app.route('/pokemon', methods=['POST'])
def create_pokemon():
    # 1. Obtener los datos en formato JSON enviados desde Postman
    body = request.get_json()

    # 2. Validar que el cuerpo de la petición no esté vacío
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    # 3. Validar que el campo obligatorio 'people_name' exista en el JSON
    if 'people_name' not in body or body['people_name'].strip() == "":
        raise APIException(
            "El campo 'people_name' es obligatorio y no puede estar vacío", status_code=400)

    # 4. Verificar si ya existe un Pokémon con ese mismo nombre (para evitar errores en la base de datos)
    exist_person = Pokemon.query.filter_by(
        people_name=body['people_name']).first()
    if exist_person is not None:
        raise APIException(
            f"El personaje '{body['people_name']}' ya existe en la base de datos", status_code=400)

    try:
        # 5. Crear la nueva instancia de nuestro modelo Pokemon
        new_person = Pokemon(people_name=body['people_name'])

        # 6. Guardar el nuevo registro en la base de datos PostgreSQL
        db.session.add(new_person)
        db.session.commit()

        # 7. Responder al cliente con el personaje creado serializado y un estado 201 (Created)
        return jsonify({
            "message": "Personaje creado con éxito",
            "results": new_person.serialize()
        }), 201

    except Exception as e:
        # En caso de un fallo inesperado del servidor o base de datos, revertimos los cambios
        db.session.rollback()
        raise APIException(
            f"Error interno del servidor: {str(e)}", status_code=500)


@app.route('/pokemon/<int:person_id>', methods=['DELETE'])
def delete_pokemon(person_id):
    # 1. Buscar el Pokémon en la base de datos por su ID utilizando select
    pokemon = db.session.execute(select(Pokemon).filter_by(
        id=person_id)).scalar_one_or_none()

    # También puedes usar la sintaxis clásica si no tienes el 'select' importado de esa forma:
    # person = Pokemon.query.get(person_id)

    # 2. Validar si el Pokémon existe
    if pokemon is None:
        raise APIException(
            f"El personaje con ID {person_id} no existe", status_code=404)

    try:
        # 3. Eliminar el registro de la sesión y confirmar el cambio
        db.session.delete(pokemon)
        db.session.commit()

        # 4. Responder al cliente que el borrado fue exitoso
        return jsonify({
            "message": f"Personaje '{pokemon.people_name}' eliminado con éxito",
            "id_deleted": person_id
        }), 200

    except Exception as e:
        # En caso de error, hacemos rollback para no dejar la sesión en un estado corrupto
        db.session.rollback()
        raise APIException(
            f"Error interno al eliminar el personaje: {str(e)}", status_code=500)


@app.route('/pokemon/<int:person_id>', methods=['PUT'])
def update_pokemon(person_id):
    body = request.get_json()

    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    if 'people_name' not in body or body['people_name'].strip() == "":
        raise APIException(
            "El campo 'people_name' es obligatorio y no puede estar vacío", status_code=400)

    pokemon = Pokemon.query.get(person_id)
    if pokemon is None:
        return jsonify({"msg": f"Pokémon with id {person_id} not found"}), 404

    try:
        pokemon.people_name = body['people_name']

        db.session.commit()

        return jsonify({
            "message": "Pokémon actualizado con éxito",
            "results": pokemon.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(f"Error interno: {str(e)}", status_code=500)


# this only runs if `$ python src/app.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=PORT, debug=False)
