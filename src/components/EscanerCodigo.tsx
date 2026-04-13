import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, X, ZoomIn, ZoomOut, Focus } from "lucide-react";

interface Props {
  onScan: (codigo: string) => void;
  onClose: () => void;
}

export default function EscanerCodigo({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "escaner-camara";
  const [error, setError] = useState("");
  const [activo, setActivo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [tieneZoom, setTieneZoom] = useState(false);

  const aplicarZoom = useCallback(async (nuevoZoom: number) => {
    try {
      const videoEl = document.querySelector(
        `#${containerId} video`,
      ) as HTMLVideoElement | null;
      if (!videoEl?.srcObject) return;
      const track = (videoEl.srcObject as MediaStream).getVideoTracks()[0];
      if (!track) return;
      const caps = track.getCapabilities() as MediaTrackCapabilities & {
        zoom?: { min: number; max: number };
      };
      if (!caps.zoom) return;
      const clamped = Math.min(
        Math.max(nuevoZoom, caps.zoom.min),
        caps.zoom.max,
      );
      await track.applyConstraints({
        advanced: [{ zoom: clamped } as MediaTrackConstraintSet],
      });
      setZoom(clamped);
    } catch {
      /* zoom no soportado */
    }
  }, []);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        {
          facingMode: "environment",
        },
        {
          fps: 15,
          qrbox: { width: 320, height: 180 },
          aspectRatio: 1.7778,
          disableFlip: false,
        },
        (decodedText) => {
          scanner.stop().then(() => {
            setActivo(false);
            onScan(decodedText);
          });
        },
        () => {},
      )
      .then(async () => {
        setActivo(true);
        setError("");

        // Intentar activar autofocus continuo y detectar zoom
        const videoEl = document.querySelector(
          `#${containerId} video`,
        ) as HTMLVideoElement | null;
        if (videoEl?.srcObject) {
          const track = (videoEl.srcObject as MediaStream).getVideoTracks()[0];
          if (track) {
            const caps = track.getCapabilities() as MediaTrackCapabilities & {
              zoom?: { min: number; max: number };
              focusMode?: string[];
            };

            // Autofocus continuo
            if (caps.focusMode?.includes("continuous")) {
              try {
                await track.applyConstraints({
                  advanced: [
                    { focusMode: "continuous" } as MediaTrackConstraintSet,
                  ],
                });
              } catch {
                /* no soportado */
              }
            }

            // Zoom disponible
            if (caps.zoom) {
              setTieneZoom(true);
              setMaxZoom(caps.zoom.max);
              setZoom(caps.zoom.min);
            }
          }
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Permission")) {
          setError(
            "Permiso de cámara denegado. Habilítalo en la configuración del navegador.",
          );
        } else {
          setError(
            "No se pudo acceder a la cámara. Verifica que tu dispositivo tenga cámara disponible.",
          );
        }
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {activo ? (
              <Camera className="h-5 w-5 text-emerald-600" />
            ) : (
              <CameraOff className="h-5 w-5 text-slate-400" />
            )}
            <h3 className="font-semibold text-slate-800">
              Escanear Código de Barras
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-black">
          <div id={containerId} className="w-full" />
          {activo && (
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                <Focus className="h-3.5 w-3.5" />
                Apunta al código de barras del producto
              </span>
            </div>
          )}
        </div>

        {/* Controles de Zoom */}
        {activo && tieneZoom && (
          <div className="px-5 py-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => aplicarZoom(zoom - 0.5)}
                disabled={zoom <= 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ZoomOut className="h-4 w-4 text-slate-600" />
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min={1}
                  max={maxZoom}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => aplicarZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <button
                onClick={() => aplicarZoom(zoom + 0.5)}
                disabled={zoom >= maxZoom}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                <ZoomIn className="h-4 w-4 text-slate-600" />
              </button>
              <span className="text-xs font-mono text-slate-400 w-10 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-5 py-4">
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            {tieneZoom
              ? "Usa el zoom para acercarte al código desde lejos"
              : "Acerca el producto a la cámara para mejor lectura"}
          </p>
        </div>
      </div>
    </div>
  );
}
