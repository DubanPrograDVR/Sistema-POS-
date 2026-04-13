// src/types/database.ts

export interface Usuario {
  id: string;
  nombre_completo: string;
  email: string;
  rol: "admin" | "vendedor" | "gerente";
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id?: string;
  proveedor_id?: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  imagen_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  nit_ci?: string;
  tipo: "regular" | "vip" | "mayorista";
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Venta {
  id: string;
  numero_factura: string;
  cliente_id?: string;
  usuario_id: string;
  total: number;
  descuento: number;
  impuesto: number;
  total_final: number;
  metodo_pago: "efectivo" | "tarjeta" | "transferencia" | "mixto";
  estado: "completada" | "cancelada" | "pendiente";
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface DetalleVenta {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
  total: number;
  created_at: string;
}

export interface MovimientoInventario {
  id: string;
  producto_id: string;
  tipo_movimiento: "entrada" | "salida" | "ajuste";
  cantidad: number;
  motivo: string;
  usuario_id: string;
  referencia?: string;
  stock_anterior: number;
  stock_nuevo: number;
  created_at: string;
}

export interface Compra {
  id: string;
  numero_compra: string;
  proveedor_id: string;
  usuario_id: string;
  total: number;
  estado: "completada" | "pendiente" | "cancelada";
  fecha_compra: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface DetalleCompra {
  id: string;
  compra_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  created_at: string;
}

export interface Caja {
  id: string;
  usuario_id: string;
  monto_inicial: number;
  monto_final?: number;
  total_ventas: number;
  total_efectivo: number;
  total_tarjeta: number;
  total_transferencia: number;
  estado: "abierta" | "cerrada";
  fecha_apertura: string;
  fecha_cierre?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}
