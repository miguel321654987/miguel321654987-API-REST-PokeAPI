# 🗺️ Project: Endpoint Testing App with PokeAPI

This file is the **single source of truth** regarding the project's current state. It must be updated by the AI at the end of each task to maintain development continuity.

---

## 🎯 General Objective

Develop a full-stack testing application (Flask + React) that consumes data from the PokeAPI, exposes custom endpoints in the backend, and displays them on a clean user interface.

---

## 🛠️ Project Status and Progress

### 🏢 Backend (Python / Flask + SQLAlchemy + SQLite)

- [ ] Initial configuration of the Flask server and environment variables (`.env`).
- [ ] Database models creation with SQLAlchemy (e.g., Favorites, Search History).
- [ ] Implementation of services/utils to consume the external PokeAPI from Flask.
- [ ] Custom endpoints creation (`/api/pokemon`, `/api/favorites`, etc.).
- [ ] Configuration and execution of migrations (`flask db init/migrate/upgrade`) using SQLite (`instance/example.db`).

### 💻 Frontend (React.js + Context API)

- [ ] React project initialization and folder structuring.
- [ ] Context API (Flux/Store) configuration to centralize requests to the Flask backend.
- [ ] Main View: Search bar and Pokémon list consumed from our local endpoints.
- [ ] Details View: Expanded information for a specific Pokémon.
- [ ] Favorites System: Button to save/delete Pokémon connected to the backend.

---

## 📓 Process Journal (Change Log)

### 📌 [2026-07-15] - AI Environment Initialization

- **Changes Made:**
  - Created the `feature/ia-roadmap` branch for isolated environment setup.
  - Configured rules for the DeepSeek R1 7B model (`context_length` optimized to 16384).
  - Created the base `ROADMAP.md` file tailored for SQLite local development.
- **Result / Status:** Successful. The model now recognizes the roadmap as external memory.
- **Lessons / Blockers:** The model must remember to explain reasoning in Spanish while keeping code, files, and comments strictly in English.

---

## 📋 Immediate Next Steps

1. Validate that the AI reads this file properly by running a test prompt in the chat (e.g., _"What is our next step according to the roadmap?"_).
2. Begin setting up the basic Backend structure in Flask (`app.py` or `models.py`) ensuring the SQLite database connection path is ready.

---

# <!--

# TRADUCCIÓN AL ESPAÑOL (SOLO PARA REFERENCIA HUMANA)

# 🗺️ Proyecto: App de Endpoints con PokeAPI (Pruebas)

Este archivo es la **fuente única de verdad** sobre el estado actual del proyecto. Debe ser actualizado de manera obligatoria por la IA al finalizar cada tarea para mantener la continuidad del desarrollo.

---

## 🎯 Objetivo General

Desarrollar una aplicación de pruebas full-stack (Flask + React) que consuma datos de la PokeAPI, exponga endpoints personalizados en el backend y los visualice en una interfaz de usuario limpia.

---

## 🛠️ Estado y Progreso del Proyecto

### 🏢 Backend (Python / Flask + SQLAlchemy + SQLite)

- [ ] Configuración inicial del servidor Flask y variables de entorno (`.env`).
- [ ] Creación de modelos de base de datos con SQLAlchemy (ej. Favoritos, Historial de búsquedas).
- [ ] Implementación de servicios/utils para consumir la PokeAPI externa desde Flask.
- [ ] Creación de endpoints personalizados (`/api/pokemon`, `/api/favorites`, etc.).
- [ ] Configuración y ejecución de migraciones (`flask db init/migrate/upgrade`) usando SQLite (`instance/example.db`).

### 💻 Frontend (React.js + Context API)

- [ ] Inicialización del proyecto React y estructura de carpetas.
- [ ] Configuración del Context API (Flux/Store) para centralizar las peticiones al backend de Flask.
- [ ] Vista Principal: Buscador y lista de Pokémon consumidos desde nuestros endpoints.
- [ ] Vista de Detalles: Información expandida de un Pokémon específico.
- [ ] Sistema de Favoritos: Botón para guardar/eliminar Pokémon conectados al backend.

---

## 📓 Diario de Procesos (Historial de Cambios)

### 📌 [2026-07-15] - Inicialización del Entorno de IA

- **Cambios realizados:**
  - Creación de la rama `feature/ia-roadmap` para la configuración aislada del entorno.
  - Configuración de reglas para el modelo DeepSeek R1 7B (`context_length` optimizado a 16384).
  - Creación del archivo base `ROADMAP.md` adaptado para el desarrollo local con SQLite.
- **Resultado / Estado:** Exitoso. El modelo ahora reconoce el roadmap como memoria externa.
- **Lecciones / Bloqueos:** El modelo debe recordar explicar su razonamiento en español mientras mantiene el código, archivos y comentarios estrictamente en inglés.

---

## 📋 Próximos Pasos Inmediatos

1. Validar que la IA lea este archivo correctamente ejecutando un prompt de prueba en el chat.
2. Comenzar a configurar la estructura básica del Backend en Flask (`app.py` o `models.py`) asegurando que la ruta de conexión a SQLite esté lista.
   -->
