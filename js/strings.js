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
    intro: 'Elegí una distribución y un texto, y escribilo. El teclado de abajo te muestra qué tecla viene.',
    layoutLabel: 'Distribución del teclado',
    textLabel: 'Texto de prueba',
    practiceLabel: 'Área de práctica: escribí el texto que se muestra',
    startPrompt: 'Hacé clic en el texto o llegá con Tab para empezar a escribir.',
    restart: 'Reiniciar',
    progress: (position, total, errors) =>
      `Llevás ${position} de ${total} caracteres · Errores: ${errors}`,
    finished: (mistakes) =>
      mistakes === 0
        ? '¡Terminaste sin ningún error! ¡Excelente!'
        : `¡Terminaste! Te equivocaste ${mistakes} ${mistakes === 1 ? 'vez' : 'veces'}.`,
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

  hint: {
    nextKey: (keys) => `Próxima tecla: ${keys}.`,
    deadReady: (deadChar, keys) => `Ya presionaste ${deadChar}. Ahora: ${keys}.`,
    then: ', después ',
    key: (label, finger) => `${label} (${finger})`,
    withModifier: (modifier, key) => `${modifier} + ${key}`,
    space: 'la barra espaciadora',
    enter: 'Entrar',
    shiftLeft: 'Mayús izquierda',
    shiftRight: 'Mayús derecha',
    altGraph: 'Alt Gr',
    notTypable: (char, layoutName) =>
      `El carácter «${char}» no se puede escribir con la distribución ${layoutName}.`,
  },

  layoutCheck: {
    unsupported:
      'Tu navegador no permite averiguar la distribución de tu teclado. Si notamos algo raro mientras escribís, te avisamos.',
    systemMatches: (name) => `Tu compu está configurada con el teclado ${name}.`,
    systemIs: (systemName, selectedName) =>
      `Atención: tu compu está configurada con el teclado ${systemName}, pero acá elegiste ${selectedName}. ` +
      'Las teclas no van a coincidir.',
    systemUnknown: (selectedName) =>
      `Atención: tu compu está configurada con una distribución de teclado que no es ${selectedName}. ` +
      'Algunas teclas no van a coincidir.',
    typingMismatch: (selectedName) =>
      `Parece que tu teclado no está escribiendo como ${selectedName}: algunas teclas producen otros caracteres.`,
    howToFix:
      'Podés elegir otra distribución acá arriba o cambiarla en la configuración de idioma y teclado de tu sistema.',
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
    T: 'pulgar',
  },

  fingerGroups: {
    5: 'Meñique',
    4: 'Anular',
    3: 'Mayor',
    2: 'Índice',
    thumb: 'Pulgar',
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
