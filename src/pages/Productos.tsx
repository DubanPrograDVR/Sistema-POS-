// src/pages/Productos.tsx
import { useEffect, useState } from "react";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/productosService";
import ListaProductos from "../components/productos/ListaProductos";
import FormProducto from "../components/productos/FormProductos";
import type { Producto } from "../types/database";

export default function Productos() {
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

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
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
