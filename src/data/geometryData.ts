import { GeometryQuestion, LineType, QuadrilateralType, AngleType } from '../types.ts';

export interface WorldDefinition {
  id: 'lineas' | 'figuras' | 'angulos';
  title: string;
  tagline: string;
  shortDescription: string;
  badgeId: string;
  accentGradient: string;
  colorBorder: string;
  iconName: string;
}

export const WORLDS_METADATA: WorldDefinition[] = [
  {
    id: 'lineas',
    title: 'El Mundo de las Líneas',
    tagline: 'Paralelas, perpendiculares y secantes',
    shortDescription: 'Descubre cómo viajan las líneas rectas en el espacio y cuándo se cruzan.',
    badgeId: 'maestro-lineas',
    accentGradient: 'from-sky-500 via-indigo-500 to-blue-600',
    colorBorder: 'border-sky-400',
    iconName: 'align-justify',
  },
  {
    id: 'figuras',
    title: 'El Taller de las Figuras',
    tagline: 'Cuadrados, rectángulos, paralelogramos y rombos',
    shortDescription: 'Cuenta lados, encuentra vértices y descubre las diferencias de los cuadriláteros.',
    badgeId: 'maestro-figuras',
    accentGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    colorBorder: 'border-emerald-400',
    iconName: 'shapes',
  },
  {
    id: 'angulos',
    title: 'La Aventura de los Ángulos',
    tagline: 'Agudos, rectos de 90° y obtusos',
    shortDescription: 'Usa la escuadra mágica para medir esquinas y aberturas en objetos cotidianos.',
    badgeId: 'maestro-angulos',
    accentGradient: 'from-amber-500 via-orange-500 to-rose-500',
    colorBorder: 'border-amber-400',
    iconName: 'triangle',
  },
];

