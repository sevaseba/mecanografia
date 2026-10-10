// All user-facing text lives here (Rioplatense Spanish, using "vos").

export const strings = {
  appName: 'Mecanografía',
  offlineReady: 'Listo: ya podés usar Mecanografía sin conexión.',

  modes: {
    kids: 'Infantil',
    adult: 'Adulto',
  },

  picker: {
    title: '¿Quién va a practicar?',
    welcome:
      'La mecanografía, también llamada dactilografía, es la técnica de escribir con los diez dedos sin mirar el teclado. ' +
      'Creá un perfil para cada persona de la familia y empezá a practicar.',
    createFirst: 'Crear el primer perfil',
    newProfile: 'Nuevo perfil',
    profileSummary: (modeName, layoutName) => `${modeName} · ${layoutName}`,
    choose: (name) => `Practicar como ${name}`,
    edit: 'Editar',
    editLabel: (name) => `Editar el perfil de ${name}`,
    remove: 'Borrar',
    removeLabel: (name) => `Borrar el perfil de ${name}`,
    removeTitle: (name) => `¿Borrar el perfil de ${name}?`,
    removeMessage: 'Se pierde todo su progreso, en todas las distribuciones. No se puede deshacer.',
    removeConfirm: 'Borrar perfil',
    removed: (name) => `Se borró el perfil de ${name}.`,
    cancel: 'Cancelar',
    notPersistent:
      'Este navegador no permite guardar datos (por ejemplo, en una ventana privada): los perfiles se pierden al cerrarlo.',
    readOnly:
      'Estos datos fueron guardados por una versión más nueva de Mecanografía. Para no dañarlos, los cambios no se van a guardar. Actualizá la página.',
  },

  backup: {
    title: 'Respaldo',
    description:
      'Guardá un archivo con todos los perfiles y su progreso, para no perderlos o para pasarlos a otra compu.',
    export: 'Exportar respaldo',
    import: 'Importar respaldo',
    fileName: (date) => `mecanografia-respaldo-${date}.json`,
    exported: 'Listo: se descargó el respaldo.',
    importTitle: 'Importar respaldo',
    importMessage: (current, incoming) =>
      `Se van a reemplazar ${current} ${current === 1 ? 'perfil actual' : 'perfiles actuales'} ` +
      `por ${incoming} ${incoming === 1 ? 'perfil' : 'perfiles'} del respaldo. Esto no se puede deshacer.`,
    importConfirm: 'Reemplazar',
    imported: (count) => `Listo: se importaron ${count} ${count === 1 ? 'perfil' : 'perfiles'}.`,
    errors: {
      'not-json': 'Ese archivo no es un respaldo de Mecanografía (no se pudo leer).',
      'not-backup': 'Ese archivo no es un respaldo de Mecanografía.',
      'newer-version': 'Ese respaldo es de una versión más nueva de Mecanografía. Actualizá la página e intentá de nuevo.',
    },
  },

  profileForm: {
    newTitle: 'Nuevo perfil',
    editTitle: 'Editar perfil',
    groups: { who: 'Quién practica', look: 'Cómo se ve', keyboard: 'Teclado' },
    nameLabel: 'Nombre',
    avatarLabel: 'Elegí un avatar',
    modeLabel: 'Modo',
    modeDescriptions: {
      kids: 'Teclado grande y colorido. Espera a que presiones la tecla correcta.',
      adult: 'Sobrio, con palabras por minuto y precisión.',
    },
    layoutLabel: 'Distribución del teclado',
    layoutDescriptions: {
      'es-latam': 'Con ñ, tildes, ¿ y ¡.',
      'en-us': 'El teclado en inglés de Estados Unidos.',
    },
    create: 'Crear perfil',
    save: 'Guardar cambios',
    cancel: 'Cancelar',
    removeProfile: 'Borrar este perfil',
    errors: {
      'name-empty': 'Escribí un nombre.',
      'name-taken': 'Ya hay un perfil con ese nombre.',
      invalid: 'Revisá los datos del perfil.',
      'not-found': 'Ese perfil ya no existe.',
    },
    saved: 'Perfil guardado.',
  },

  calibration: {
    title: 'Probar mi teclado (opcional)',
    intro: 'Dos teclas alcanzan para saber qué distribución tiene configurada tu compu.',
    step: (number, total) => `Paso ${number} de ${total}`,
    prompts: {
      Semicolon: 'Presioná la tecla que está a la derecha de la L.',
      Equal: 'Presioná la tecla que está a la izquierda de Borrar.',
    },
    captureLabel: 'Área de prueba: presioná la tecla que se indica',
    captureIdle: 'Hacé clic acá y presioná la tecla',
    captureActive: 'Esperando la tecla…',
    wrongKey: 'Esa no es. Buscá la tecla marcada en el dibujo.',
    matches: (name) => `¡Bien! Tu compu escribe como el teclado ${name}.`,
    matchesSelected: 'Coincide con la distribución elegida.',
    differs: (name) => `Ojo: elegiste otra distribución. ¿Usamos ${name}?`,
    useLayout: (name) => `Usar ${name}`,
    noMatch: (chars) =>
      `Tu teclado escribió ${chars}: no coincide con ninguna distribución de Mecanografía ` +
      '(por ejemplo, puede estar configurado como Español de España). Cambiá la distribución en la configuración de idioma y teclado de tu sistema.',
    again: 'Probar de nuevo',
  },

  // Kids mode: varied and never negative. One is picked at random each time.
  encouragement: {
    exerciseDone: ['¡Bien!', '¡Muy bien!', '¡Genial!', '¡Así se hace!', '¡Bárbaro!', '¡Excelente!'],
    passed: ['¡Lo lograste!', '¡Sos una máquina!', '¡Qué bien escribiste!', '¡Increíble!', '¡Lección superada!'],
    retry: ['¡Vas muy bien!', '¡Buen intento!', '¡Seguí practicando!', '¡Ya casi lo tenés!'],
  },

  medals: {
    title: 'Medallas',
    earnedNow: '¡Ganaste una medalla nueva!',
    earnedNowMany: '¡Ganaste medallas nuevas!',
    locked: 'Todavía no',
    names: {
      'first-lesson': 'Primera lección',
      'five-lessons': '5 lecciones',
      'streak-3': 'Racha de 3 días',
      'streak-7': 'Racha de 7 días',
    },
    unit: (unitTitle) => `Nivel completo: ${unitTitle}`,
  },

  sound: {
    label: 'Sonido',
    on: 'Sonido activado',
    off: 'Sonido desactivado',
  },

  voice: {
    label: 'Voz',
    on: 'Voz activada: se leen las indicaciones',
    off: 'Voz desactivada',
  },

  progress: {
    title: 'Mi progreso',
    back: 'Volver al inicio',
    description: 'Tus números de las últimas sesiones de lecciones.',
    layoutLabel: 'Distribución',
    avgWpm: 'PPM promedio',
    avgWpmKids: 'Palabras por minuto',
    avgWpmHint: 'últimas 10 sesiones',
    avgAccuracy: 'Precisión promedio',
    lessonsPassed: 'Lecciones aprobadas',
    streak: 'Racha',
    streakDays: (days) => `${days} ${days === 1 ? 'día' : 'días'}`,
    streakHint: 'seguidos, practicando',
    chartTitle: 'Evolución de las PPM',
    chartTitleKids: 'Tu velocidad',
    chartSummary: (count, min, max, last) =>
      `PPM en las últimas ${count} sesiones: mínimo ${min}, máximo ${max}, última ${last}.`,
    chartAxisSessions: 'Sesiones',
    chartTable: 'Ver los datos como tabla',
    chartSession: 'Sesión',
    chartTooltip: (number, date, wpm, accuracy) => `Sesión ${number} (${date}): ${wpm} PPM · ${accuracy} %`,
    noSessions: 'Todavía no hay sesiones con esta distribución. ¡Hacé una lección para empezar!',
    troubleTitle: 'Teclas con más errores',
    troubleTitleKids: 'Teclas para practicar más',
    troubleRate: (errorRate) => `${errorRate} % de errores`,
    troubleNone: 'Todavía no hay suficientes datos de errores.',
    spaceKey: 'espacio',
    none: '–',
  },

  theme: {
    label: 'Tema',
    options: { auto: 'Automático (como el sistema)', light: 'Claro', dark: 'Oscuro' },
  },

  // The hands drawn with the keyboard: their look and where they go.
  hands: {
    // "Tus manos" alone read as where to put your real hands: say it is the drawing.
    label: 'Manos de la pantalla',
    kidsLabel: 'Elegí las manos de la pantalla',
    hint: 'Un dibujo de manos te muestra qué dedo usar para cada tecla.',
    change: 'Cambiar las manos',
    done: 'Listo',
    skins: {
      'tone-1': 'Piel muy clara',
      'tone-2': 'Piel clara',
      'tone-3': 'Piel media',
      'tone-4': 'Piel morena',
      'tone-5': 'Piel oscura',
      web: 'Telaraña',
      armor: 'Armadura',
      tiger: 'Tigre',
      sparkle: 'Brillos',
      robot: 'Robot',
      monster: 'Monstruo',
    },
    placementLabel: 'Dónde se dibujan',
    placements: { below: 'Abajo del teclado', over: 'Sobre el teclado' },
  },

  pwa: {
    updateAvailable: 'Hay una actualización disponible.',
    update: 'Actualizar',
    install: 'Instalar app',
    installHint: 'Instalá Mecanografía para abrirla como una app, también sin conexión.',
  },

  home: {
    greeting: (name) => `¡Hola, ${name}!`,
    progress: 'Mi progreso',
    lessons: 'Lecciones',
    lessonsDescription: 'Aprendé paso a paso, de la fila guía a los números.',
    start: 'Empezar',
    continue: 'Seguir',
    nextLesson: (number, title) => `Lección ${number}: ${title}`,
    allLessons: 'Ver todas las lecciones',
    courseDone: '¡Completaste todo el curso!',
    freeTyping: 'Teclado libre',
    freeTypingDescription: 'Escribí textos de prueba con la guía del teclado y las manos.',
    switchProfile: 'Cambiar de perfil',
    editProfile: 'Editar mi perfil',
    stats: {
      wpm: (wpm) => `${wpm} PPM`,
      accuracy: (accuracy) => `${accuracy} % de precisión`,
      stars: (count) => `★ ${count} ${count === 1 ? 'estrella' : 'estrellas'}`,
      medals: (count) => `🏅 ${count} ${count === 1 ? 'medalla' : 'medallas'}`,
      streak: (days) => `🔥 ${days} ${days === 1 ? 'día' : 'días seguidos'}`,
    },
  },

  lessons: {
    title: 'Lecciones',
    back: 'Volver al inicio',
    summary: (layoutName, done, total) => `Curso de ${layoutName}: ${done} de ${total} lecciones aprobadas`,
    loading: 'Cargando lecciones…',
    loadError: 'No se pudieron cargar las lecciones. Revisá la conexión y volvé a intentar.',
    lessonNumber: (number) => `Lección ${number}`,
    lessonTitle: (number, title) => `Lección ${number}: ${title}`,
    newKeysLabel: 'Teclas nuevas',
    review: 'Repaso',
    status: {
      locked: 'Bloqueada',
      available: 'Disponible',
      completed: 'Aprobada',
    },
    recommended: 'Seguí acá',
    recommendedFirst: 'Empezá acá',
    anyOrderHint: 'Conviene hacerlas en orden, pero podés elegir cualquiera.',
    progress: 'Mi progreso',
    lockedHint: 'Aprobá cada lección para abrir la siguiente.',
    stars: (count) => `${count} de 3 estrellas`,
    exerciseCounter: (current, total) => `Ejercicio ${current} de ${total}`,
    restartLesson: 'Empezar de nuevo',
    passedTitle: '¡Lección aprobada!',
    failedTitle: 'Todavía no aprobaste',
    perfect: '¡Perfecta! Conseguiste las tres estrellas.',
    // Kids: what the voice says (and the screen shows) about the next star. Recorded clips:
    // after changing one, run tools/generate-voice.mjs.
    resultVoice: {
      perfect: '¡Ganaste las tres estrellas! ¡Lo hiciste genial!',
      accuracy: 'Para la próxima estrella, apretá cada tecla con cuidado.',
      speed: 'Para la próxima estrella, escribí un poquito más rápido.',
      both: 'Para la próxima estrella, apretá con cuidado y un poquito más rápido.',
      failed: '¡Casi! Probá de nuevo, mirando bien cada tecla.',
    },
    starGoals: {
      title: '¿Cómo se ganan las estrellas?',
      needs: {
        adult: (accuracy, wpm) => (wpm === null ? `${accuracy} % de precisión` : `${accuracy} % de precisión y ${wpm} PPM`),
        kids: (accuracy, wpm) =>
          wpm === null ? `Acertá el ${accuracy} % de las teclas` : `Acertá el ${accuracy} % y escribí ${wpm} palabras por minuto`,
      },
      done: '✓ ¡Conseguida!',
      missing: {
        adult: { accuracy: 'Te faltó precisión', speed: 'Te faltó velocidad', both: 'Te faltó precisión y velocidad' },
        kids: {
          accuracy: 'Te falta un poquito de puntería',
          speed: 'Te falta un poquito de velocidad',
          both: 'Te falta un poquito de puntería y de velocidad',
        },
      },
    },
    failedMessage: (needed) => `Para aprobar necesitás ${needed} % de precisión. ¡Probá de nuevo, sin apuro!`,
    newRecord: '¡Nuevo récord!',
    accuracy: (value) => `Precisión: ${value} %`,
    wpm: (value) => `Velocidad: ${value ?? '–'} PPM`,
    netWpm: (value) => `PPM neto: ${value ?? '–'}`,
    grossWpm: (value) => `PPM bruto: ${value ?? '–'}`,
    correctedErrors: (count) => `Errores corregidos: ${count}`,
    uncorrectedErrors: (count) => `Errores sin corregir: ${count}`,
    nextLesson: 'Siguiente lección',
    retry: 'Repetir',
    backToMap: 'Ver todas las lecciones',
    courseFinished: '¡Terminaste el curso!',
  },

  handsIntro: {
    title: 'Posición de las manos',
    mapLink: 'Posición de las manos',
    mapLinkDescription: 'Repasá dónde va cada dedo antes de empezar.',
    stepCounter: (current, total) => `Paso ${current} de ${total}`,
    next: 'Siguiente',
    skip: 'Saltear',
    listen: 'Escuchar',
    startLesson: 'Empezar la lección',
    backToMap: 'Volver a las lecciones',
    // Each text comes in two versions: kids read less, so theirs is short and direct.
    // Bodies receive the index fingers' keys (left, right) and the home row labels.
    steps: {
      fingers: {
        title: 'Tus dedos',
        adult: () =>
          'Cada dedo tiene un color. Las teclas del mismo color se presionan siempre con ese dedo. ' +
          'Los pulgares se encargan de la barra espaciadora.',
        kids: () => 'Cada dedo tiene un color. Cada tecla se aprieta con el dedo de su mismo color.',
      },
      home: {
        title: 'La fila guía',
        adult: (left, right, keys) =>
          `Apoyá los dedos índice sobre la ${left} y la ${right}: tienen un relieve que se siente con la yema. ` +
          `Los demás dedos van al lado, uno en cada tecla: ${keys}. Los pulgares descansan sobre la barra espaciadora.`,
        kids: (left, right) =>
          `Poné los índices en la ${left} y la ${right}: tienen una rayita. ` +
          'Los otros dedos van en las teclas de al lado, uno en cada una. Los pulgares, en el espacio.',
      },
      homeKeys: {
        title: 'Probá cada dedo',
        adult: () => 'Con las manos en la fila guía, presioná la tecla iluminada con el dedo iluminado.',
        kids: () => 'Apretá la tecla que brilla.',
      },
      zones: {
        title: 'La zona de cada dedo',
        adult: () => 'Cada dedo se estira hasta las teclas de su color y después vuelve a su lugar en la fila guía.',
        kids: () => 'Estirá el dedo y volvé a tu lugar.',
      },
      done: {
        title: '¡Listo!',
        adult: (left, right) =>
          `Ya sabés dónde va cada dedo. Cada vez que empieces, buscá los relieves de la ${left} y la ${right} y apoyá las manos en la fila guía.`,
        kids: () => '¡Ya sabés dónde va cada dedo!',
      },
    },
    // Kids may not know "anular" or "mayor" (nor left from right): their texts name the
    // finger by its color, and the hands drawing shows which hand.
    pressKey: {
      adult: (key, finger) => `Presioná ${key} con el ${finger}.`,
      kids: (key, finger) => `Apretá ${key} con ${finger}.`,
    },
    backHome: {
      adult: (key, finger) => `Ahora volvé a ${key} con el ${finger}.`,
      kids: (key) => `¡Volvé a ${key}!`,
    },
    // Finger colors as painted in css/themes.css (--finger-*): keep both in sync.
    kidsFingers: {
      L5: 'el dedo rosa',
      L4: 'el dedo amarillo',
      L3: 'el dedo verde',
      L2: 'el dedo azul',
      R2: 'el dedo azul',
      R3: 'el dedo verde',
      R4: 'el dedo amarillo',
      R5: 'el dedo rosa',
      T: 'el pulgar',
    },
    // Step "Tus dedos": each finger's name next to its color, pinky to thumb.
    fingerLegend: [
      { group: '5', name: 'meñique' },
      { group: '4', name: 'anular' },
      { group: '3', name: 'mayor' },
      { group: '2', name: 'índice' },
      { group: 'thumb', name: 'pulgar' },
    ],
    letter: (label) => `la ${label}`,
    otherKey: (label) => `la tecla ${label}`,
    spaceBar: 'la barra espaciadora',
    miss: { adult: '¡Casi! Buscá la tecla iluminada.', kids: '¡Casi! Buscá la tecla que brilla.' },
    focusPrompt: 'Hacé clic acá para seguir',
  },

  freeTyping: {
    title: 'Teclado libre',
    textLabel: 'Texto',
    samples: {
      es: {
        name: 'Español',
        text: '¿Viste al pingüino de Ushuaia? Él comió ñoquis con mamá y tomó un té. ¡Qué día increíble!',
      },
      en: {
        name: 'Inglés',
        text: "Don't forget: it's late; we'll leave soon. The dog's toy is under Sam's bed.",
      },
    },
  },

  practice: {
    back: 'Volver al inicio',
    layoutUsed: (name) => `Teclado: ${name}`,
    restart: 'Reiniciar',
    practiceLabel: 'Área de práctica: escribí el texto que se muestra',
    focusPrompt: 'Hacé clic acá para escribir',
    wpm: (wpm) => `${wpm ?? '–'} PPM`,
    wpmLabel: 'Palabras por minuto',
    accuracy: (accuracy) => `${accuracy ?? '–'} %`,
    accuracyLabel: 'Precisión',
    progress: (position, total) => `${position}/${total}`,
    progressLabel: 'Avance',
    finished: '¡Terminaste!',
    finishedStats: ({ wpm, accuracy }) => `${wpm ?? '–'} PPM · ${accuracy ?? '–'} % de precisión`,
    // Short finger cue under the hands (adult mode only).
    fingersNow: (names) => names.join(' + '),
    fingersThen: (now, then) => `${now} → ${then}`,
    // Full description for screen readers.
    srNextKey: (keys) => `Próxima tecla: ${keys}.`,
    srDeadReady: (deadChar, keys) => `Ya presionaste ${deadChar}. Ahora: ${keys}.`,
    srThen: ', después ',
    srKey: (label, finger) => `${label} (${finger})`,
    srWithModifier: (modifier, key) => `${modifier} + ${key}`,
    space: 'la barra espaciadora',
    enter: 'Entrar',
    shiftLeft: 'Mayús izquierda',
    shiftRight: 'Mayús derecha',
    altGraph: 'Alt Gr',
    notTypable: (char, layoutName) =>
      `El carácter «${char}» no se puede escribir con la distribución ${layoutName}.`,
  },

  layoutCheck: {
    systemIs: (systemName, selectedName) =>
      `Atención: tu compu está configurada con el teclado ${systemName}, pero acá elegiste ${selectedName}. ` +
      'Las teclas no van a coincidir.',
    systemUnknown: (selectedName) =>
      `Atención: tu compu está configurada con una distribución de teclado que no es ${selectedName}. ` +
      'Algunas teclas no van a coincidir.',
    typingMismatch: (selectedName) =>
      `Parece que tu teclado no está escribiendo como ${selectedName}: algunas teclas producen otros caracteres.`,
    howToFix: 'Elegí otra distribución o cambiala en la configuración de idioma y teclado de tu sistema.',
    useLayout: (name) => `Usar ${name}`,
    noPhysicalKeyboard: 'Para practicar mecanografía necesitás un teclado físico.',
  },

  fingers: {
    L5: 'meñique izquierdo',
    L4: 'anular izquierdo',
    L3: 'mayor izquierdo',
    L2: 'índice izquierdo',
    R2: 'índice derecho',
    R3: 'mayor derecho',
    R4: 'anular derecho',
    R5: 'meñique derecho',
    L1: 'pulgar izquierdo',
    R1: 'pulgar derecho',
    T: 'pulgar',
  },

  keyLabels: {
    Backspace: 'Borrar',
    Tab: 'Tab',
    CapsLock: 'Bloq Mayús',
    Enter: 'Entrar',
    ShiftLeft: 'Mayús',
    ShiftRight: 'Mayús',
    ControlLeft: 'Ctrl',
    ControlRight: 'Ctrl',
    MetaLeft: 'Win',
    MetaRight: 'Win',
    AltLeft: 'Alt',
    AltRight: 'Alt',
    AltGraph: 'Alt Gr',
    ContextMenu: 'Menú',
    Space: '',
  },

  notFound: {
    title: 'No encontramos esta pantalla',
    body: 'Puede que el enlace esté mal escrito o que la pantalla ya no exista.',
    back: 'Volver al inicio',
  },
};
