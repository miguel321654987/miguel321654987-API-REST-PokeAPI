# 📋 AI Planning Phase Protocol

This file defines the mandatory protocol the AI must follow whenever the user initiates a planning phase (Plan Mode).

## 🧠 Core Objectives

1. Analyze technical requirements thoroughly before proposing architecture.
2. Minimize context fatigue and prevent broken loops or logic errors.
3. Design atomic, step-by-step implementations aligned with the project's stack.

## 🔄 Mandatory Planning Workflow

Before generating any planning response or proposing a solution, the AI MUST execute the following steps in order:

### Step 1: Context Verification

- Read `ROADMAP.md` to identify the current active task and review past lessons or blockers.
- Inspect relevant codebase files using context providers (e.g., `app.py`, `models.py`) to understand dependencies.

### Step 2: Architecture Design

- Draft structural changes ensuring complete compatibility with the existing technical stack:
  - **Backend**: Python, Flask, SQLAlchemy ORM, SQLite (`instance/example.db`).
  - **Frontend**: React.js, Functional Components, Context API.
- Maintain the strict language constraint: all code, variables, and technical files must be written in **English**.

### Step 3: Atomic Action Steps

- Break down the implementation into a structured sequence of small, verifiable steps (e.g., Step 1, Step 2, Step 3).
- Each step must be isolated enough so that when transitioning to **Act/Agent Mode**,
  the agent can verify success and update `ROADMAP.md` immediately after completion.
- **Commit & Log Rule:** Each step MUST trigger a Git commit with date/time/branch/title AND an immediate update to `ROADMAP.md`.
- **File Structure Requirement for ROADMAP.md:** The structure is strictly split vertically into two sections; entries MUST NOT interleave within these blocks but are appended to their respective language section's footer instead.
- **Roadmap Entry Structure:** New entries must follow this exact order: First add the new item at the end of the English section, followed immediately by its translated duplicate at the very end of the Spanish section (commented). Entries MUST NOT interleave; they must remain grouped by language block.
- The translation block MUST end with closing comments (`<!-- ... -->`) to prevent loading heavy context or distracting the AI model during token processing.

## 💬 Output Format

- Present the final plan strictly in **Spanish** for user review.
- Do not attempt to use file-writing or terminal execution tools during this phase.
- Wait for explicit user approval before declaring the plan ready for execution.

---

# <!--

# TRADUCCIÓN AL ESPAÑOL (SOLO PARA REFERENCIA HUMANA)

# 📋 Protocolo de la Fase de Planificación de la IA

Este archivo define el protocolo obligatorio que la IA debe seguir cada vez que el usuario inicia una fase de planificación (Modo Plan).

## 🧠 Objetivos Centrales

1. Analizar minuciosamente los requisitos técnicos antes de proponer una arquitectura.
2. Minimizar la fatiga de contexto y evitar bucles rotos o errores de lógica.
3. Diseñar implementaciones atómicas, paso a paso, alineadas con el stack del proyecto.

## 🔄 Flujo de Trabajo de Planificación Obligatorio

Antes de generar cualquier respuesta de planificación o proponer una solución, la IA DEBE ejecutar los siguientes pasos en orden:

### Paso 1: Verificación del Contexto

- Leer `ROADMAP.md` para identificar la tarea activa actual y revisar lecciones o bloqueos pasados.
- Inspeccionar los archivos relevantes del código usando los proveedores de contexto (ej. `app.py`, `models.py`) para entender las dependencias.

### Paso 2: Diseño de la Arquitectura

- Diseñar los cambios estructurales asegurando total compatibilidad con el stack técnico existente:
  - **Backend**: Python, Flask, SQLAlchemy ORM, SQLite (`instance/example.db`).
  - **Frontend**: React.js, Componentes Funcionales, Context API.
- Mantener la restricción estricta de idioma: todo el código, variables y archivos técnicos deben escribirse en **inglés**.

### Paso 3: Pasos de Acción Atómicos

### Paso 3: Pasos Atómicos de Acción

- Desglosa la implementación en una secuencia estructurada de pequeños pasos verificables (por ejemplo, Paso 1, Paso 2, Paso 3).
- Cada paso debe estar lo suficientemente aislado para que, al pasar a **Modo Act/Agent**, el agente pueda verificar el éxito y actualizar `ROADMAP.md` inmediatamente después de su finalización.
- **Regla de Commit & Log:** Cada paso DEBE generar un commit de Git con fecha/hora/ramal/título Y una actualización inmediata en `ROADMAP.md`.
- **Requisito de Estructura para ROADMAP.md:** La estructura está dividida verticalmente estrictamente en dos secciones; las entradas NO deben entremezclarse dentro de estos bloques, sino que deben agregarse al pie de la sección del lenguaje correspondiente.
- **Estructura de Entrada en el Roadmap:** Las nuevas entradas deben seguir este orden exacto: Primero agrega el nuevo elemento al final de la sección en inglés, seguido inmediatamente por su duplicado traducido al español justo al final de la sección española (comentado). LAS ENTRADAS NO DEBEN ENTREMEZCLARSE; deben mantenerse agrupadas por bloque de idioma.
- El bloque de traducción DEBE terminar con comentarios de cierre (`<!-- ... -->`) para evitar cargar contexto pesado o distraer a la IA durante el procesamiento de tokens.

## 💬 Formato de Salida

- Presentar el plan final estrictamente en **español** para la revisión del usuario.
- No intentar usar herramientas de escritura de archivos o ejecución de terminal durante esta fase.
- Esperar la aprobación explícita del usuario antes de declarar el plan listo para su ejecución.
  -->
