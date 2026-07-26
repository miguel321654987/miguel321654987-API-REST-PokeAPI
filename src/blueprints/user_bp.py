import os
from flask import Blueprint, request, jsonify
from models import db, User
from sqlalchemy import select
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from utils import APIException

# 1. Definimos el Blueprint (El componente modular)
user_bp = Blueprint('User', __name__)


@user_bp.route("/signup", methods=["POST"])
def handle_signup():
    email = request.json.get("email")
    password = request.json.get("password")

    # Validaciones estrictas de campos requeridos para un nuevo usuario
    if not email or not isinstance(email, str) or email.strip() == "":
        raise APIException("El campo 'email' es obligatorio", status_code=400)
    if not password or not isinstance(password, str) or password.strip() == "":
        raise APIException(
            "El campo 'password' es obligatorio", status_code=400)

    # 1. Verificar si el usuario ya existe
    user_exists = db.session.execute(select(User).where(
        User.email == email)).scalar_one_or_none()
    if user_exists is not None:
        return jsonify({"msg": "Email already exists"}), 409

    # 2. Crear y guardar el nuevo usuario
    new_user = User(email=email, password=password, is_active=True)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

# Crea una ruta para autenticar a los usuarios y devolver el token JWT
# La función create_access_token() se utiliza para generar el JWT


@user_bp.route("/login", methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    # Consulta la base de datos por el nombre de usuario y la contraseña
    user = db.session.execute(select(User).where(
        User.email == email, User.password == password)).scalar_one_or_none()
    if user is None:
        return jsonify({"msg": "Bad username or password"}), 401

    # Crea un nuevo token con el id de usuario dentro
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"token": access_token, "user_id": user.id})


# Protege una ruta con jwt_required, bloquea las peticiones sin un JWT válido
@user_bp.route("/demo", methods=["GET"])
@jwt_required()
def protected():
    # Accede a la identidad del usuario actual
    current_user_id = get_jwt_identity()
    user = db.session.get(User, int(current_user_id))

    if user is None:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    # VALIDACIÓN DE ESTADO: Si el usuario está inactivo, denegar acceso (Status 403)
    if not user.is_active:
        return jsonify({"msg": "Acceso denegado: Tu cuenta ha sido desactivada."}), 403

    return jsonify({"id": user.id, "email": user.email}), 200


@user_bp.route('/user', methods=['GET'])
def get_all_users():
    users_query = User.query.all()

    if not users_query:
        return jsonify({
            "message": "No se encontraron usuarios en la base de datos",
            "results": []
        }), 200

    all_users = list(map(lambda user: user.serialize(), users_query))
    return jsonify({
        "message": "Usuarios obtenidos con éxito",
        "results": all_users,
        "total_users": len(all_users)
    }), 200


@user_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    # Buscamos el usuario en la base de datos usando su ID
    user = User.query.get(user_id)

    # Si el usuario no existe, devolvemos un error 404
    if user is None:
        return jsonify({"msg": f"User with id {user_id} not found"}), 404

    # Si existe, lo serializamos y lo devolvemos con un estado 200
    return jsonify(user.serialize()), 200


@user_bp.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"msg": f"User with id {user_id} not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({
            "message": f"Usuario con id {user_id} eliminado con éxito",
            "deleted_user": user.serialize()
        }), 200
    except Exception:
        db.session.rollback()
        raise  # Deja que el error suba limpio a app.py para que devuelva el 500


@user_bp.route('/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    body = request.get_json()
    if body is None:
        raise APIException("Debes enviar un cuerpo JSON", status_code=400)

    user = User.query.get(user_id)
    if user is None:
        return jsonify({"msg": f"User with id {user_id} not found"}), 404

    email = body.get('email')
    password = body.get('password')

    # 1. PASO EXCLUSIVO DE VALIDACIONES (Fuera del try)
    if email is not None and (not isinstance(email, str) or email.strip() == ""):
        raise APIException(
            "El campo 'email' es inválido o vacío", status_code=400)

    # 2. PASO DE ASIGNACIÓN Y GUARDADO (Dentro del try por si falla la Base de Datos)
    if email is not None:
        user.email = email
    if password is not None:
        user.password = password

    try:
        db.session.commit()
        return jsonify({
            "message": "Usuario actualizado con éxito",
            "results": user.serialize()
        }), 200
    except Exception:
        db.session.rollback()
        raise  # Al relanzarlo, app.py se encarga de estructurar el JSON de error 500
