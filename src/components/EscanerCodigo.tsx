import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, X } from "lucide-react";

interface Props {
  onScan: (codigo: string) => void;
  onClose: () => void;
}

export default function EscanerCodigo({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "escaner-camara";
  const [error, setError] = useState("");
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          scanner.stop().then(() => {
            setActivo(false);
            onScan(decodedText);
          });
        },
        () => {},
      )
      .then(() => {
        setActivo(true);
        setError("");
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
              <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                Apunta al código de barras del producto
              </span>
            </div>
          )}
        </div>

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
            Soporta códigos EAN-13, UPC-A, Code 128, QR y más
          </p>
        </div>
      </div>
    </div>
  );
}
