# Rol y Tarea
Eres un desarrollador Front-End experto en FlutterFlow y un especialista en UX/UI enfocado en accesibilidad (Accessibility). Tu tarea es estructurar el esquema de pantallas y el diseño visual para el MVP de una aplicación móvil.

# Contexto del Proyecto y Audiencia
Es una app de bienestar y asistencia diaria para adultos mayores y personas con condiciones médicas (Alzheimer, Parkinson, artritis, diabetes, depresión).

**Reglas de Oro de UX para este proyecto:** 
1. **Navegación plana:** Sin menús ocultos tipo hamburguesa. Todo a 2 toques de distancia.
2. **Accesibilidad visual y motriz:** Letras grandes (mínimo 16px para cuerpo, 24px para títulos), alto contraste, botones gigantes (mínimo 50px de alto con mucho 'padding' para personas con temblores o artritis).
3. **Carga cognitiva baja:** Lenguaje claro y directo. Cero fricción.

# Estructura de Pantallas Requerida
La aplicación tendrá 9 pantallas distribuidas en 3 niveles lógicos.

## Nivel 1: Flujo de Entrada (Fuera del NavBar)
* **1. Login:** Diseño limpio. Un botón gigante de "Ingresar con Google" y/o "Ingresar con Teléfono". Sin contraseñas complejas.
* **2. Onboarding Médico (Solo primera vez):** Formulario visual para capturar condiciones de salud, intereses y si requieren el "Plan de alimentación". Usar botones grandes o `ChoiceChips`, evitar `Dropdowns` pequeños.

## Nivel 2: Barra de Navegación Inferior (Bottom NavBar)
* **3. Inicio (Home):** El "Resumen del día". Saludo claro, tarjeta con la cita médica más próxima, acceso rápido al menú de comida del día (si aplica) y sugerencia de "Tu video de hoy".
* **4. Actividades (Catálogo):** Estilo "Netflix simplificado". Tarjetas grandes con imágenes agrupadas en: Aeróbicos, Gastronomía, Manualidades.
* **5. Citas y Salud:** Lista cronológica de citas y recordatorios. Debe destacar un Botón Flotante (FAB) gigante para "Agregar Cita".
* **6. Mi Perfil:** Foto, resumen de restricciones médicas y botón grande para "Contactar Familiar/Soporte".

## Nivel 3: Pantallas Secundarias (A un clic, con botón 'Atrás' gigante)
* **7. Reproductor de Video:** Contenedor de video (YouTube/Vimeo embebido), título gigante, duración y materiales necesarios.
* **8. Crear Cita:** Campos de texto grandes para nombre del doctor, selectores nativos grandes de Fecha/Hora y un Switch para "Activar recordatorio".
* **9. Plan de Alimentación:** Muestra el menú del día validando que es seguro ("Apto para tu diabetes"). Si no está suscrito, muestra botón de solicitud.

# Entregables Esperados
Por favor, entrégame lo siguiente:
1. **Árbol de Widgets (Widget Tree):** Detalla la estructura exacta de componentes en FlutterFlow (Column, Row, Container, ListView) para construir la pantalla "Inicio (Home)" y la pantalla "Actividades".
2. **Componentes Recomendados:** ¿Qué widgets nativos de FlutterFlow son los más adecuados para que un usuario con Parkinson o baja visión interactúe sin frustración?
3. **Guía de Estilos:** Una recomendación rápida de variables de diseño (Theme Settings en FlutterFlow): tamaño tipográfico base y paleta de colores de alto contraste.