// Explanations for 3rd grade
export const THEORY_CONTENT = {
  lineas: {
    title: '¿Cómo pueden ser dos líneas rectas?',
    intro: 'Imagina dos líneas que viajan por el papel. Pueden comportarse de tres formas distintas:',
    items: [
      {
        type: 'paralelas' as LineType,
        name: 'Líneas Paralelas',
        shortRule: '¡Nunca, jamás se cruzan!',
        description:
          'Mantienen siempre la misma distancia entre ellas. Por mucho que las alargues hacia la derecha o hacia la izquierda, ¡nunca chocarán!',
        dailyExamples: 'Las vías del tren, los bordes opuestos de una regla o los peldaños de una escalera.',
        colorBg: 'bg-sky-500/15',
        colorText: 'text-sky-400',
        borderColor: 'border-sky-500/40',
      },
      {
        type: 'perpendiculares' as LineType,
        name: 'Líneas Perpendiculares',
        shortRule: 'Se cortan formando 4 ángulos rectos (90°)',
        description:
          'Se cruzan formando una cruz perfecta. Crean cuatro esquinas exactas de 90 grados, como la esquina de un libro o de una ventana.',
        dailyExamples: 'El marco de una ventana, el signo más (+), una cruz de cruce de peatones o una esquina de la pizarra.',
        colorBg: 'bg-indigo-500/15',
        colorText: 'text-indigo-400',
        borderColor: 'border-indigo-500/40',
      },
      {
        type: 'secantes' as LineType,
        name: 'Líneas Secantes',
        shortRule: 'Se cortan en un punto, pero NO forman ángulos rectos',
        description:
          'Se cruzan en un único punto, pero de forma inclinada. Forman dos ángulos agudos (estrechos) y dos ángulos obtusos (anchos), nunca esquinas rectas.',
        dailyExamples: 'Unas tijeras abiertas, la letra X o las aspas giratorias de un molino de viento.',
        colorBg: 'bg-amber-500/15',
        colorText: 'text-amber-400',
        borderColor: 'border-amber-500/40',
      },
    ],
  },
  figuras: {
    title: '¿Qué es un Cuadrilátero?',
    intro:
      'Un polígono es una figura plana cerrada formada por líneas rectas. ¡Los cuadriláteros son polígonos que tienen exactamente 4 lados, 4 vértices y 4 ángulos!',
    elementsHelp: [
      {
        term: 'Lado',
        meaning: 'Cada una de las 4 líneas rectas que forman el contorno de la figura.',
      },
      {
        term: 'Vértice',
        meaning: 'Cada esquina o punto donde se encuentran dos lados (tiene 4 vértices).',
      },
      {
        term: 'Ángulo',
        meaning: 'La abertura que hay dentro de cada esquina (tiene 4 ángulos).',
      },
    ],
    items: [
      {
        type: 'cuadrado' as QuadrilateralType,
        name: 'Cuadrado',
        sidesRule: '4 lados IGUALES (miden lo mismo)',
        anglesRule: '4 ángulos RECTOS (90°)',
        difference: 'Es el cuadrilátero más regular y perfecto: todos sus lados y todos sus ángulos son idénticos.',
        dailyExamples: 'Un dado, una baldosa cuadrada, una ventana de cristal simétrica.',
        colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      },
      {
        type: 'rectangulo' as QuadrilateralType,
        name: 'Rectángulo',
        sidesRule: 'Lados iguales dos a dos (2 largos y 2 cortos)',
        anglesRule: '4 ángulos RECTOS (90°)',
        difference: 'Tiene esquinas rectas como el cuadrado, pero sus lados no son todos iguales: dos son más largos y dos son más cortos.',
        dailyExamples: 'Una puerta, la pantalla de una tablet, un folio de papel, una cancha de baloncesto.',
        colorBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      },
      {
        type: 'paralelogramo' as QuadrilateralType,
        name: 'Paralelogramo',
        sidesRule: 'Lados opuestos paralelos e iguales dos a dos',
        anglesRule: 'NO tiene ángulos rectos (2 agudos y 2 obtusos)',
        difference: 'Parece un rectángulo que se ha inclinado hacia un lado. Sus lados opuestos son paralelos, pero sus esquinas no son rectas.',
        dailyExamples: 'La goma de borrar inclinada, una rampa de patinaje, el lateral de una escalera mecánica.',
        colorBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      },
      {
        type: 'rombo' as QuadrilateralType,
        name: 'Rombo',
        sidesRule: '4 lados IGUALES (todos miden lo mismo)',
        anglesRule: 'NO tiene ángulos rectos (2 agudos y 2 obtusos)',
        difference: 'Tiene los 4 lados iguales como el cuadrado, pero está inclinado como un diamante. ¡Sus esquinas no son de 90°!',
        dailyExamples: 'Una cometa en el cielo, las señales de advertencia con forma de diamante, los rombos de una baraja de cartas.',
        colorBadge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      },
    ],
  },
  angulos: {
    title: '¿Qué es un Ángulo y cómo se mide?',
    intro:
      'Un ángulo es la abertura que hay entre dos líneas que se unen en un mismo punto llamado vértice. Para 3.º de Primaria, la clave es compararlo siempre con la esquina de un libro (el ángulo recto):',
    items: [
      {
        type: 'agudo' as AngleType,
        name: 'Ángulo Agudo',
        formula: 'Menor que un ángulo recto (< 90°)',
        look: 'Pequeñito, afilado y cerrado',
        description:
          'Su abertura es más estrecha que la esquina de un libro. Si pusieras la esquina de una hoja, no cabría porque el ángulo es demasiado cerrado.',
        dailyExamples: 'La punta de un lápiz afilado, una porción de pizza cortada en 8 trozos, el pico abierto de un pajarito o las manecillas a las 2:00.',
        colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      },
      {
        type: 'recto' as AngleType,
        name: 'Ángulo Recto',
        formula: 'Exactamente 90° (Marca de cuadradito)',
        look: 'Forma una L o esquina perfecta',
        description:
          'Es el ángulo rey de la geometría. Forma una esquina recta perfecta como la de un folio, una mesa o una puerta. En los dibujos siempre lo reconocemos por su marca cuadrada en la esquina.',
        dailyExamples: 'La esquina de tu cuaderno, las manecillas del reloj a las 3:00 en punto, el poste de una portería o el marco de un cuadro.',
        colorBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      },
      {
        type: 'obtuso' as AngleType,
        name: 'Ángulo Obtuso',
        formula: 'Mayor que un ángulo recto (> 90°)',
        look: 'Abierto, amplio y espacioso',
        description:
          'Su abertura es más ancha que la esquina de un libro. Si apoyas una hoja recta en el vértice, verás que la otra línea se abre mucho más hacia afuera.',
        dailyExamples: 'Un abanico abierto en verano, el respaldo inclinado de un sillón, un paraguas abierto o las manecillas del reloj a las 5:00.',
        colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      },
    ],
  },
};

