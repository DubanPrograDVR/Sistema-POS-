import { Pencil, Trash2, Package, AlertTriangle } from "lucide-react";
import type { Producto } from "../../types/database";

interface Props {
  productos: Producto[];
  onEditar: (producto: Producto) => void;
  onEliminar: (id: string) => void;
}

export default function ListaProductos({
  productos,
  onEditar,
  onEliminar,
}: Props) {
  const formatoPrecio = (valor: number) =>
    valor.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <Package className="h-16 w-16 text-slate-300 mx-auto mb-3 stroke-1" />
        <p className="text-slate-500 font-medium">
          No hay productos registrados
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Agrega tu primer producto con el botón de arriba
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              P. Compra
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              P. Venta
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {productos.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50 transition">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {p.imagen_url ? (
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-800">
                    {p.nombre}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-mono text-slate-500">
                {p.codigo}
              </td>
              <td className="px-4 py-3 text-sm text-right text-slate-500">
                {formatoPrecio(p.precio_compra)}
              </td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                {formatoPrecio(p.precio_venta)}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  {p.stock_actual <= 5 && p.stock_actual > 0 && (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  {p.stock_actual <= 0 && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.stock_actual <= 0
                        ? "bg-red-100 text-red-700"
                        : p.stock_actual <= 5
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}>
                    {p.stock_actual}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <button
                    className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                    onClick={() => onEditar(p)}
                    title="Editar producto">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                    onClick={() => onEliminar(p.id)}
                    title="Eliminar producto">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
