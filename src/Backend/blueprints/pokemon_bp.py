import os
from flask import Blueprint, request, jsonify
from models import db, Pokemon
from sqlalchemy import select
from utils import APIException

# 1. Definimos el Blueprint (El componente modular)
pokemon_bp = Blueprint('Pokemon', __name__)


@pokemon_bp.route('/pokemon', methods=['GET'])
def get_all_pokemon():
    # Estilo SQLAlchemy 2.0: Usamos select y db.session.scalars()
    stmt = select(Pokemon)
    pokemon_query = db.session.scalars(stmt).all()

    # Validamos si la lista está vacía
    if not pokemon_query:
        return jsonify({
            "message": "No se encontraron Pokémon en la base de datos",
            "results": []
        }), 200

    # Comprensión de listas: más limpio y rápido que map + lambda
    all_pokemon = [pokemon.serialize() for pokemon in pokemon_query]

    return jsonify({
        "message": "Pokémon obtenidos con éxito",
        "results": all_pokemon,
        "total_pokemon": len(all_pokemon)
    }), 200


@pokemon_bp.route('/pokemon/<int:pokemon_id>', methods=['GET'])
def get_pokemon_by_id(pokemon_id):
    # CORRECCIÓN: Renombrado person_id a pokemon_id por coherencia semántica
    pokemon = db.session.get(Pokemon, pokemon_id)

    # UNIFICADO: Lanza APIException para que lo capture el errorhandler de app.py
    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no fue encontrado", status_code=404)

    # Estructura de respuesta exitosa consistente con el resto de la API
    return jsonify({
        "message": "Pokémon obtenido con éxito",
        "results": pokemon.serialize()
    }), 200


@pokemon_bp.route('/pokemon', methods=['POST'])
def create_pokemon():
    body = request.get_json()

    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    if 'pokemon_name' not in body or body['pokemon_name'].strip() == "":
        raise APIException(
            "El campo 'pokemon_name' es obligatorio y no puede estar vacío", status_code=400)

    # ACTUALIZACIÓN: Cambiado Pokemon.query.filter_by por select() estilo 2.0
    stmt = select(Pokemon).filter_by(pokemon_name=body['pokemon_name'].strip())
    exist_pokemon = db.session.scalars(stmt).first()

    if exist_pokemon is not None:
        raise APIException(
            f"El Pokémon '{body['pokemon_name'].strip()}' ya existe en la base de datos", status_code=400)

    try:
        new_pokemon = Pokemon(pokemon_name=body['pokemon_name'].strip())

        db.session.add(new_pokemon)
        db.session.commit()

        return jsonify({
            "message": "Pokémon creado con éxito",
            "results": new_pokemon.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno del servidor al crear el Pokémon: {str(e)}", status_code=500)


@pokemon_bp.route('/pokemon/<int:pokemon_id>', methods=['DELETE'])
def delete_pokemon(pokemon_id):
    # ACTUALIZACIÓN: db.session.get() es el estándar 2.0 para buscar por ID
    pokemon = db.session.get(Pokemon, pokemon_id)

    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no existe", status_code=404)

    try:
        db.session.delete(pokemon)
        db.session.commit()

        return jsonify({
            "message": f"Pokémon '{pokemon.pokemon_name}' eliminado con éxito",
            "id_deleted": pokemon_id
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al eliminar el Pokémon: {str(e)}", status_code=500)


@pokemon_bp.route('/pokemon/<int:pokemon_id>', methods=['PUT'])
def update_pokemon(pokemon_id):
    body = request.get_json()

    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    if 'pokemon_name' not in body or body['pokemon_name'].strip() == "":
        raise APIException(
            "El campo 'pokemon_name' es obligatorio y no puede estar vacío", status_code=400)

    pokemon = db.session.get(Pokemon, pokemon_id)

    # UNIFICADO: Lanza APIException en lugar de retornar un jsonify manual
    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no fue encontrado", status_code=404)

    try:
        pokemon.pokemon_name = body['pokemon_name'].strip()
        db.session.commit()

        return jsonify({
            "message": "Pokémon actualizado con éxito",
            "results": pokemon.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al actualizar el Pokémon: {str(e)}", status_code=500)
