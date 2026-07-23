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
    email = request.json.get("email", None)
    password = request.json.get("password", None)
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

    return jsonify({"id": user.id, "email": user.email}), 200


@user_bp.route('/user', methods=['GET'])
def get_all_users():
    try:
        # 1. Consultar todos los usuarios en la base de datos
        users_query = User.query.all()

        # 2. Si la base de datos está vacía, podemos avisar o devolver una lista vacía
        if not users_query:
            return jsonify({
                "message": "No se encontraron usuarios en la base de datos",
                "results": []
            }), 200

        # 3. Mapear y serializar cada usuario usando el método de tu modelo User
        # Esto convierte los objetos de Python en diccionarios legibles
        all_users = list(map(lambda user: user.serialize(), users_query))

        # 4. Devolver la lista con todos los usuarios y un estado 200 OK
        return jsonify({
            "message": "Usuarios obtenidos con éxito",
            "results": all_users,
            "total_users": len(all_users)  # Añadimos información útil extra
        }), 200

    except Exception as e:
        raise APIException(
            f"Error interno al obtener los usuarios: {str(e)}", status_code=500)


@user_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    # Buscamos el usuario en la base de datos usando su ID
    user = User.query.get(user_id)

    # Si el usuario no existe, devolvemos un error 404
    if user is None:
        return jsonify({"msg": f"User with id {user_id} not found"}), 404

    # Si existe, lo serializamos y lo devolvemos con un estado 200
    return jsonify(user.serialize()), 200


@user_bp.route('/user', methods=['POST'])
def create_user():
    # 1. Obtener los datos en formato JSON enviados desde Postman
    body = request.get_json()

    # 2. Validar que el cuerpo de la petición no esté vacío
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    # 3. Validar los campos obligatorios del modelo User
    if 'email' not in body or body['email'].strip() == "":
        raise APIException("El campo 'email' es obligatorio", status_code=400)

    if 'password' not in body or body['password'].strip() == "":
        raise APIException(
            "El campo 'password' es obligatorio", status_code=400)

    if 'is_active' not in body:
        raise APIException(
            "El campo 'is_active' es obligatorio", status_code=400)

    # 4. Verificar si ya existe un usuario con ese mismo email
    exist_user = User.query.filter_by(email=body['email']).first()
    if exist_user is not None:
        raise APIException(
            f"El usuario con el email '{body['email']}' ya existe", status_code=400)

    try:
        # 5. Crear la nueva instancia de nuestro modelo User
        # Tomamos 'is_active' del body, si no viene enviado, por defecto será True
        is_active_value = body.get('is_active', True)

        new_user = User(
            email=body['email'],
            # Nota: En un proyecto real aquí se encriptaría la contraseña
            password=body['password'],
            is_active=is_active_value
        )

        # 6. Guardar el nuevo registro en la base de datos
        db.session.add(new_user)
        db.session.commit()

        # 7. Responder con el usuario creado (serializado, sin la contraseña)
        return jsonify({
            "message": "Usuario creado con éxito",
            "results": new_user.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno del servidor: {str(e)}", status_code=500)


@user_bp.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # 1. Buscar el usuario en la base de datos usando su ID
    user = User.query.get(user_id)

    # 2. Si el usuario no existe, devolvemos un error 404 (siguiendo tu patrón de get_user_by_id)
    if user is None:
        return jsonify({"msg": f"User with id {user_id} not found"}), 404

    try:
        # 3. Eliminar el registro de la sesión de la base de datos
        db.session.delete(user)

        # 4. Confirmar y guardar los cambios en la base de datos
        db.session.commit()

        # 5. Responder con un mensaje de éxito y un estado 200 OK
        return jsonify({
            "message": f"Usuario con id {user_id} eliminado con éxito",
            # Opcional: devolvemos los datos del usuario borrado
            "deleted_user": user.serialize()
        }), 200

    except Exception as e:
        # 6. Si ocurre un error, hacemos rollback para no corromper la base de datos
        db.session.rollback()
        raise APIException(
            f"Error interno al intentar eliminar el usuario: {str(e)}", status_code=500)


@user_bp.route('/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    # 1. Obtener los datos del JSON
    body = request.get_json()

    # 2. Buscar al usuario por su ID
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"msg": f"User with id {user_id} not found"}), 404

    try:
        # 3. Modificar directamente los campos con los nuevos valores del body
        user.email = body.get('email', user.email)
        user.password = body.get('password', user.password)
        user.is_active = body.get('is_active', user.is_active)

        # 4. Guardar los cambios en la base de datos
        db.session.commit()

        # 5. Responder con éxito
        return jsonify({
            "message": "Usuario actualizado con éxito",
            "results": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(f"Error interno: {str(e)}", status_code=500)