// Everyday Real World Examples for Visual Discovery
export const REAL_OBJECTS_DATA = [
  {
    id: 'vias-tren',
    world: 'lineas',
    title: 'Vías del tren en el campo',
    description: 'Los dos raíles metálicos por donde ruedan los trenes.',
    correctAnswer: 'paralelas',
    options: ['paralelas', 'perpendiculares', 'secantes'],
    explanation: '¡Exacto! Los dos raíles nunca se cruzan para que el tren no descarrile. ¡Son paralelas!',
    svgKind: 'train_tracks',
  },
  {
    id: 'ventana-cruz',
    world: 'lineas',
    title: 'Marcos interiores de una ventana',
    description: 'Los perfiles de madera que dividen los cuatro cristales.',
    correctAnswer: 'perpendiculares',
    options: ['paralelas', 'perpendiculares', 'secantes'],
    explanation: '¡Muy bien! Se cruzan formando una cruz con 4 esquinas de 90°. ¡Son perpendiculares!',
    svgKind: 'window_cross',
  },
  {
    id: 'tijeras-escolares',
    world: 'lineas',
    title: 'Tijeras abiertas sobre la mesa',
    description: 'Las dos hojas de corte unidas por el tornillo central.',
    correctAnswer: 'secantes',
    options: ['paralelas', 'perpendiculares', 'secantes'],
    explanation: '¡Excelente! Se cruzan en el tornillo pero no forman ángulos rectos de 90°. ¡Son líneas secantes!',
    svgKind: 'scissors',
  },
  {
    id: 'reloj-tres',
    world: 'angulos',
    title: 'Reloj marcando las 3:00 en punto',
    description: 'La manecilla pequeña marca el 3 y la grande marca el 12.',
    correctAnswer: 'recto',
    options: ['agudo', 'recto', 'obtuso'],
    explanation: '¡Genial! Forman una esquina recta perfecta como la de un libro (90°). ¡Es un ángulo recto!',
    svgKind: 'clock_300',
  },
  {
    id: 'reloj-dos',
    world: 'angulos',
    title: 'Reloj marcando las 2:00',
    description: 'La manecilla pequeña marca el 2 y la grande marca el 12.',
    correctAnswer: 'agudo',
    options: ['agudo', 'recto', 'obtuso'],
    explanation: '¡Correcto! La abertura es más estrecha y cerrada que la esquina de un libro (< 90°). ¡Es agudo!',
    svgKind: 'clock_200',
  },
  {
    id: 'reloj-cinco',
    world: 'angulos',
    title: 'Reloj marcando las 5:00',
    description: 'La manecilla pequeña marca el 5 y la grande marca el 12.',
    correctAnswer: 'obtuso',
    options: ['agudo', 'recto', 'obtuso'],
    explanation: '¡Fantástico! La abertura es mayor y más abierta que una esquina recta (> 90°). ¡Es un ángulo obtuso!',
    svgKind: 'clock_500',
  },
  {
    id: 'cometa-cielo',
    world: 'figuras',
    title: 'Cometa con cola de lazos',
    description: 'Tiene 4 lados de igual tamaño pero dos esquinas afiladas y dos anchas.',
    correctAnswer: 'rombo',
    options: ['cuadrado', 'rectangulo', 'paralelogramo', 'rombo'],
    explanation: '¡Sí! Tiene sus 4 lados iguales, pero sus ángulos no son rectos. ¡Es un rombo!',
    svgKind: 'kite',
  },
  {
    id: 'sobre-carta',
    world: 'figuras',
    title: 'Sobre cerrado para enviar una carta',
    description: 'Tiene 2 lados largos, 2 lados cortos y 4 esquinas de 90°.',
    correctAnswer: 'rectangulo',
    options: ['cuadrado', 'rectangulo', 'paralelogramo', 'rombo'],
    explanation: '¡Perfecto! Sus lados son iguales dos a dos y tiene 4 ángulos rectos. ¡Es un rectángulo!',
    svgKind: 'envelope',
  },
];

