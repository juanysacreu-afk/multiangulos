import { GeometropolisMonument } from '../types.ts';

export const GEOMETROPOLIS_MONUMENTS: GeometropolisMonument[] = [
  // --- DISTRITO CIUDAD (GEOMETRÓPOLIS) ---
  {
    id: 'torre-cuadrada',
    name: 'Rascacielos Cuadrado',
    district: 'ciudad',
    category: 'figuras',
    tag: 'Cuadrilátero · 4 lados iguales y 4 esquinas de 90°',
    icon: '🏢',
    starCost: 0, // Edificio inicial de bienvenida
    description:
      '¡El edificio más alto de Geometrópolis! Su base y todas sus ventanas son cuadrados perfectos con cuatro lados exactamente iguales y cuatro esquinas rectas de 90 grados.',
    funFact:
      'Si giras un cuadrado 90 grados, ¡se queda exactamente en la misma postura sin cambiar!',
    targetPos: [-8, 5, -6],
    cameraPos: [-8, 9, 2],
  },
  {
    id: 'edificio-rectangulo',
    name: 'Gran Palacio Rectangular',
    district: 'ciudad',
    category: 'figuras',
    tag: 'Cuadrilátero · Lados iguales dos a dos y 4 ángulos rectos',
    icon: '🏛️',
    starCost: 2,
    description:
      'Un palacio impresionante con 4 lados y 4 ángulos rectos de 90°. Sus lados opuestos son paralelos y miden exactamente lo mismo dos a dos: dos largos y dos cortos.',
    funFact:
      'Una pantalla de ordenador, una libreta de clase y una puerta son rectángulos.',
    targetPos: [-12, 3.5, 3],
    cameraPos: [-12, 8, 11],
  },
  {
    id: 'pabellon-rombo',
    name: 'Pabellón del Rombo Brillante',
    district: 'ciudad',
    category: 'figuras',
    tag: 'Cuadrilátero · 4 lados iguales con ángulos inclinados',
    icon: '💎',
    starCost: 3,
    description:
      'Una joya arquitectónica con forma de diamante. Tiene 4 lados iguales, pero sus esquinas no son de 90°: tiene dos ángulos agudos (cerrados) y dos ángulos obtusos (abiertos).',
    funFact:
      'Una cometa de viento y la señal de peligro de la carretera tienen forma de rombo.',
    targetPos: [-4, 3, 7],
    cameraPos: [-4, 7, 14],
  },
  {
    id: 'centro-paralelogramo',
    name: 'Auditorio Paralelogramo',
    district: 'ciudad',
    category: 'figuras',
    tag: 'Cuadrilátero · Lados opuestos paralelos e inclinados',
    icon: '📐',
    starCost: 5,
    description:
      'Un auditorio futurista con paredes inclinadas. Sus lados opuestos son paralelos (nunca se cruzan) y tienen la misma longitud.',
    funFact:
      'Si empujas con el dedo una caja rectangular hacia un lado, ¡se inclina formando un paralelogramo!',
    targetPos: [-9, 3, 11],
    cameraPos: [-9, 7, 18],
  },
  {
    id: 'viaducto-paralelas',
    name: 'Viaducto de Vías Paralelas',
    district: 'ciudad',
    category: 'lineas',
    tag: 'Líneas Paralelas · Siempre a la misma distancia, nunca chocan',
    icon: '🚊',
    starCost: 4,
    description:
      'El tren magnético de Geometrópolis recorre la ciudad sobre dos vías paralelas que viajan juntas sin tocarse jamás por mucho que se prolonguen.',
    funFact:
      'Los rieles del tren, los bordes de una regla y los renglones de tu cuaderno son líneas paralelas.',
    targetPos: [-2, 3, -9],
    cameraPos: [-2, 8, -2],
  },
  {
    id: 'cruce-perpendicular',
    name: 'Gran Cruce Perpendicular',
    district: 'ciudad',
    category: 'lineas',
    tag: 'Líneas Perpendiculares · Cuatro esquinas de 90° en cruz',
    icon: '🚦',
    starCost: 2,
    description:
      'La Gran Vía Norte y el Paseo de los Polígonos se cruzan formando una cruz perfecta con 4 ángulos rectos de 90 grados y pasos de cebra geométricos.',
    funFact:
      'El marco de una ventana y la cruz de una farmacia están formados por líneas perpendiculares.',
    targetPos: [-6, 1, 0],
    cameraPos: [-6, 6, 7],
  },
  {
    id: 'faro-90',
    name: 'Faro Guardián de 90°',
    district: 'ciudad',
    category: 'angulos',
    tag: 'Ángulo Recto · Luz en cruz de 90 grados',
    icon: '🗼',
    starCost: 5,
    description:
      'Una torre con dos haces de luz perpendicular que giran protegiendo la isla. Muestra en su base la marca dorada de 90° con su cuadradito especial.',
    funFact:
      'Los ángulos de 90° no se marcan con una curva, ¡se marcan con un cuadradito en el vértice!',
    targetPos: [0, 6, -11],
    cameraPos: [0, 10, -3],
  },

  // --- DISTRITO PARQUE (ÁNGULOPARK) ---
  {
    id: 'noria-angulos',
    name: 'La Gran Noria de los Ángulos',
    district: 'parque',
    category: 'angulos',
    tag: 'Ángulos en Rotación · Agudo, Recto y Obtuso en movimiento',
    icon: '🎡',
    starCost: 7,
    description:
      '¡La atracción reina de ÁnguloPark! Al girar sus góndolas de colores, el ángulo central va cambiando continuamente: de agudo (<90°) a recto (90°) y a obtuso (>90°).',
    funFact:
      'Cuando un reloj marca las 3:00 en punto o las 9:00 en punto, ¡sus agujas forman un ángulo recto!',
    targetPos: [9, 6, -5],
    cameraPos: [9, 10, 3],
  },
  {
    id: 'montana-aguda',
    name: 'Montaña Rusa de Picos Agudos',
    district: 'parque',
    category: 'angulos',
    tag: 'Ángulo Agudo · Picos cerraditos menores de 90°',
    icon: '🎢',
    starCost: 6,
    description:
      'Un circuito con subidas afiladas y picos con ángulos agudos (menores de 90°). ¡El carrito sube empinado y baja a toda velocidad!',
    funFact:
      'Un ángulo agudo es estrecho y puntiagudo, como el pico de un pajarito o una rebanada de tarta.',
    targetPos: [9, 4, 7],
    cameraPos: [9, 8, 15],
  },
  {
    id: 'tobogan-obtuso',
    name: 'Súper Tobogán Obtuso',
    district: 'parque',
    category: 'angulos',
    tag: 'Ángulo Obtuso · Rampa abierta mayor de 90°',
    icon: '🛝',
    starCost: 4,
    description:
      'Un tobogán gigante con una apertura muy suave y abierta, mayor que un ángulo recto (>90°). ¡Ideal para deslizarse sin miedo!',
    funFact:
      'Un abanico abierto en verano y el respaldo de una tumbona de playa forman ángulos obtusos.',
    targetPos: [14, 4, 2],
    cameraPos: [14, 8, 10],
  },
  {
    id: 'arco-triunfo-90',
    name: 'Arco Monumental ÁnguloPark',
    district: 'parque',
    category: 'angulos',
    tag: 'Ángulo Recto · Puerta de Entrada con Escuadra de 90°',
    icon: '🎪',
    starCost: 3,
    description:
      'La bienvenida a ÁnguloPark. Dos grandes columnas y una viga superior forman esquinas rectas de 90° con luces parpadeantes de feria.',
    funFact:
      'Los albañiles y arquitectos usan una herramienta llamada escuadra para asegurar esquinas de 90°.',
    targetPos: [5, 2.5, 0],
    cameraPos: [5, 6, 7],
  },
];
