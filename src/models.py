from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }


class Pokemon(db.Model):
    __tablename__ = 'pokemon'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    people_name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "people_name": self.people_name,
        }

