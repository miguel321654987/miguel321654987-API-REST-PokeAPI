"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_cors import CORS
from utils import APIException, generate_sitemap
from admin import setup_admin
from models import db, User, People
from sqlalchemy import select, insert, delete

app = Flask(__name__)
app.url_map.strict_slashes = False

db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

MIGRATE = Migrate(app, db)
db.init_app(app)
CORS(app)
setup_admin(app)

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    return generate_sitemap(app)


@app.route('/user', methods=['GET'])
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

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    # Buscamos el usuario en la base de datos usando su ID
    user = User.query.get(user_id)

    # Si el usuario no existe, devolvemos un error 404
    if user is None:
        return jsonify({"msg": f"User with id {user_id} not found"}), 404

    # Si existe, lo serializamos y lo devolvemos con un estado 200
    return jsonify(user.serialize()), 200


@app.route('/user', methods=['POST'])
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

@app.route('/user/<int:user_id>', methods=['DELETE'])
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
            "deleted_user": user.serialize() # Opcional: devolvemos los datos del usuario borrado
        }), 200

    except Exception as e:
        # 6. Si ocurre un error, hacemos rollback para no corromper la base de datos
        db.session.rollback()
        raise APIException(
            f"Error interno al intentar eliminar el usuario: {str(e)}", status_code=500)


@app.route('/people', methods=['GET'])
def get_all_people():
    # Obtenemos la lista de objetos People desde la base de datos
    people_list = db.session.execute(select(People)).scalars().all()
    # Convertimos la lista de objetos a una lista de diccionarios usando map
    return jsonify(list(map(lambda p: p.serialize(), people_list))), 200


# this only runs if `$ python src/app.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=PORT, debug=False)


@app.route('/people', methods=['POST'])
def create_person():
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

    # 4. Verificar si ya existe un personaje con ese mismo nombre (para evitar errores en la base de datos)
    exist_person = People.query.filter_by(
        people_name=body['people_name']).first()
    if exist_person is not None:
        raise APIException(
            f"El personaje '{body['people_name']}' ya existe en la base de datos", status_code=400)

    try:
        # 5. Crear la nueva instancia de nuestro modelo People
        new_person = People(people_name=body['people_name'])

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
