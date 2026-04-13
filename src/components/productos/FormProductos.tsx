import { useState, useEffect } from "react";
import { Hash, Tag, DollarSign, Package, Save, X, Camera } from "lucide-react";
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
    precio_compra: 0,
    precio_venta: 0,
    stock_actual: 0,
  });
  const [mostrarEscaner, setMostrarEscaner] = useState(false);

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio_compra: producto.precio_compra,
        precio_venta: producto.precio_venta,
        stock_actual: producto.stock_actual,
      });
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name.includes("precio") || name.includes("stock")
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(form);
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
                Precio de compra
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  name="precio_compra"
                  type="number"
                  min="0"
                  step="1"
                  value={form.precio_compra}
                  onChange={handleChange}
                  placeholder="Costo al proveedor"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Lo que pagas al proveedor
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Precio de venta
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  name="precio_venta"
                  type="number"
                  min="0"
                  step="1"
                  value={form.precio_venta}
                  onChange={handleChange}
                  placeholder="Precio al público"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
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