// Interactive Quiz Questions for Gradual Learning (Sencillo, Intermedio, Repaso)
export const MODULE_QUESTIONS: Record<'lineas' | 'figuras' | 'angulos', GeometryQuestion[]> = {
  lineas: [
    {
      id: 'lin_q1',
      category: 'lineas',
      level: 'sencillo',
      prompt: '¿Cómo se llaman las líneas rectas que nunca, jamás se cruzan por mucho que las alargues?',
      audioHint: 'Piensa en las vías por las que viaja un tren sin chocar.',
      options: [
        {
          id: 'opt1',
          label: 'Líneas Paralelas',
          isCorrect: true,
          explanation: '¡Exacto! Las líneas paralelas siempre conservan la misma distancia y nunca se tocan.',
        },
        {
          id: 'opt2',
          label: 'Líneas Secantes',
          isCorrect: false,
          explanation: '¡Casi! Las secantes sí se cortan en un punto. Las que nunca se cruzan son las paralelas.',
        },
        {
          id: 'opt3',
          label: 'Líneas Perpendiculares',
          isCorrect: false,
          explanation: '¡Cuidado! Las perpendiculares se cruzan formando una cruz con 4 ángulos de 90°.',
        },
      ],
    },
    {
      id: 'lin_q2',
      category: 'lineas',
      level: 'sencillo',
      prompt: 'Cuando dos líneas se cruzan formando cuatro esquinas rectas de 90°, ¿cómo se llaman?',
      audioHint: 'Forman una cruz perfecta como el marco de una ventana.',
      options: [
        {
          id: 'opt1',
          label: 'Líneas Paralelas',
          isCorrect: false,
          explanation: 'Las paralelas nunca se tocan. ¡Estas dos se cortan formando ángulos rectos!',
        },
        {
          id: 'opt2',
          label: 'Líneas Perpendiculares',
          isCorrect: true,
          explanation: '¡Genial! Las líneas perpendiculares forman exactamente 4 ángulos rectos (90°).',
        },
        {
          id: 'opt3',
          label: 'Líneas Curvas',
          isCorrect: false,
          explanation: '¡Recuerda que estamos estudiando líneas rectas!',
        },
      ],
    },
    {
      id: 'lin_q3',
      category: 'lineas',
      level: 'intermedio',
      prompt: 'Dos líneas se cruzan en un solo punto, pero NO forman ángulos rectos. ¿Qué tipo de líneas son?',
      audioHint: 'Se cruzan de forma inclinada, como las dos hojas de unas tijeras abiertas.',
      options: [
        {
          id: 'opt1',
          label: 'Líneas Secantes',
          isCorrect: true,
          explanation: '¡Fantástico! Las líneas secantes se cruzan en un punto sin formar esquinas de 90°.',
        },
        {
          id: 'opt2',
          label: 'Líneas Paralelas',
          isCorrect: false,
          explanation: 'Las paralelas no se cruzan nunca. Como estas sí se cortan en un punto, son secantes.',
        },
        {
          id: 'opt3',
          label: 'Líneas Gemelas',
          isCorrect: false,
          explanation: 'Ese nombre no existe en geometría. ¡Se llaman secantes!',
        },
      ],
    },
    {
      id: 'lin_q4',
      category: 'lineas',
      level: 'intermedio',
      prompt: 'Mira el borde superior y el borde inferior de una regla de clase. ¿Qué relación tienen esas dos líneas?',
      audioHint: 'Van las dos en horizontal a la misma distancia y nunca se juntan.',
      options: [
        {
          id: 'opt1',
          label: 'Son Perpendiculares',
          isCorrect: false,
          explanation: 'No forman una cruz. Como van en la misma dirección sin tocarse, son paralelas.',
        },
        {
          id: 'opt2',
          label: 'Son Paralelas',
          isCorrect: true,
          explanation: '¡Muy bien! Los dos bordes largos de la regla van siempre a la misma distancia: ¡son paralelas!',
        },
        {
          id: 'opt3',
          label: 'Son Secantes',
          isCorrect: false,
          explanation: 'Los bordes de la regla no se cruzan. Son paralelas.',
        },
      ],
    },
    {
      id: 'lin_q5',
      category: 'lineas',
      level: 'repaso',
      prompt: '¿Cuántos ángulos rectos (de 90°) se forman cuando se cortan dos líneas perpendiculares?',
      audioHint: 'Cuenta las cuatro esquinas que rodean el punto de cruce.',
      options: [
        {
          id: 'opt1',
          label: 'Solo 1 ángulo recto',
          isCorrect: false,
          explanation: 'Se forman ángulos a los cuatro lados del cruce: arriba a la derecha, izquierda, etc.',
        },
        {
          id: 'opt2',
          label: 'Exactamente 4 ángulos rectos',
          isCorrect: true,
          explanation: '¡Excelente! Se forman 4 esquinas rectas de 90° alrededor del punto de cruce.',
        },
        {
          id: 'opt3',
          label: 'Ningún ángulo recto',
          isCorrect: false,
          explanation: 'Las perpendiculares siempre forman esquinas rectas de 90°.',
        },
      ],
    },
  ],
  figuras: [
    {
      id: 'fig_q1',
      category: 'figuras',
      level: 'sencillo',
      prompt: '¿Cuántos lados y cuántos vértices tiene cualquier cuadrilátero?',
      audioHint: 'Fíjate en el prefijo "cuadri-", que viene de cuatro.',
      options: [
        {
          id: 'opt1',
          label: '3 lados y 3 vértices',
          isCorrect: false,
          explanation: 'Ese es un triángulo. ¡Los cuadriláteros tienen cuatro!',
        },
        {
          id: 'opt2',
          label: '4 lados y 4 vértices',
          isCorrect: true,
          explanation: '¡Perfecto! Todo cuadrilátero tiene exactamente 4 lados y 4 esquinas (vértices).',
        },
        {
          id: 'opt3',
          label: '5 lados y 5 vértices',
          isCorrect: false,
          explanation: 'Ese sería un pentágono. Los cuadriláteros tienen cuatro.',
        },
      ],
    },
    {
      id: 'fig_q2',
      category: 'figuras',
      level: 'sencillo',
      prompt: 'Tengo 4 lados de la misma longitud y mis 4 ángulos son rectos de 90°. ¿Quién soy?',
      audioHint: 'Soy la figura perfecta, como la cara de un dado.',
      options: [
        {
          id: 'opt1',
          label: 'Un Cuadrado',
          isCorrect: true,
          explanation: '¡Muy bien! El cuadrado tiene sus 4 lados iguales y sus 4 ángulos rectos.',
        },
        {
          id: 'opt2',
          label: 'Un Rectángulo',
          isCorrect: false,
          explanation: 'El rectángulo tiene 4 ángulos rectos, pero sus lados no son todos iguales (tiene 2 largos y 2 cortos).',
        },
        {
          id: 'opt3',
          label: 'Un Rombo',
          isCorrect: false,
          explanation: 'El rombo tiene 4 lados iguales, pero sus ángulos no son rectos.',
        },
      ],
    },
    {
      id: 'fig_q3',
      category: 'figuras',
      level: 'intermedio',
      prompt: '¿En qué se diferencian un CUADRADO y un ROMBO si los dos tienen sus 4 lados iguales?',
      audioHint: 'Fíjate en las esquinas: ¿son esquinas rectas de 90° o están inclinadas?',
      options: [
        {
          id: 'opt1',
          label: 'El cuadrado tiene 4 ángulos rectos y el rombo NO',
          isCorrect: true,
          explanation: '¡Brillante! El cuadrado tiene 4 esquinas de 90°, mientras que el rombo tiene 2 agudas y 2 obtusas.',
        },
        {
          id: 'opt2',
          label: 'El rombo tiene 5 lados',
          isCorrect: false,
          explanation: 'El rombo es un cuadrilátero y tiene exactamente 4 lados.',
        },
        {
          id: 'opt3',
          label: 'No tienen ninguna diferencia',
          isCorrect: false,
          explanation: '¡Sí que se diferencian! El cuadrado tiene esquinas rectas y el rombo no.',
        },
      ],
    },
    {
      id: 'fig_q4',
      category: 'figuras',
      level: 'intermedio',
      prompt: '¿Qué figura tiene lados iguales dos a dos (2 largos y 2 cortos) y 4 esquinas rectas de 90°?',
      audioHint: 'Piensa en la forma de una puerta o de la pantalla de una tablet.',
      options: [
        {
          id: 'opt1',
          label: 'El Rectángulo',
          isCorrect: true,
          explanation: '¡Así se hace! El rectángulo tiene 2 lados largos, 2 lados cortos y 4 ángulos rectos.',
        },
        {
          id: 'opt2',
          label: 'El Rombo',
          isCorrect: false,
          explanation: 'El rombo tiene los 4 lados de la misma medida y sus ángulos no son rectos.',
        },
        {
          id: 'opt3',
          label: 'El Triángulo',
          isCorrect: false,
          explanation: 'El triángulo solo tiene 3 lados.',
        },
      ],
    },
    {
      id: 'fig_q5',
      category: 'figuras',
      level: 'repaso',
      prompt: '¿Cómo se llama el cuadrilátero cuyos lados opuestos son paralelos e iguales dos a dos, pero sus ángulos están inclinados (ninguno es recto)?',
      audioHint: 'Parece un rectángulo inclinado, como la silueta de una goma de borrar.',
      options: [
        {
          id: 'opt1',
          label: 'Paralelogramo',
          isCorrect: true,
          explanation: '¡Genio total! Es un paralelogramo: sus lados opuestos son paralelos pero sus esquinas no son de 90°.',
        },
        {
          id: 'opt2',
          label: 'Cuadrado',
          isCorrect: false,
          explanation: 'El cuadrado siempre tiene 4 ángulos rectos obligatorios.',
        },
        {
          id: 'opt3',
          label: 'Círculo',
          isCorrect: false,
          explanation: 'El círculo es redondo y no tiene lados rectos.',
        },
      ],
    },
  ],
  angulos: [
    {
      id: 'ang_q1',
      category: 'angulos',
      level: 'sencillo',
      prompt: '¿Qué tipo de ángulo forma una esquina perfecta de 90°, como la de un libro o una hoja?',
      audioHint: 'Siempre lo señalamos en los dibujos con un cuadradito en el vértice.',
      options: [
        {
          id: 'opt1',
          label: 'Ángulo Recto',
          isCorrect: true,
          explanation: '¡Exacto! El ángulo recto mide exactamente 90° y forma una esquina en L perfecta.',
        },
        {
          id: 'opt2',
          label: 'Ángulo Agudo',
          isCorrect: false,
          explanation: 'El agudo es más cerrado y estrecho que una esquina de libro (< 90°).',
        },
        {
          id: 'opt3',
          label: 'Ángulo Obtuso',
          isCorrect: false,
          explanation: 'El obtuso es más abierto y amplio que una esquina de libro (> 90°).',
        },
      ],
    },
    {
      id: 'ang_q2',
      category: 'angulos',
      level: 'sencillo',
      prompt: 'Si un ángulo es más pequeño y cerrado que un ángulo recto, ¿cómo se clasifica?',
      audioHint: 'Es afilado y estrechito, como la punta de un lápiz o un trozo de tarta.',
      options: [
        {
          id: 'opt1',
          label: 'Ángulo Agudo',
          isCorrect: true,
          explanation: '¡Muy bien! Los ángulos menores que 90° se llaman ángulos agudos.',
        },
        {
          id: 'opt2',
          label: 'Ángulo Obtuso',
          isCorrect: false,
          explanation: 'El obtuso es mayor que 90°. El menor que 90° es el agudo.',
        },
        {
          id: 'opt3',
          label: 'Ángulo Plano',
          isCorrect: false,
          explanation: 'Un ángulo plano es una línea recta completa (180°). El menor que 90° es el agudo.',
        },
      ],
    },
    {
      id: 'ang_q3',
      category: 'angulos',
      level: 'intermedio',
      prompt: 'Un abanico está muy abierto para darnos aire. La abertura de sus varillas es mayor que una esquina recta. ¿Qué ángulo forma?',
      audioHint: 'Es más grande y espacioso que 90°.',
      options: [
        {
          id: 'opt1',
          label: 'Ángulo Obtuso',
          isCorrect: true,
          explanation: '¡Genial! Los ángulos que miden más de 90° (más abiertos que un ángulo recto) son obtusos.',
        },
        {
          id: 'opt2',
          label: 'Ángulo Agudo',
          isCorrect: false,
          explanation: 'El agudo es más cerrado que 90°. Como el abanico está muy abierto, es obtuso.',
        },
        {
          id: 'opt3',
          label: 'Ángulo Recto',
          isCorrect: false,
          explanation: 'El ángulo recto forma una esquina de 90° exacta. El abanico abierto es más ancho: obtuso.',
        },
      ],
    },
    {
      id: 'ang_q4',
      category: 'angulos',
      level: 'intermedio',
      prompt: 'En un dibujo geométrico, vemos un pequeño cuadradito dibujado en la esquina de dos líneas. ¿Qué significa esa marca?',
      audioHint: 'Es el símbolo universal para indicar 90 grados.',
      options: [
        {
          id: 'opt1',
          label: 'Que es un ángulo recto de 90°',
          isCorrect: true,
          explanation: '¡Premio! El cuadradito en el vértice indica siempre que el ángulo es recto (exactamente 90°).',
        },
        {
          id: 'opt2',
          label: 'Que las líneas están rotas',
          isCorrect: false,
          explanation: '¡No! Las líneas están perfectas, indica que forman un ángulo recto de 90°.',
        },
        {
          id: 'opt3',
          label: 'Que es un ángulo agudo',
          isCorrect: false,
          explanation: 'Los ángulos agudos se marcan con un arco curvo. El cuadradito es exclusivo del ángulo recto.',
        },
      ],
    },
    {
      id: 'ang_q5',
      category: 'angulos',
      level: 'repaso',
      prompt: 'Las manecillas de un reloj marcan las 3:00 en punto. ¿Qué tipo de ángulo forman?',
      audioHint: 'Una manecilla apunta hacia el 12 (vertical) y la otra hacia el 3 (horizontal).',
      options: [
        {
          id: 'opt1',
          label: 'Ángulo Recto (90°)',
          isCorrect: true,
          explanation: '¡Fantástico! A las 3:00 forman una L perfecta: un ángulo recto de 90°.',
        },
        {
          id: 'opt2',
          label: 'Ángulo Agudo',
          isCorrect: false,
          explanation: 'A las 3:00 la abertura es exactamente de 90°, una esquina recta perfecta.',
        },
        {
          id: 'opt3',
          label: 'Ángulo Obtuso',
          isCorrect: false,
          explanation: 'No está más abierto de 90°, forma una esquina recta perfecta.',
        },
      ],
    },
  ],
};
