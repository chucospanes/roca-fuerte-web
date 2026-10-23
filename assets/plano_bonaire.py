"""Plano arquitectónico 2D a escala - Casa Modelo Bonaire (versión en L).
Coordenadas en metros: x = largo (0 = fachada de dormitorios; la sala se extiende hasta x = -1.50),
y = ancho (0 arriba). Muros exteriores 0.15, interiores 0.10.
"""
import cairosvg

S = 110
OX, OY = 330, 150
W_CANVAS, H_CANVAS = 1420, 1110

EXT = "#262626"
INT = "#6e6e6e"
LINE = "#3a3a3a"
FUR = "#f3efe8"
WOOD = "#e6d6bf"
FONT = "DejaVu Sans"
RED = "#b5462e"

out = []


def X(m):
    return OX + m * S


def Y(m):
    # espejo vertical: dormitorios abajo, sala arriba
    return OY + (5 - m) * S


def rect(x0, y0, x1, y1, fill="none", stroke=LINE, sw=1.2, extra=""):
    out.append(
        f'<rect x="{X(x0):.1f}" y="{min(Y(y0), Y(y1)):.1f}" width="{(x1-x0)*S:.1f}" '
        f'height="{abs(y1-y0)*S:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
    )


def line(x0, y0, x1, y1, stroke=LINE, sw=1.2, extra=""):
    out.append(
        f'<line x1="{X(x0):.1f}" y1="{Y(y0):.1f}" x2="{X(x1):.1f}" y2="{Y(y1):.1f}" '
        f'stroke="{stroke}" stroke-width="{sw}" {extra}/>'
    )


def text(x, y, s, size=12, weight="normal", anchor="middle", fill="#1f1f1f", rot=None, px=False):
    xx, yy = (x, y) if px else (X(x), Y(y))
    tr = f' transform="rotate({rot} {xx:.1f} {yy:.1f})"' if rot is not None else ""
    out.append(
        f'<text x="{xx:.1f}" y="{yy:.1f}" font-family="{FONT}" font-size="{size}" '
        f'font-weight="{weight}" text-anchor="{anchor}" fill="{fill}"{tr}>{s}</text>'
    )


def stacked(x, y, lines, gap=18):
    # líneas apiladas de arriba hacia abajo en pantalla, ancladas en (x, y)
    for i, (t, size, weight, fill) in enumerate(lines):
        text(X(x), Y(y) + i * gap, t, size=size, weight=weight, fill=fill, px=True)


def circle(cx, cy, r_px, fill="none", stroke=LINE, sw=1):
    out.append(f'<circle cx="{X(cx):.1f}" cy="{Y(cy):.1f}" r="{r_px}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')


# ---------------------------------------------------------------- muros
rect(0, 0, 8, 5, fill=EXT, stroke="none")            # cuerpo principal 8.00 x 5.00
rect(-1.50, 2.60, 0, 5, fill=EXT, stroke="none")     # extensión de sala 1.50 x 2.40
rooms = [
    (0.15, 0.15, 3.15, 2.65),    # Dormitorio 1
    (3.25, 0.15, 4.75, 2.65),    # Baño (centrado)
    (4.85, 0.15, 7.85, 2.65),    # Dormitorio 2
    (-1.35, 2.75, 7.85, 4.85),   # Sala-comedor-cocina-lavado (incluye extensión)
]
for r in rooms:
    rect(*r, fill="#ffffff", stroke="none")
rect(0.15, 2.65, 7.85, 2.75, fill=INT, stroke="none")
rect(3.15, 0.15, 3.25, 2.65, fill=INT, stroke="none")
rect(4.75, 0.15, 4.85, 2.65, fill=INT, stroke="none")

