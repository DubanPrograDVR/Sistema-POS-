// src/services/productosService.ts
import { query, execute } from "../lib/database";
import type { Producto } from "../types/database";

function mapProducto(row: Record<string, unknown>): Producto {
  return { ...row, activo: Boolean(row.activo) } as Producto;
}

// Obtener todos los productos
export async function obtenerProductos(): Promise<Producto[]> {
  const rows = await query("SELECT * FROM productos ORDER BY nombre ASC");
  return rows.map(mapProducto);
}

// Buscar producto por código
export async function buscarPorCodigo(
  codigo: string,
): Promise<Producto | null> {
  const rows = await query("SELECT * FROM productos WHERE codigo = ? LIMIT 1", [
    codigo,
  ]);
  return rows.length > 0 ? mapProducto(rows[0]) : null;
}

// Crear un producto
export async function crearProducto(
  nuevo: Omit<Producto, "id" | "created_at" | "updated_at">,
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await execute(
    `INSERT INTO productos (id, codigo, nombre, descripcion, categoria_id, proveedor_id,
      precio_compra, precio_venta, stock_actual, stock_minimo, stock_maximo,
      imagen_url, activo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      nuevo.codigo,
      nuevo.nombre,
      nuevo.descripcion ?? null,
      nuevo.categoria_id ?? null,
      nuevo.proveedor_id ?? null,
      nuevo.precio_compra ?? 0,
      nuevo.precio_venta ?? 0,
      nuevo.stock_actual ?? 0,
      nuevo.stock_minimo ?? 0,
      nuevo.stock_maximo ?? 0,
      nuevo.imagen_url ?? null,
      nuevo.activo !== undefined ? (nuevo.activo ? 1 : 0) : 1,
      now,
      now,
    ],
  );
}

const VALID_COLUMNS = new Set([
  "codigo",
  "nombre",
  "descripcion",
  "categoria_id",
  "proveedor_id",
  "precio_compra",
  "precio_venta",
  "stock_actual",
  "stock_minimo",
  "stock_maximo",
  "imagen_url",
  "activo",
]);

// Actualizar producto
export async function actualizarProducto(
  id: string,
  cambios: Partial<Producto>,
) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(cambios)) {
    if (!VALID_COLUMNS.has(key)) continue;
    fields.push(`${key} = ?`);
    values.push(
      key === "activo" ? (value ? 1 : 0) : (value as string | number | null),
    );
  }

  if (fields.length === 0) return;

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  await execute(
    `UPDATE productos SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
}

// Eliminar producto
export async function eliminarProducto(id: string) {
  await execute("DELETE FROM productos WHERE id = ?", [id]);
}
