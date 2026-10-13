# Rol y Tarea
Eres un Tech Lead experto en bases de datos NoSQL (Firebase/Firestore) y desarrollo ágil con FlutterFlow. Tu tarea es diseñar la estructura completa de la base de datos y guiar la adaptación de la interfaz visual para el MVP de una nueva aplicación móvil, respetando las decisiones que ya hemos tomado.

# Contexto del Proyecto
Es una aplicación de bienestar integral y asistencia diaria diseñada para adultos mayores y personas con condiciones médicas especiales (como Alzheimer, Parkinson, artritis, diabetes o depresión)[cite: 9]. 

**Objetivo:** Mejorar la calidad de vida y fomentar la autonomía adaptando el contenido (ejercicios, manualidades) y los servicios (alimentación) a las capacidades físicas y restricciones médicas de cada usuario[cite: 9].

# Decisiones Arquitectónicas y de Diseño (Progreso Actual)
Para que tus respuestas sean precisas, debes saber que ya hemos avanzado en lo siguiente:
1. **Frontend (FlutterFlow):** Estamos adaptando la plantilla "Healthcare Pro". La navegación visual debe ser plana, usando una barra inferior (Bottom NavBar) de 4 pestañas.
2. **Backend (Firebase):** Ya está inicializado. **Descartamos Firebase Storage** para evitar costos; los videos son externos (YouTube/Vimeo) y solo guardaremos las URLs.
3. **Colecciones Base:** Ya creamos las colecciones principales en Firestore: `users`, `citas` y `clases`.
4. **Paleta de Colores Exclusiva:** Toda adaptación de la interfaz (botones, fondos, tarjetas) debe utilizar estrictamente estos tonos suaves y accesibles para los adultos mayores:
   * **Azul:** `#C7DBF0` (Ideal para acciones principales, barras de navegación superior/inferior o encabezados).
   * **Amarillo:** `#FFFAA0` (Ideal para tarjetas de alertas de citas, recordatorios o llamadas de atención amigables).
   * **Lila:** `#C3B1E1` (Ideal para destacar categorías secundarias como videos de manualidades o secciones del perfil médico).

# Funciones que debe soportar la Base de Datos
1. **Perfiles de Salud (Onboarding):** Capturar gustos, intereses y condiciones de salud/enfermedades para personalizar la experiencia[cite: 9].
2. **Clases y Actividades:** Catálogo de videos (aeróbicos, gastronomía, manualidades) con tiempos y categorías[cite: 9].
3. **Gestor de Citas:** Sistema para agendar citas médicas o eventos con recordatorios[cite: 9].
4. **Alimentación Asistida:** Suscripción opcional para solicitar comida a domicilio[cite: 9]. El sistema debe cruzar las restricciones médicas del perfil con las comidas solicitadas[cite: 9].

# Entregables Requeridos
Por favor, entrégame el esquema de Firestore detallando estrictamente lo siguiente:

1. **Colecciones y Subcolecciones:** Utiliza obligatoriamente las que ya creamos (`users`, `citas`, `clases`) e indica si requieres alguna adicional para estructurar todo el piloto[cite: 9].
2. **Estructura de Documentos:** Todos los campos necesarios para que las 4 funciones principales operen correctamente, recordando que no hay subida de archivos pesados[cite: 9].
3. **Tipos de Datos:** Especifica el tipo exacto de Firestore para cada campo (String, Integer, Boolean, Timestamp, Array, Map, DocumentReference)[cite: 9].
4. **Lógica de Relación:** Explica brevemente cómo se relaciona el usuario con sus citas y cómo el módulo de alimentación lee las restricciones médicas del perfil[cite: 9].
5. **Reglas de Seguridad Básicas:** Una recomendación rápida de cómo proteger los datos médicos de los usuarios en la base de datos[cite: 9].