from flask import Blueprint, request, jsonify
import requests
from Backend.models import db, Pokemon
from sqlalchemy import select
from Backend.utils import APIException

# 1. Definimos el Blueprint (El componente modular)
pokemon_bp = Blueprint('Pokemon', __name__)


@pokemon_bp.route('/pokemon/<int:pokemon_id>', methods=['GET'])
def get_pokemon_by_id(pokemon_id):
    pokemon = db.session.get(Pokemon, pokemon_id)

    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no fue encontrado", status_code=404)

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

    pokemon_name = body.get('pokemon_name')
    if not pokemon_name or not isinstance(pokemon_name, str) or pokemon_name.strip() == "":
        raise APIException(
            "El campo 'pokemon_name' es obligatorio y debe ser un texto válido", status_code=400)

    name_clean = pokemon_name.strip()

    stmt = select(Pokemon).where(Pokemon.pokemon_name == name_clean)
    exist_pokemon = db.session.execute(stmt).scalar_one_or_none()

    if exist_pokemon is not None:
        raise APIException(
            f"El Pokémon '{name_clean}' ya existe en la base de datos", status_code=409)

    try:
        new_pokemon = Pokemon(pokemon_name=name_clean)

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
    pokemon = db.session.get(Pokemon, pokemon_id)

    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no existe", status_code=404)

    # CORRECCIÓN: Guardamos el nombre antes del commit para evitar errores de expiración
    pokemon_name = pokemon.pokemon_name

    try:
        db.session.delete(pokemon)
        db.session.commit()

        return jsonify({
            "message": f"Pokémon '{pokemon_name}' eliminado con éxito",
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

    pokemon_name = body.get('pokemon_name')
    if not pokemon_name or not isinstance(pokemon_name, str) or pokemon_name.strip() == "":
        raise APIException(
            "El campo 'pokemon_name' es obligatorio y debe ser un texto válido", status_code=400)

    pokemon = db.session.get(Pokemon, pokemon_id)

    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no fue encontrado", status_code=404)

    name_clean = pokemon_name.strip()

    if name_clean != pokemon.pokemon_name:
        stmt = select(Pokemon).where(Pokemon.pokemon_name == name_clean)
        name_taken = db.session.execute(stmt).scalar_one_or_none()
        if name_taken:
            raise APIException(
                f"El nombre '{name_clean}' ya está registrado en otro Pokémon", status_code=409)

    try:
        pokemon.pokemon_name = name_clean
        db.session.commit()

        return jsonify({
            "message": "Pokémon actualizado con éxito",
            "results": pokemon.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al actualizar el Pokémon: {str(e)}", status_code=500)
