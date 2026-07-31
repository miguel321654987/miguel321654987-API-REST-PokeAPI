from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()

# 1. Definición de la Tabla de Asociación (Many-to-Many)
# Usamos db.Table para mantener la consistencia con Flask-SQLAlchemy
user_pokemon_association = db.Table(
    "user_pokemon_favorite",
    db.metadata,
    db.Column("user_id", db.Integer, db.ForeignKey(
        "users.id"), primary_key=True),
    db.Column("pokemon_id", db.Integer, db.ForeignKey(
        "pokemons.id"), primary_key=True)
)


class User(db.Model):
    """Modelo de usuario"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(250), nullable=False)

    # NUEVOS CAMPOS: Se agrega nombre y apellido (obligatorios, máximo 80 caracteres)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)

    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)

    # CORRECCIÓN: Se usa list["Pokemon"] porque un usuario tiene muchos pokémons
    pokemon_favorites: Mapped[list["Pokemon"]] = relationship(
        secondary=user_pokemon_association, back_populates="users"
    )

    def serialize(self):
        """Serializa el objeto User"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,          # Incluido en la serialización
            "last_name": self.last_name,  # Incluido en la serialización
            "favorite_pokemon_ids": [p.id for p in self.pokemon_favorites],
        }


class Pokemon(db.Model):
    """Modelo de Pokémon"""
    __tablename__ = "pokemons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pokemon_name: Mapped[str] = mapped_column(String(50), nullable=False)

    # CORRECCIÓN: Se usa list["User"] porque un pokémon puede ser favorito de muchos usuarios
    users: Mapped[list["User"]] = relationship(
        secondary=user_pokemon_association, back_populates="pokemon_favorites"
    )

    def serialize(self):
        """Serializa el objeto Pokemon"""
        return {
            "id": self.id,
            "pokemon_name": self.pokemon_name,
        }
