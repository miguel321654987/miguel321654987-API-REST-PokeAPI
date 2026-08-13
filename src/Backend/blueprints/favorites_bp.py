from flask import Blueprint, request, jsonify
from Backend.models import db, User, Pokemon
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from Backend.utils import APIException  # Importamos tu clase de excepciones

# Creamos el Blueprint exclusivo para la gestión de favoritos
favorites_bp = Blueprint('favorites', __name__)

# 1. OBTENER TODOS LOS POKÉMON FAVORITOS DE UN USUARIO (GET)


@favorites_bp.route('/user/<int:user_id>/favorites', methods=['GET'])
def get_user_favorite_pokemons(user_id):
    # Cargamos el usuario junto con su relación many-to-many de forma eficiente
    stmt = select(User).where(User.id == user_id).options(
        selectinload(User.pokemon_favorites))
    user = db.session.scalars(stmt).first()

    if not user:
        raise APIException(
            f"El usuario con ID {user_id} no fue encontrado", status_code=404)

    favorites_serialized = [pokemon.serialize()
                            for pokemon in user.pokemon_favorites]

    return jsonify({
        "message": f"Pokémon favoritos del usuario {user_id} obtenidos con éxito",
        "results": favorites_serialized,
        "total_favorites": len(favorites_serialized)
    }), 200

# 2. AÑADIR UN POKÉMON A FAVORITOS DE UN USUARIO (POST)


@favorites_bp.route('/user/<int:user_id>/favorites/<string:pokemon_id>', methods=['POST'])
def add_favorite_pokemon(user_id, pokemon_id):
    user = db.session.get(User, user_id)
    pokemon = db.session.get(Pokemon, pokemon_id)

    if not user:
        raise APIException(
            f"El usuario con ID {user_id} no existe", status_code=404)
    if not pokemon:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no existe", status_code=404)

    if pokemon in user.pokemon_favorites:
        raise APIException(
            f"El Pokémon '{pokemon.pokemon_name}' ya se encuentra en los favoritos de este usuario", status_code=409)

    try:
        user.pokemon_favorites.append(pokemon)
        db.session.commit()

        return jsonify({
            "message": f"Pokémon '{pokemon.pokemon_name}' añadido con éxito a los favoritos del usuario {user_id}"
        }), 201

    except Exception as e:
        db.session.rollback()  # Cancelamos cualquier operación fallida en la base de datos
        raise APIException(
            f"Error interno del servidor al añadir el favorito: {str(e)}", status_code=500)

# 3. ELIMINAR UN POKÉMON DE FAVORITOS DE UN USUARIO (DELETE)


@favorites_bp.route('/user/<int:user_id>/favorites/<string:pokemon_id>', methods=['DELETE'])
def delete_favorite_pokemon(user_id, pokemon_id):
    user = db.session.get(User, user_id)
    pokemon = db.session.get(Pokemon, pokemon_id)

    if not user:
        raise APIException(
            f"El usuario con ID {user_id} no existe", status_code=404)
    if not pokemon:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no existe", status_code=404)

    # Validamos que el favorito realmente exista antes de intentar borrarlo
    if pokemon not in user.pokemon_favorites:
        raise APIException(
            f"El Pokémon '{pokemon.pokemon_name}' no está registrado en la lista de favoritos de este usuario", status_code=400)

    try:
        # Removemos la relación de la colección
        user.pokemon_favorites.remove(pokemon)
        db.session.commit()

        return jsonify({
            "message": f"Pokémon '{pokemon.pokemon_name}' eliminado con éxito de los favoritos del usuario {user_id}"
        }), 200

    except Exception as e:
        db.session.rollback()  # Aseguramos la integridad de la base de datos si el borrado falla
        raise APIException(
            f"Error interno del servidor al eliminar el favorito: {str(e)}", status_code=500)
