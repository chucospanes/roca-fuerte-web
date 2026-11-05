/**
 * Fondo de "Hermano cercano": mapamundi simplificado (contornos aproximados, a mano) en trazo
 * fino y muy tenue, con líneas punteadas curvas desde las ciudades con más salvadoreños hasta El
 * Salvador. Decorativo (aria-hidden), SVG en línea, sin imágenes ni dependencias.
 *
 * Proyección equirectangular centrada en las Américas (meridiano central −75°). El mundo se dibuja
 * dos veces, desplazado una vuelta, para que Australia y el este de Asia queden a la izquierda,
 * del lado del Pacífico: la línea de Australia cruza el Pacífico, como en la realidad.
 */

type Punto = [lon: number, lat: number];

const CENTRO = -75;
const LON_MIN = -178; // relativo al centro: borde izquierdo (Australia)
const LON_MAX = 100; // borde derecho (Italia)
const LAT_MAX = 72;
const LAT_MIN = -45;
const ESCALA = 4;
export const MAPA_ANCHO = (LON_MAX - LON_MIN) * ESCALA;
export const MAPA_ALTO = (LAT_MAX - LAT_MIN) * ESCALA;

const x = (lonRel: number) => (lonRel - LON_MIN) * ESCALA;
const y = (lat: number) => (LAT_MAX - lat) * ESCALA;
/** Longitud relativa al centro, sin cortar el polígono (puede pasar de 180). */
const sinCorte = (lon: number) => lon - CENTRO;
/** Longitud relativa al centro, en (−180, 180]: para puntos sueltos (ciudades). */
const rel = (lon: number) => ((((lon - CENTRO + 180) % 360) + 360) % 360) - 180;

// Contornos aproximados [longitud, latitud]: solo para dar la idea del mapa, muy tenue.
const CONTINENTES: Punto[][] = [
  // América del Norte y Central
  [[-168, 66], [-162, 70], [-140, 70], [-120, 72], [-95, 72], [-80, 73], [-65, 62], [-60, 55], [-53, 47], [-66, 44], [-70, 41], [-76, 35], [-81, 31], [-80, 25], [-82, 28], [-84, 30], [-90, 29], [-97, 26], [-97, 22], [-92, 19], [-88, 21], [-87, 16], [-84, 15], [-83, 10], [-79, 9], [-80, 8], [-86, 11], [-91, 14], [-96, 16], [-105, 20], [-110, 24], [-112, 30], [-117, 32], [-120, 34], [-124, 40], [-124, 46], [-130, 54], [-140, 60], [-152, 58], [-165, 60]],
  // Groenlandia
  [[-55, 60], [-45, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 77], [-55, 70]],
  // América del Sur
  [[-79, 9], [-75, 11], [-62, 11], [-50, 0], [-35, -6], [-39, -15], [-48, -26], [-58, -38], [-65, -42], [-68, -52], [-74, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -13], [-81, -5], [-80, 0], [-77, 7]],
  // Europa y Asia
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [0, 50], [5, 53], [8, 57], [5, 62], [15, 69], [28, 71], [40, 67], [60, 69], [80, 73], [100, 77], [120, 73], [140, 72], [160, 70], [180, 68], [178, 62], [160, 60], [155, 51], [140, 48], [142, 53], [135, 43], [129, 35], [127, 39], [122, 40], [122, 31], [118, 24], [110, 20], [108, 12], [104, 9], [100, 13], [100, 4], [103, 1], [98, 8], [93, 16], [90, 22], [87, 21], [80, 15], [77, 8], [72, 20], [67, 24], [57, 25], [56, 27], [48, 30], [52, 24], [56, 22], [52, 16], [44, 12], [42, 16], [35, 28], [33, 31], [35, 36], [27, 37], [26, 40], [23, 36], [20, 40], [16, 38], [12, 44], [13, 45], [8, 44], [3, 43], [-1, 37]],
  // Gran Bretaña
  [[-5, 50], [1, 51], [2, 53], [-1, 55], [-3, 58], [-6, 57], [-5, 54], [-3, 53]],
  // Japón
  [[130, 31], [136, 34], [140, 36], [142, 40], [141, 45], [140, 41], [136, 36], [131, 34]],
  // África
  [[-17, 21], [-16, 12], [-8, 4], [5, 5], [9, 4], [10, -2], [12, -6], [13, -12], [12, -17], [15, -27], [18, -34], [25, -34], [33, -27], [35, -22], [40, -15], [40, -10], [39, -4], [43, 0], [51, 11], [44, 11], [38, 18], [33, 28], [25, 32], [20, 31], [10, 34], [10, 37], [-1, 36], [-6, 36], [-10, 30], [-13, 27]],
  // Madagascar
  [[44, -25], [47, -25], [50, -15], [49, -12]],
  // Australia
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [134, -32], [129, -31], [115, -34], [113, -26]],
  // Nueva Zelanda
  [[172, -34], [178, -38], [174, -41], [167, -46], [171, -42]],
];

