import { useState, useEffect } from "react";
import {
  Hash,
  Tag,
  Package,
  Save,
  X,
  Camera,
  ImagePlus,
  Trash2,
} from "lucide-react";
import EscanerCodigo from "../EscanerCodigo";
import type { Producto } from "../../types/database";

interface Props {
  producto?: Producto | null;
  onGuardar: (datos: Partial<Producto>) => void;
  onCancelar: () => void;
}

export default function FormProducto({
  producto,
  onGuardar,
  onCancelar,
}: Props) {
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    precio_compra: "" as string | number,
    precio_venta: "" as string | number,
    stock_actual: "" as string | number,
    imagen_url: "",
  });
  const [mostrarEscaner, setMostrarEscaner] = useState(false);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio_compra: producto.precio_compra,
        precio_venta: producto.precio_venta,
        stock_actual: producto.stock_actual,
        imagen_url: producto.imagen_url ?? "",
      });
      if (producto.imagen_url) setPreviewImagen(producto.imagen_url);
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm({ ...form, imagen_url: base64 });
      setPreviewImagen(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      codigo: form.codigo,
      nombre: form.nombre,
      precio_compra: Number(form.precio_compra) || 0,
      precio_venta: Number(form.precio_venta) || 0,
      stock_actual: Number(form.stock_actual) || 0,
      imagen_url: form.imagen_url || undefined,
    });
  };

  return (
    <>
      {mostrarEscaner && (
        <EscanerCodigo
          onScan={(codigo) => {
            setForm({ ...form, codigo });
            setMostrarEscaner(false);
          }}
          onClose={() => setMostrarEscaner(false)}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          {producto ? "Editar Producto" : "Nuevo Producto"}
        </h2>

        <div className="space-y-4">
          {/* Código y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Código de barras
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    name="codigo"
                    value={form.codigo}
                    onChange={handleChange}
                    placeholder="Ej: 7801234567890"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarEscaner(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium transition"
                  title="Escanear código con la cámara">
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Escanear</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre del producto
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Coca-Cola 500ml"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Precio de compra (CLP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  $
                </span>
                <input
                  name="precio_compra"
                  type="number"
                  min="0"
                  step="1"
                  value={form.precio_compra}
                  onChange={handleChange}
                  placeholder="Ej: 500"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Lo que pagas al proveedor
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Precio de venta (CLP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-500">
                  $
                </span>
                <input
                  name="precio_venta"
                  type="number"
                  min="0"
                  step="1"
                  value={form.precio_venta}
                  onChange={handleChange}
                  placeholder="Ej: 990"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Lo que cobra la caja
              </p>
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Stock actual
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  name="stock_actual"
                  type="number"
                  min="0"
                  value={form.stock_actual}
                  onChange={handleChange}
                  placeholder="Cantidad disponible"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Unidades en inventario
              </p>
            </div>
          </div>

          {/* Imagen del producto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Foto del producto
            </label>
            <div className="flex items-start gap-4">
              {previewImagen ? (
                <div className="relative group">
                  <img
                    src={previewImagen}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImagen(null);
                      setForm({ ...form, imagen_url: "" });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                  <Package className="h-8 w-8 text-slate-300" />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition w-fit">
                  <ImagePlus className="h-4 w-4" />
                  {previewImagen ? "Cambiar foto" : "Subir foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-400 mt-1.5">
                  JPG, PNG o WebP. Máximo 2 MB.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition">
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition shadow-sm">
            <Save className="h-4 w-4" />
            {producto ? "Actualizar" : "Guardar Producto"}
          </button>
        </div>
      </form>
    </>
  );
}
