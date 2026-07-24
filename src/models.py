from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, select
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()


class User(db.Model):
    """Modelo de usuario"""

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(250), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        """Serializa el objeto User"""
        return {
            "id": self.id,
            "email": self.email,
            # No se serializa la contraseña, es una brecha de seguridad
        }


class Pokemon(db.Model):
    """Modelo de Pokémon"""

    __tablename__ = 'pokemon'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pokemon_name: Mapped[str] = mapped_column(
        String(50), nullable=False)

    def serialize(self):
        """Serializa el objeto Pokemon"""
        return {
            "id": self.id,
            "pokemon_name": self.pokemon_name,
        }
