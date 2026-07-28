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
    body = request.get_json()
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    email = body.get("email")
    password = body.get("password")

    # Validaciones estrictas de campos requeridos para un nuevo usuario
    if not email or not isinstance(email, str) or email.strip() == "":
        raise APIException("El campo 'email' es obligatorio", status_code=400)
    if not password or not isinstance(password, str) or password.strip() == "":
        raise APIException(
            "El campo 'password' es obligatorio", status_code=400)

    # 1. Verificar si el usuario ya existe (SQLAlchemy 2.0 style)
    stmt = select(User).where(User.email == email.strip())
    user_exists = db.session.execute(stmt).scalar_one_or_none()

    if user_exists is not None:
        raise APIException(
            "El correo electrónico ya está registrado", status_code=409)

    try:
        # 2. Crear y guardar el nuevo usuario
        new_user = User(email=email.strip(),
                        password=password.strip(), is_active=True)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "Usuario creado con éxito",
            "results": new_user.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno del servidor al crear el usuario: {str(e)}", status_code=500)


@user_bp.route("/login", methods=["POST"])
def create_token():
    body = request.get_json()
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        raise APIException(
            "Los campos 'email' y 'password' son requeridos", status_code=400)

    # Consulta la base de datos con SQLAlchemy 2.0 style
    stmt = select(User).where(User.email == email.strip(),
                              User.password == password.strip())
    user = db.session.execute(stmt).scalar_one_or_none()

    if user is None:
        raise APIException(
            "Credenciales inválidas. Email o contraseña incorrectos", status_code=401)

    # Crea un nuevo token con el id de usuario dentro
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Autenticación exitosa",
        "token": access_token,
        "user_id": user.id
    }), 200


@user_bp.route("/demo", methods=["GET"])
@jwt_required()
def protected():
    # Accede a la identidad del usuario actual
    current_user_id = get_jwt_identity()
    user = db.session.get(User, int(current_user_id))

    if user is None:
        raise APIException("Usuario no encontrado", status_code=404)

    # VALIDACIÓN DE ESTADO: Si el usuario está inactivo, denegar acceso (Status 403)
    if not user.is_active:
        raise APIException(
            "Acceso denegado: Tu cuenta ha sido desactivada.", status_code=403)

    return jsonify({
        "message": "Acceso concedido a ruta protegida",
        "results": {"id": user.id, "email": user.email}
    }), 200


@user_bp.route('/user', methods=['GET'])
def get_all_users():
    # Usando select() y scalars() estilo SQLAlchemy 2.0
    stmt = select(User)
    users_query = db.session.scalars(stmt).all()

    # Validamos si la lista está vacía
    if not users_query:
        return jsonify({
            "message": "No se encontraron usuarios en la base de datos",
            "results": []
        }), 200

    # Convertimos la lista de objetos a diccionarios mediante comprensión de listas
    all_users = [user.serialize() for user in users_query]

    return jsonify({
        "message": "Usuarios obtenidos con éxito",
        "results": all_users,
        "total_users": len(all_users)
    }), 200


@user_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    # ACTUALIZACIÓN: db.session.get() para buscar por clave primaria
    user = db.session.get(User, user_id)

    if user is None:
        raise APIException(
            f"El usuario con ID {user_id} no fue encontrado", status_code=404)

    return jsonify({
        "message": "Usuario obtenido con éxito",
        "results": user.serialize()
    }), 200


@user_bp.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # ACTUALIZACIÓN: db.session.get() en lugar de User.query.get()
    user = db.session.get(User, user_id)

    if user is None:
        raise APIException(
            f"El usuario con ID {user_id} no existe", status_code=404)

    try:
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            "message": f"Usuario con ID {user_id} eliminado con éxito",
            "id_deleted": user_id
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al eliminar el usuario: {str(e)}", status_code=500)


@user_bp.route('/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    body = request.get_json()
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    # ACTUALIZACIÓN: db.session.get() en lugar de User.query.get()
    user = db.session.get(User, user_id)
    if user is None:
        raise APIException(
            f"El usuario con ID {user_id} no fue encontrado", status_code=404)

    email = body.get('email')
    password = body.get('password')

    # Validaciones previas a la asignación
    if email is not None and (not isinstance(email, str) or email.strip() == ""):
        raise APIException(
            "El campo 'email' es inválido o está vacío", status_code=400)

    try:
        if email is not None:
            user.email = email.strip()
        if password is not None:
            user.password = password.strip()

        db.session.commit()

        return jsonify({
            "message": "Usuario actualizado con éxito",
            "results": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al actualizar el usuario: {str(e)}", status_code=500)
