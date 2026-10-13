export const CAT = {
  aerobicos:   { n: 'Aeróbicos',    ic: 'run',   t: 'blue' },
  bienestar:   { n: 'Bienestar',    ic: 'lotus', t: 'blue' },
  gastronomia: { n: 'Gastronomía',  ic: 'pot',   t: 'peach' },
  musica:      { n: 'Música',       ic: 'music', t: 'peach' },
  manualidades:{ n: 'Manualidades', ic: 'craft', t: 'sage' },
  charlas:     { n: 'Charlas',      ic: 'chat',  t: 'sage' },
}

export const CONDS = {
  alzheimer: 'Alzheimer', diabetes: 'Diabetes', artritis: 'Artritis',
  parkinson: 'Parkinson', depresion: 'Depresión', hipertension: 'Hipertensión',
}

export const MOB = {
  ninguna: 'Ninguna',
  baston: 'Uso bastón o andador',
  silla: 'Uso silla de ruedas',
  limitada: 'Movilidad limitada en brazos o manos',
}

export const ADAPT = {
  diabetes: 'Sin azúcar añadida y con carbohidratos de absorción lenta.',
  hipertension: 'Bajo en sal, sazonado con hierbas.',
  parkinson: 'Texturas blandas y porciones fáciles de cortar.',
  artritis: 'Empaques fáciles de abrir y platos antiinflamatorios (omega 3).',
  alzheimer: 'Platos simples, siempre a la misma hora y con una nota clara de qué comer.',
  depresion: 'Alimentos ricos en omega 3 y horarios regulares.',
}

// dows = días de la semana en que se repite (0 = lunes). Cada ocurrencia tiene id `${id}-${fecha}`.
// steps = [título, instrucción, segundos]
export const SEED = [
  { id: 'aer1', video: { id: '67wl05H1K3U', title: 'Rutina de entrenamiento en silla para adultos mayores', by: 'Mariana Quevedo | Fisioterapia Querétaro' }, cat: 'aerobicos', title: 'Aeróbicos suaves en silla', dows: [0, 2, 4], time: '09:00', min: 20, level: 'Suave',
    desc: 'Rutina guiada de movilidad y corazón. Se hace sentado/a, sin impacto.',
    host: 'Prof. Carlos R.', place: 'Salón Luz', modes: ['presencial', 'virtual'], cupos: 12, taken: 8, seated: true,
    zoom: 'https://zoom.us/j/0000000000',
    steps: [
      ['Calentamiento de cuello', 'Espalda recta. Gira la cabeza despacio a la derecha y a la izquierda.', 30],
      ['Círculos de hombros', 'Lleva los hombros hacia atrás en círculos grandes y lentos.', 40],
      ['Marcha sentado', 'Levanta una rodilla y luego la otra, moviendo los brazos.', 60],
      ['Brazos arriba', 'Sube ambos brazos sobre la cabeza inhalando. Bájalos exhalando.', 45],
      ['Giro de tronco', 'Manos en los hombros, gira suavemente a un lado y al otro.', 45],
      ['Estiramiento final', 'Estira los brazos al frente y respira profundo. ¡Muy bien!', 40],
    ] },
  { id: 'aer2', video: { id: 'JcK-lAS2Glg', title: 'Ejercicios en silla para mayores: fácil y seguro', by: 'En marcha Fisioterapia' }, cat: 'aerobicos', title: 'Caminata y equilibrio', dows: [2], time: '10:00', min: 30, level: 'Moderado',
    desc: 'Ejercicios de equilibrio de pie, con silla de apoyo.',
    host: 'Prof. Carlos R.', place: 'Parque central', modes: ['presencial'], cupos: 10, taken: 10, seated: false,
    steps: [
      ['Postura firme', 'De pie, agarrado/a al respaldo de la silla. Pies al ancho de la cadera.', 30],
      ['Apoyo en un pie', 'Levanta un pie unos centímetros y sostén. Cambia de pie.', 60],
      ['Caminata en el lugar', 'Camina sin moverte de sitio, a tu ritmo.', 90],
    ] },
  { id: 'coc1', video: { id: 'nKFwicPfdaM', title: 'Cuatro ingredientes: desayuno, almuerzo o cena', by: 'Cocina de Addy' }, cat: 'gastronomia', title: 'Cocina saludable', dows: [1, 3], time: '11:00', min: 45, level: 'Suave',
    desc: 'Recetas sencillas y nutritivas paso a paso. Cocinamos juntos una receta de temporada.',
    host: 'Dra. Elena M.', place: 'Cocina comunitaria', modes: ['presencial', 'virtual'], cupos: 15, taken: 9, seated: true,
    zoom: 'https://zoom.us/j/1111111111' },
  { id: 'man1', video: { id: 'x2OPqkaS99M', title: 'Manualidades fáciles para personas mayores', by: 'Las mil y una actividades' }, cat: 'manualidades', title: 'Tarjetas de colores', dows: [3], time: '15:00', min: 60, level: 'Suave',
    desc: 'Creamos tarjetas con papel, sellos y pegatinas para regalar. Materiales incluidos.',
    host: 'Marta P.', place: 'Salón Arte', modes: ['presencial', 'virtual'], cupos: 12, taken: 5, seated: true,
    zoom: 'https://zoom.us/j/2222222222' },
  { id: 'bie1', video: { id: 'WkzMBxohi1M', title: 'Respiración diafragmática guiada, 5 minutos', by: 'MUUK' }, cat: 'bienestar', title: 'Respiración y calma', dows: [1, 5, 6], time: '08:30', min: 10, level: 'Suave',
    desc: 'Respiración guiada para empezar el día con calma. Ideal para ansiedad y estrés.',
    host: 'Dra. Elena M.', place: 'En línea', modes: ['virtual'], cupos: 20, taken: 11, seated: true,
    zoom: 'https://zoom.us/j/3333333333',
    steps: [
      ['Inhala', 'Inhala por la nariz contando hasta 4.', 20],
      ['Sostén', 'Sostén el aire suavemente contando hasta 4.', 20],
      ['Exhala', 'Suelta el aire por la boca contando hasta 6.', 30],
      ['Descansa', 'Respira normal. Siente cómo se relajan tus hombros.', 30],
    ] },
  { id: 'mus1', cat: 'musica', title: 'Canto y recuerdos', dows: [4], time: '16:00', min: 50, level: 'Suave',
    desc: 'Cantamos canciones de ayer y de hoy. Muy bueno para la memoria.',
    host: 'Julián S.', place: 'Salón Luz', modes: ['presencial'], cupos: 16, taken: 7, seated: true },
  { id: 'cha1', cat: 'charlas', title: 'Jardinería en balcón', dows: [5], time: '11:00', min: 40, level: 'Suave',
    desc: 'Charla propuesta por una compañera: cómo cultivar hierbas y flores en poco espacio.',
    host: 'Doña Rosa', place: 'Salón Arte', modes: ['presencial', 'virtual'], cupos: 10, taken: 3, seated: true,
    zoom: 'https://zoom.us/j/4444444444' },
]

