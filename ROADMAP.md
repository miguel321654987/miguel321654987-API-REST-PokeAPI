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

### 📌 [2026-07-16 14:50:15 CEST] - Current branch: feature/deepseek-roadmap

- **Inserted on:** 2026-07-16 15:26:02 CEST while on branch `feature/deepseek-roadmap`
- **Changes Made:**
  - Reviewed the current repository and confirmed the backend is a Flask boilerplate with endpoints `/user`, `/students`, and `/people`.
  - Identified that the project does not currently include a React frontend or PokeAPI integration.
  - Confirmed a mismatch between the roadmap goals and the existing codebase.
- **Result / Status:** The project needs realignment: either update the roadmap to reflect the current backend state or implement the missing PokeAPI/React features.
- **Next Steps:** Update the roadmap to reflect reality, fix server initialization issues in `src/app.py`, and design the missing PokeAPI endpoints.

---

### 📌 [2026-07-17] - Changes applied today

- **Inserted on:** 2026-07-17 12:51:16 UTC while on branch `desarrollo-models-app`
- **Changes Made:**
  - Replaced usage of the `People` class with `Pokemon` in the backend.
  - Renamed the endpoints from `/people` to `/pokemon` in `src/app.py` and adjusted the function names to `get_all_pokemon`, `create_pokemon`, and `delete_pokemon`.
  - Updated `src/admin.py` to register `Pokemon` in the admin panel.
- **Status:** Completed locally. Historical migrations and the table remain named `people` (not modified).
- **Next steps suggested:**
  - (Optional) Update migrations / rename table if you want to reflect `pokemon` in the database.

### 📌 [2026-07-17 13:02:52 UTC] - Additional actions

- **Inserted on:** 2026-07-17 13:02:52 UTC while on branch `desarrollo-models-app`
- **Changes Made:**
  - Installed dependencies: `flask`, `flask-migrate`, `flask-sqlalchemy`, `alembic`, `flask-cors`.
  - Fixed the `Pokemon` model and removed nonexistent `Students`/`Staff` imports in `src/admin.py` and `src/app.py`.
  - Added Alembic migration to rename table `people` → `pokemon` and applied it.
  - Created/updated SQLite database at [src/instance/example.db](src/instance/example.db#L1).
- **Status:** Applied locally; no remote deployment performed.
- **Next steps suggested:** backup the DB, run the server and test endpoints.

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

### 📌 [2026-07-16 14:50:15 CEST] - Rama actual: feature/deepseek-roadmap

- **Insertado el:** 2026-07-16 15:26:02 CEST en la rama `feature/deepseek-roadmap`
- **Cambios realizados:**
  - Revisé el repositorio actual y confirmé que el backend es un boilerplate de Flask con endpoints `/user`, `/students` y `/people`.
  - Identifiqué que el proyecto no incluye actualmente un frontend React ni integración con PokeAPI.
  - Confirmé un desajuste entre los objetivos del roadmap y el código existente.
- **Resultado / Estado:** El proyecto necesita realinearse: actualizar el roadmap para reflejar el estado actual del backend o implementar las funcionalidades faltantes de PokeAPI/React.
- **Próximos pasos:** Actualizar el roadmap para reflejar la realidad, corregir la inicialización del servidor en `src/app.py` y diseñar los endpoints faltantes de PokeAPI.
  -->

### 📌 [2026-07-17] - Cambios aplicados hoy

- **Insertado el:** 2026-07-17 12:51:16 UTC en la rama `desarrollo-models-app`
- **Cambios realizados:**
  - Reemplacé el uso de la clase `People` por `Pokemon` en el backend.
  - Renombré los endpoints de `/people` a `/pokemon` en `src/app.py` y ajusté los nombres de las funciones a `get_all_pokemon`, `create_pokemon` y `delete_pokemon`.
  - Actualicé `src/admin.py` para registrar `Pokemon` en el panel de administración.
- **Estado:** Completado localmente. Las migraciones históricas y la tabla siguen llamadas `people` (no modificadas).
- **Próximos pasos sugeridos:**
  - (Opcional) Actualizar migraciones / renombrar tabla si se desea reflejar `pokemon` en la base de datos.

### 📌 [2026-07-17 13:02:52 UTC] - Acciones adicionales

- **Insertado el:** 2026-07-17 13:02:52 UTC en la rama `desarrollo-models-app`
- **Cambios realizados:**
  - Instalé dependencias: `flask`, `flask-migrate`, `flask-sqlalchemy`, `alembic`, `flask-cors`.
  - Corregí el modelo `Pokemon` y eliminé importaciones inexistentes `Students`/`Staff` en `src/admin.py` y `src/app.py`.
  - Añadí una migración Alembic para renombrar la tabla `people` → `pokemon` y la apliqué.
  - Creé/actualicé la base de datos SQLite en [src/instance/example.db](src/instance/example.db#L1).
- **Estado:** Aplicado localmente; no se realizó despliegue remoto.
- **Próximos pasos sugeridos:** Hacer copia de seguridad de la BD, arrancar el servidor y probar los endpoints.
