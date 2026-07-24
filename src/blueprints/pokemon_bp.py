import os
from flask import Blueprint, request, jsonify
from models import db, Pokemon
from sqlalchemy import select
from utils import APIException

# 1. Definimos el Blueprint (El componente modular)
pokemon_bp = Blueprint('Pokemon', __name__)


@pokemon_bp.route('/pokemon', methods=['GET'])
def get_all_pokemon():
    # Obtenemos la lista de objetos Pokemon desde la base de datos
    pokemon_list = db.session.execute(select(Pokemon)).scalars().all()
    # Convertimos la lista de objetos a una lista de diccionarios usando map
    return jsonify(list(map(lambda p: p.serialize(), pokemon_list))), 200


@pokemon_bp.route('/pokemon/<int:person_id>', methods=['GET'])
def get_pokemon_by_id(person_id):
    # CAMBIO: Usar db.session.get() en lugar de Pokemon.query.get()
    pokemon = db.session.get(Pokemon, person_id)

    # Si el Pokémon no existe, devolvemos un error 404
    if pokemon is None:
        return jsonify({"msg": f"Pokémon with id {person_id} not found"}), 404

    # Si existe, lo serializamos y lo devolvemos con un estado 200
    return jsonify(pokemon.serialize()), 200


@pokemon_bp.route('/pokemon', methods=['POST'])
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


@pokemon_bp.route('/pokemon/<int:person_id>', methods=['DELETE'])
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


@pokemon_bp.route('/pokemon/<int:person_id>', methods=['PUT'])
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