export const MENU = [
  ['Avena con manzana y canela', 'Pollo al horno con puré de calabaza', 'Sopa de verduras y tortilla francesa'],
  ['Yogur natural con nueces y pera', 'Pescado al vapor con arroz integral', 'Crema de zapallo y tostada integral'],
  ['Huevos revueltos con tostada integral', 'Lentejas con verduras', 'Ensalada tibia de atún y papa'],
  ['Batido de plátano y avena', 'Bowl de quinoa y salmón', 'Caldo de pollo con fideos finos'],
  ['Pan integral con aguacate', 'Pavo con verduras salteadas', 'Revuelto de espinaca y queso fresco'],
  ['Avena con frutos rojos', 'Estofado suave de ternera y zanahoria', 'Sopa de calabaza y pan tostado'],
  ['Tostada con queso fresco y tomate', 'Arroz con pollo y guisantes', 'Tortilla de verduras y fruta'],
  // semana B
  ['Yogur con avena y durazno', 'Pechuga a la plancha con arroz y brócoli', 'Crema de zanahoria y sándwich de pavo'],
  ['Pan integral con huevo cocido', 'Merluza al horno con papas cocidas', 'Sopa de lentejas y fruta'],
  ['Avena con plátano y nueces', 'Pollo guisado con verduras', 'Tortilla de espinaca y ensalada'],
  ['Tostada con aguacate y tomate', 'Albóndigas de pavo con puré de papa', 'Sopa de pollo con verduras'],
  ['Batido de fresa y avena', 'Arroz integral con pescado y ensalada', 'Crema de calabacín y pan tostado'],
  ['Pan con queso fresco y fruta', 'Lentejas estofadas con arroz', 'Revuelto de verduras y yogur'],
  ['Huevos con tomate y tostada', 'Pastel de carne suave con puré', 'Caldo de verduras y tortilla'],
]

export const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return d }
export const fmtDate = s => new Date(s + 'T00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
/** Calendario real: cada actividad se repite en sus días y se generan las ocurrencias de -7 a +14 días. */
export const seedActs = (from = new Date()) => {
  const out = []
  for (let i = -7; i < 14; i++) {
    const d = addDays(i, from), dow = (d.getDay() + 6) % 7, date = iso(d)
    for (const a of SEED) if (a.dows.includes(dow)) out.push({ ...a, id: `${a.id}-${date}`, base: a.id, date })
  }
  return out
}

/** Menú por fecha: cambia cada día y alterna entre dos semanas distintas. */
export const menuFor = date => {
  const n = Math.floor(Date.parse(date + 'T00:00:00Z') / 864e5)
  return MENU[(Math.floor((n + 3) / 7) % 2) * 7 + (n + 3) % 7]
}

/** Una actividad termina a su hora de inicio + su duración. */
export const hasEnded = (a, now = Date.now()) => new Date(`${a.date}T${a.time}`).getTime() + a.min * 60000 <= now
