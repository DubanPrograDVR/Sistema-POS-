import { useEffect, useState } from "react";
import { obtenerProductos } from "../services/productosService";
import type { Producto } from "../types/database";

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    cargar();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Inventario POS</h1>
      <ul>
        {productos.map((p) => (
          <li key={p.id}>
            {p.nombre} - ${p.precio_venta} (Stock: {p.stock_actual})
          </li>
        ))}
      </ul>
    </div>
  );
}