# ---------------------------------------------------------------- ventanas
def window_v(x0, x1, y0, y1):
    rect(x0, y0, x1, y1, fill="#e3f1fb", stroke=LINE, sw=1)
    line((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, stroke="#4a90c2", sw=1.4)


def window_h(x0, x1, y0, y1):
    rect(x0, y0, x1, y1, fill="#e3f1fb", stroke=LINE, sw=1)
    line(x0, (y0 + y1) / 2, x1, (y0 + y1) / 2, stroke="#4a90c2", sw=1.4)


window_v(0, 0.15, 0.80, 2.00)          # Dormitorio 1 (fachada)
window_v(7.85, 8, 0.80, 2.00)          # Dormitorio 2
window_h(3.65, 4.35, 0, 0.15)          # Baño (ventana alta)
window_v(-1.50, -1.35, 3.85, 4.65)     # Sala (nueva fachada)
window_h(4.40, 5.60, 4.85, 5)          # Comedor
window_h(6.40, 7.20, 4.85, 5)          # Cocina / pila

# ---------------------------------------------------------------- puertas
def door(gap, hinge, open_tip, closed_tip, sweep, r):
    rect(*gap, fill="#ffffff", stroke="none")
    line(hinge[0], hinge[1], open_tip[0], open_tip[1], stroke="#7a5230", sw=3)
    out.append(
        f'<path d="M {X(closed_tip[0]):.1f} {Y(closed_tip[1]):.1f} '
        f'A {r*S:.1f} {r*S:.1f} 0 0 {1 - sweep} {X(open_tip[0]):.1f} {Y(open_tip[1]):.1f}" '
        f'fill="none" stroke="#8a8a8a" stroke-width="1" stroke-dasharray="4 3"/>'
    )


# Principal 0.90: lado superior de la extensión, abre hacia adentro contra la fachada
door((-1.25, 2.60, -0.35, 2.75), (-1.25, 2.75), (-1.25, 3.65), (-0.35, 2.75), 1, 0.90)
# Dormitorio 1 (0.80)
door((2.30, 2.65, 3.10, 2.75), (3.10, 2.65), (3.10, 1.85), (2.30, 2.65), 1, 0.80)
# Baño (0.70)
door((3.95, 2.65, 4.65, 2.75), (4.65, 2.65), (4.65, 1.95), (3.95, 2.65), 1, 0.70)
# Dormitorio 2 (0.80)
door((4.90, 2.65, 5.70, 2.75), (4.90, 2.65), (4.90, 1.85), (5.70, 2.65), 0, 0.80)

# ---------------------------------------------------------------- mobiliario
def nightstand(x0, y0):
    rect(x0, y0, x0 + 0.45, y0 + 0.40, fill=WOOD)
    circle(x0 + 0.225, y0 + 0.20, 5, sw=0.8)


def bed(x0, y0, w=1.40, l=1.90):
    rect(x0, y0, x0 + w, y0 + l, fill=FUR)
    rect(x0, y0, x0 + w, y0 + 0.08, fill="#d9c7ab")
    rect(x0 + 0.10, y0 + 0.14, x0 + w / 2 - 0.05, y0 + 0.44, fill="#ffffff", sw=0.8)
    rect(x0 + w / 2 + 0.05, y0 + 0.14, x0 + w - 0.10, y0 + 0.44, fill="#ffffff", sw=0.8)
    line(x0, y0 + 0.62, x0 + w, y0 + 0.62, sw=0.8)
    text(x0 + w / 2, y0 + 1.25, "Cama 1.40 × 1.90", size=9, fill="#666")


def wardrobe(x0, y0):
    rect(x0, y0, x0 + 0.55, y0 + 1.00, fill=WOOD)
    text(x0 + 0.24, y0 + 0.50, "Ropero", size=8, fill="#555", rot=-90)
    text(x0 + 0.37, y0 + 0.50, "1.00 × 0.55", size=7, fill="#777", rot=-90)


# Dormitorio 1 (3.00 x 2.50)
nightstand(0.15, 0.15)
bed(0.60, 0.15)
nightstand(2.00, 0.15)
wardrobe(2.60, 0.15)
# Dormitorio 2 (3.00 x 2.50) - espejo del 1
wardrobe(4.85, 0.15)
nightstand(5.55, 0.15)
bed(6.00, 0.15)
nightstand(7.40, 0.15)

# Baño (1.50 x 2.50)
rect(3.25, 0.15, 4.05, 0.95, fill="#eef4f8")
line(3.25, 0.15, 4.05, 0.95, sw=0.7)
line(4.05, 0.15, 3.25, 0.95, sw=0.7)
circle(3.65, 0.55, 4, fill="#fff")
text(3.65, 1.08, "Ducha 0.80×0.80", size=8, fill="#555")
rect(4.55, 1.15, 4.75, 1.55, fill=FUR)
out.append(f'<ellipse cx="{X(4.31):.1f}" cy="{Y(1.35):.1f}" rx="{0.25*S:.1f}" ry="{0.17*S:.1f}" fill="#ffffff" stroke="{LINE}" stroke-width="1.2"/>')
text(4.40, 1.08, "Inodoro", size=8, fill="#555")
rect(3.25, 1.60, 3.65, 2.10, fill=FUR)
out.append(f'<ellipse cx="{X(3.44):.1f}" cy="{Y(1.85):.1f}" rx="{0.13*S:.1f}" ry="{0.18*S:.1f}" fill="#fff" stroke="{LINE}" stroke-width="1"/>')
text(3.45, 2.24, "Lavamanos", size=8, fill="#555")

# Sala (corrida a la izquierda, dentro de la extensión)
rect(-0.30, 2.75, 1.10, 3.15, fill=WOOD)
line(-0.15, 2.80, 0.95, 2.80, stroke="#222", sw=3)
text(0.40, 3.02, "Mueble TV", size=8, fill="#555")
rect(-0.95, 4.00, 1.05, 4.85, fill=FUR)
rect(-0.95, 4.63, 1.05, 4.85, fill="#e2dbcf", sw=0.8)
rect(-0.95, 4.00, -0.78, 4.63, fill="#e2dbcf", sw=0.8)
rect(0.88, 4.00, 1.05, 4.63, fill="#e2dbcf", sw=0.8)
for i in range(1, 3):
    xx = -0.78 + i * (1.66 / 3)
    line(xx, 4.00, xx, 4.63, sw=0.7)
text(0.05, 3.93, "Sofá 3 plazas 2.00 × 0.85", size=8, fill="#555")

# Comedor
def chair(x0, y0):
    rect(x0, y0, x0 + 0.42, y0 + 0.42, fill="#efe6d8", sw=0.9)


rect(4.45, 4.10, 5.55, 4.85, fill="#d9c09d")
text(5.00, 4.52, "Mesa 1.10 × 0.75", size=8, fill="#4a3a22")
chair(4.53, 3.66)
chair(5.05, 3.66)
chair(4.01, 4.27)
chair(5.57, 4.27)

# Cocina en L + pila
rect(7.15, 2.75, 7.85, 3.45, fill="#e9ecef")
stacked(7.50, 3.20, [("Refri", 8, "normal", "#444"), ("0.70", 7, "normal", "#777")], gap=12)
rect(7.25, 3.45, 7.85, 4.85, fill="#f0f0f0")
rect(7.30, 3.50, 7.80, 4.00, fill="#ffffff", sw=0.8)
for cx, cy in [(7.42, 3.62), (7.68, 3.62), (7.42, 3.88), (7.68, 3.88)]:
    circle(cx, cy, 8)
text(7.12, 3.78, "Estufa 0.60", size=8, fill="#555", anchor="end")
rect(7.31, 4.15, 7.79, 4.72, fill="#ffffff", sw=1)
rect(7.36, 4.20, 7.74, 4.67, fill="#e8eef2", sw=0.6, extra='rx="6"')
circle(7.55, 4.44, 3, fill="#888", stroke="#888")
line(7.78, 4.44, 7.85, 4.44, sw=2)
text(7.12, 3.96, "Fregadero 0.80", size=8, fill="#555", anchor="end")
rect(6.35, 4.25, 7.25, 4.85, fill="#dcdcdc")
rect(6.40, 4.30, 6.80, 4.80, fill="#cfe3f0", sw=0.8)
rect(6.85, 4.30, 7.20, 4.80, fill="#ececec", sw=0.8)
for i in range(1, 6):
    yy = 4.30 + i * 0.083
    line(6.88, yy, 7.17, yy, sw=0.6)
text(6.80, 4.10, "Pila 0.90 × 0.60", size=8, fill="#555")

# ---------------------------------------------------------------- rótulos
def room_label(x, y, name, dims, area):
    stacked(x, y, [(name, 12, "bold", "#1f1f1f"), (dims, 10, "normal", "#333"), (area, 10, "normal", "#333")])


room_label(1.30, 2.48, "DORMITORIO 1", "3.00 × 2.50 m", "7.50 m²")
room_label(6.70, 2.48, "DORMITORIO 2", "3.00 × 2.50 m", "7.50 m²")
stacked(3.65, 1.44, [("BAÑO", 12, "bold", "#1f1f1f"), ("1.50 × 2.50 m", 9, "normal", "#333"), ("3.75 m²", 9, "normal", "#333")], gap=14)
stacked(2.90, 3.60, [("SALA – COMEDOR – COCINA – LAVADO", 12, "bold", "#1f1f1f"), ("9.20 × 2.10 m · 19.32 m²", 10, "normal", "#333")])

# ---------------------------------------------------------------- cotas
def dim_h(x0, x1, y, label, size=12):
    line(x0, y, x1, y, sw=1)
    for xx in (x0, x1):
        line(xx, y - 0.07, xx, y + 0.07, sw=1)
        line(xx - 0.05, y + 0.05, xx + 0.05, y - 0.05, sw=1.6)
    text(X((x0 + x1) / 2), Y(y) - 8, label, size=size, px=True)


def dim_v(x, y0, y1, label, size=12):
    line(x, y0, x, y1, sw=1)
    for yy in (y0, y1):
        line(x - 0.07, yy, x + 0.07, yy, sw=1)
        line(x - 0.05, yy + 0.05, x + 0.05, yy - 0.05, sw=1.6)
    text(X(x) - 7, Y((y0 + y1) / 2), label, size=size, rot=-90, px=True)


dim_h(0, 8, -0.80, "8.00 m", size=15)
dim_h(0.15, 3.15, -0.38, "3.00")
dim_h(3.25, 4.75, -0.38, "1.50")
dim_h(4.85, 7.85, -0.38, "3.00")
for xx in (0, 8):
    line(xx, -0.88, xx, -0.05, stroke="#aaa", sw=0.7)

dim_h(-1.50, 0, 5.35, "1.50")
dim_h(0, 8, 5.35, "8.00")
dim_h(-1.50, 8, 5.80, "9.50 m (largo total en sala)", size=13)
for xx in (-1.50, 0, 8):
    line(xx, 5.05, xx, 5.88, stroke="#aaa", sw=0.7)

dim_v(8.85, 0, 5, "5.00 m", size=15)
dim_v(8.40, 0.15, 2.65, "2.50")
dim_v(8.40, 2.75, 4.85, "2.10")
for yy in (0, 5):
    line(8.05, yy, 8.95, yy, stroke="#aaa", sw=0.7)
dim_v(-1.95, 2.60, 5.00, "2.40")

# fachada y acceso
text(-2.45, 2.50, "FACHADA PRINCIPAL", size=14, weight="bold", rot=-90)


def arrow_right(x0, x1, y):
    line(x0, y, x1 - 0.13, y, stroke=RED, sw=2)
    out.append(f'<path d="M {X(x1-0.13):.1f} {Y(y)-6:.1f} L {X(x1):.1f} {Y(y):.1f} L {X(x1-0.13):.1f} {Y(y)+6:.1f} Z" fill="{RED}"/>')


arrow_right(-1.20, -0.12, 1.20)        # fachada dormitorios
arrow_right(-2.30, -1.62, 3.40)        # fachada sala
# acceso: flecha hacia abajo sobre la puerta
line(-0.80, 1.95, -0.80, 2.40, stroke=RED, sw=2.5)
out.append(f'<path d="M {X(-0.80)-7:.1f} {Y(2.40):.1f} L {X(-0.80):.1f} {Y(2.54):.1f} L {X(-0.80)+7:.1f} {Y(2.40):.1f} Z" fill="{RED}"/>')
text(-0.80, 1.86, "ACCESO", size=11, weight="bold", fill=RED)
text(-0.80, 1.72, "Puerta 0.90", size=8, fill="#555")
text(-1.65, 4.28, "Ventana 0.80", size=8, fill="#555", rot=-90)

# ---------------------------------------------------------------- bloques inferiores
by = 850


def box(x0, y0, w, h):
    out.append(f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="#fff" stroke="#333" stroke-width="1.2"/>')


box(40, by, 520, 220)
text(62, by + 52, "CASA MODELO BONAIRE", size=32, weight="bold", anchor="start", px=True)
text(62, by + 86, "2 dormitorios · 1 baño · área de lavado interior", size=15, anchor="start", px=True)
text(62, by + 111, "43.60 m² de construcción · 38.07 m² útiles", size=15, anchor="start", px=True)
out.append(f'<line x1="62" y1="{by+130}" x2="540" y2="{by+130}" stroke="#999" stroke-width="1"/>')
notes = [
    "Medidas en metros. Mobiliario dibujado a escala real.",
    "Muros de bloque de concreto: exterior 0.15 m, interior 0.10 m.",
    "Plano de distribución referencial. Requiere revisión y firma",
    "de arquitecto o ingeniero antes de construir.",
]
for i, n in enumerate(notes):
    text(62, by + 154 + i * 17, n, size=11, anchor="start", fill="#444", px=True)

ax = 580
box(ax, by, 420, 220)
text(ax + 210, by + 30, "CUADRO DE ÁREAS", size=14, weight="bold", px=True)
rows = [("Dormitorio 1", "3.00 × 2.50", "7.50"), ("Dormitorio 2", "3.00 × 2.50", "7.50"),
        ("Baño", "1.50 × 2.50", "3.75"), ("Sala-comedor-cocina-lavado", "9.20 × 2.10", "19.32")]
for i, (a, b, c) in enumerate(rows):
    yy = by + 62 + i * 23
    text(ax + 18, yy, a, size=11.5, anchor="start", px=True)
    text(ax + 300, yy, b, size=11.5, anchor="end", fill="#555", px=True)
    text(ax + 400, yy, c + " m²", size=11.5, anchor="end", px=True)
out.append(f'<line x1="{ax+15}" y1="{by+158}" x2="{ax+405}" y2="{by+158}" stroke="#333" stroke-width="1"/>')
text(ax + 18, by + 182, "ÁREA ÚTIL TOTAL", size=12.5, weight="bold", anchor="start", px=True)
text(ax + 400, by + 182, "38.07 m²", size=12.5, weight="bold", anchor="end", px=True)
text(ax + 18, by + 205, "ÁREA CONSTRUIDA", size=12.5, weight="bold", anchor="start", px=True)
text(ax + 400, by + 205, "43.60 m²", size=12.5, weight="bold", anchor="end", px=True)

lx = 1020
box(lx, by, 360, 220)
text(lx + 180, by + 30, "LEYENDA", size=14, weight="bold", px=True)
out.append(f'<rect x="{lx+22}" y="{by+48}" width="40" height="16" fill="{EXT}"/>')
text(lx + 74, by + 61, "Muro exterior de bloque 0.15 m", size=11.5, anchor="start", px=True)
out.append(f'<rect x="{lx+22}" y="{by+76}" width="40" height="16" fill="{INT}"/>')
text(lx + 74, by + 89, "Muro interior de bloque 0.10 m", size=11.5, anchor="start", px=True)
out.append(f'<rect x="{lx+22}" y="{by+104}" width="40" height="12" fill="#e3f1fb" stroke="{LINE}"/>')
out.append(f'<line x1="{lx+22}" y1="{by+110}" x2="{lx+62}" y2="{by+110}" stroke="#4a90c2" stroke-width="1.4"/>')
text(lx + 74, by + 115, "Ventana", size=11.5, anchor="start", px=True)
text(lx + 180, by + 158, "ESCALA GRÁFICA", size=11, weight="bold", px=True)
sx0 = lx + 70
for i in range(2):
    fill = "#262626" if i == 0 else "#ffffff"
    out.append(f'<rect x="{sx0 + i*S}" y="{by+170}" width="{S}" height="10" fill="{fill}" stroke="#262626"/>')
for i, lbl in enumerate(["0", "1", "2 m"]):
    text(sx0 + i * S, by + 198, lbl, size=10, px=True)

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{W_CANVAS}" height="{H_CANVAS}" '
    f'viewBox="0 0 {W_CANVAS} {H_CANVAS}">'
    f'<rect width="100%" height="100%" fill="#ffffff"/>' + "".join(out) + "</svg>"
)

base = "/home/claude/Casa_Modelo_Bonaire_plano"
with open(base + ".svg", "w", encoding="utf-8") as f:
    f.write(svg)
cairosvg.svg2png(bytestring=svg.encode(), write_to=base + ".png", scale=2.5)
cairosvg.svg2pdf(bytestring=svg.encode(), write_to=base + ".pdf")
print("listo")
