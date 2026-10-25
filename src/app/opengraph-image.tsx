import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

/**
 * Imagen para compartir el enlace (WhatsApp, Facebook, X…): fachada + modelo + marca.
 * Se genera en el build. La fachada es un recorte reducido (`assets/og-fachada.png`,
 * ~75 KB) para no pasar el límite de 500 KB de ImageResponse. Usa Archivo (la fuente de
 * títulos del sitio) en TTF estático desde `assets/fonts/` (licencia SIL OFL, `OFL.txt`):
 * ImageResponse no admite WOFF2 ni fuentes variables.
 */
export const alt = `${site.modelo} — fachada principal. ${site.marca}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const leerAsset = (...ruta: string[]) => readFile(join(process.cwd(), "assets", ...ruta));

const fachada = `data:image/png;base64,${(await leerAsset("og-fachada.png")).toString("base64")}`;
const [archivoBold, archivoExtraBold] = await Promise.all([
  leerAsset("fonts", "Archivo-Bold.ttf"),
  leerAsset("fonts", "Archivo-ExtraBold.ttf"),
]);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          fontFamily: "Archivo",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 470,
            padding: "0 56px",
            background: "#24201d",
            color: "#f5f3ef",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 22, height: 22, background: "#b0502c" }} />
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 1 }}>{site.marca}</div>
          </div>
          <div style={{ marginTop: 36, fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
            {site.modelo}
          </div>
          <div style={{ marginTop: 28, width: 90, height: 6, background: "#b0502c" }} />
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 28,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse solo admite <img> */}
          <img src={fachada} width={660} height={527} alt="" style={{ objectFit: "contain" }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivoBold, weight: 700, style: "normal" },
        { name: "Archivo", data: archivoExtraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
