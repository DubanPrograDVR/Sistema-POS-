// src/pages/Productos.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/productosService";
import ListaProductos from "../components/productos/ListaProductos";
import FormProducto from "../components/productos/FormProductos";
import type { Producto } from "../types/database";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function Productos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);

  async function cargarProductos() {
    const data = await obtenerProductos();
    setProductos(data);
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function handleGuardar(form: any) {
    if (productoEditar) {
      await actualizarProducto(productoEditar.id, form);
    } else {
      await crearProducto(form);
    }
    setMostrandoFormulario(false);
    setProductoEditar(null);
    await cargarProductos();
  }

  async function handleEliminar(id: string) {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
      await eliminarProducto(id);
      await cargarProductos();
    }
  }

  const productosStockBajo = productos.filter(
    (p) => p.stock_actual > 0 && p.stock_actual <= 5,
  );
  const productosSinStock = productos.filter((p) => p.stock_actual <= 0);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header con flecha de retroceso */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition shadow-sm"
            title="Volver al Punto de Venta">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">
              Gestión de Productos
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {productos.length} producto{productos.length !== 1 ? "s" : ""}{" "}
              registrado{productos.length !== 1 ? "s" : ""}
            </p>
          </div>
          {!mostrandoFormulario && (
            <button
              onClick={() => setMostrandoFormulario(true)}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-sm">
              + Nuevo Producto
            </button>
          )}
        </div>

        {/* Alertas de stock */}
        {(productosSinStock.length > 0 || productosStockBajo.length > 0) &&
          !mostrandoFormulario && (
            <div className="space-y-2 mb-6">
              {productosSinStock.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-semibold">Sin stock:</span>{" "}
                    {productosSinStock.map((p) => p.nombre).join(", ")}
                  </div>
                </div>
              )}
              {productosStockBajo.length > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-semibold">Stock bajo:</span>{" "}
                    {productosStockBajo
                      .map((p) => `${p.nombre} (${p.stock_actual})`)
                      .join(", ")}
                  </div>
                </div>
              )}
            </div>
          )}

        {mostrandoFormulario ? (
          <FormProducto
            producto={productoEditar}
            onGuardar={handleGuardar}
            onCancelar={() => {
              setMostrandoFormulario(false);
              setProductoEditar(null);
            }}
          />
        ) : (
          <ListaProductos
            productos={productos}
            onEditar={setProductoEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>
    </div>
  );
}
