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

  home: {
    greeting: (name) => `¡Hola, ${name}!`,
    freeTyping: 'Teclado libre',
    freeTypingDescription: 'Escribí textos de prueba con la guía del teclado y las manos.',
    lessonsSoon: 'Muy pronto: lecciones paso a paso.',
    switchProfile: 'Cambiar de perfil',
    editProfile: 'Editar mi perfil',
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
