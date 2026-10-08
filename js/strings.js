// All user-facing text lives here (Rioplatense Spanish, using "vos").

export const strings = {
  appName: 'Mecanografía',
  offlineReady: 'Listo: ya podés usar Mecanografía sin conexión.',

  home: {
    title: 'Mecanografía',
    lead: 'Aprendé a escribir rápido y sin mirar el teclado, usando todos los dedos.',
    about:
      'La mecanografía, también llamada dactilografía, es la técnica de escribir con los diez dedos. ' +
      'Con un poco de práctica todos los días, vas a escribir cada vez más rápido y con menos errores.',
    comingSoon: 'Muy pronto vas a poder crear tu perfil y empezar a practicar.',
    freeTypingLink: 'Probar el teclado libre',
  },

  freeTyping: {
    title: 'Teclado libre',
    layoutLabel: 'Distribución',
    textLabel: 'Texto',
    modeLabel: 'Vista',
    modes: { adult: 'Adulto', kids: 'Infantil' },
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