/** Ciudades de origen (las de más salvadoreños) y El Salvador, [longitud, latitud]. */
const ORIGENES: Punto[] = [
  [-118.2, 34.1], // Los Ángeles
  [-95.4, 29.8], // Houston
  [-77.0, 38.9], // Washington
  [-74.0, 40.7], // Nueva York
  [-79.4, 43.7], // Toronto (Canadá)
  [-3.7, 40.4], // Madrid (España)
  [12.5, 41.9], // Roma (Italia)
  [144.9, -37.8], // Melbourne (Australia)
];
const EL_SALVADOR: Punto = [-89.2, 13.7];

const rutaContinente = (puntos: Punto[], desplazamiento: number) =>
  `M${puntos.map(([lon, lat]) => `${x(sinCorte(lon) + desplazamiento).toFixed(1)} ${y(lat).toFixed(1)}`).join("L")}Z`;

/** Curva del origen a El Salvador: arco hacia el norte, más alto cuanto más lejos. */
function rutaLinea([lon, lat]: Punto): string {
  const x1 = x(rel(lon));
  const y1 = y(lat);
  const x2 = x(rel(EL_SALVADOR[0]));
  const y2 = y(EL_SALVADOR[1]);
  const distancia = Math.hypot(x2 - x1, y2 - y1);
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - distancia * 0.25;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/** Posición horizontal de El Salvador en el mapa (0 a 1), para centrarlo en el celular. */
export const POSICION_EL_SALVADOR = x(rel(EL_SALVADOR[0])) / MAPA_ANCHO;

export function MapaHermanos({ className }: { className?: string }) {
  const continentes = CONTINENTES.flatMap((c) => [rutaContinente(c, 0), rutaContinente(c, -360)]).join("");
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${MAPA_ANCHO} ${MAPA_ALTO}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <path d={continentes} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" className="text-piedra-500 opacity-35" />
      <g fill="none" strokeWidth="2" strokeLinecap="round" className="lineas-hermanos text-piedra-600">
        {ORIGENES.map((o) => (
          <path key={o.join()} d={rutaLinea(o)} stroke="currentColor" strokeDasharray="2 7" opacity="0.7" />
        ))}
      </g>
      <g className="fill-piedra-600 opacity-75">
        {ORIGENES.map(([lon, lat]) => (
          <circle key={`${lon},${lat}`} cx={x(rel(lon))} cy={y(lat)} r="4" />
        ))}
      </g>
      <circle cx={x(rel(EL_SALVADOR[0]))} cy={y(EL_SALVADOR[1])} r="16" className="fill-terracota opacity-20" />
      <circle cx={x(rel(EL_SALVADOR[0]))} cy={y(EL_SALVADOR[1])} r="7" className="fill-terracota" />
    </svg>
  );
}
