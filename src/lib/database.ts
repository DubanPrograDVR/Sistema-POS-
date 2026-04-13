import initSqlJs, { type Database } from "sql.js";

const DB_NAME = "inventario_pos_db";
let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

// ── IndexedDB persistence ──

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("store")) {
        req.result.createObjectStore("store");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIDB(): Promise<Uint8Array | null> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction("store", "readonly");
    const req = tx.objectStore("store").get("db");
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(data: Uint8Array): Promise<void> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction("store", "readwrite");
    tx.objectStore("store").put(data, "db");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Schema ──

function createTables(database: Database) {
  database.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'vendedor',
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  // Insertar usuario admin por defecto si no existe
  const result = database.exec("SELECT COUNT(*) as c FROM usuarios");
  const count = result.length > 0 ? (result[0].values[0][0] as number) : 0;
  if (count === 0) {
    database.run(
      `INSERT INTO usuarios (id, nombre_completo, email, password, rol, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        "Administrador",
        "admin@pos.com",
        "admin123",
        "admin",
        1,
      ],
    );
  }

  database.run(`CREATE TABLE IF NOT EXISTS productos (
    id TEXT PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria_id TEXT,
    proveedor_id TEXT,
    precio_compra REAL NOT NULL DEFAULT 0,
    precio_venta REAL NOT NULL DEFAULT 0,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    stock_maximo INTEGER NOT NULL DEFAULT 0,
    imagen_url TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS proveedores (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    contacto TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    nit_ci TEXT,
    tipo TEXT NOT NULL DEFAULT 'regular',
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS ventas (
    id TEXT PRIMARY KEY,
    numero_factura TEXT NOT NULL UNIQUE,
    cliente_id TEXT,
    usuario_id TEXT NOT NULL,
    total REAL NOT NULL DEFAULT 0,
    descuento REAL NOT NULL DEFAULT 0,
    impuesto REAL NOT NULL DEFAULT 0,
    total_final REAL NOT NULL DEFAULT 0,
    metodo_pago TEXT NOT NULL DEFAULT 'efectivo',
    estado TEXT NOT NULL DEFAULT 'pendiente',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS detalle_ventas (
    id TEXT PRIMARY KEY,
    venta_id TEXT NOT NULL REFERENCES ventas(id),
    producto_id TEXT NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    descuento REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id TEXT PRIMARY KEY,
    producto_id TEXT NOT NULL REFERENCES productos(id),
    tipo_movimiento TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    usuario_id TEXT NOT NULL,
    referencia TEXT,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS compras (
    id TEXT PRIMARY KEY,
    numero_compra TEXT NOT NULL UNIQUE,
    proveedor_id TEXT NOT NULL REFERENCES proveedores(id),
    usuario_id TEXT NOT NULL,
    total REAL NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    fecha_compra TEXT NOT NULL,
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS detalle_compras (
    id TEXT PRIMARY KEY,
    compra_id TEXT NOT NULL REFERENCES compras(id),
    producto_id TEXT NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    total REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  database.run(`CREATE TABLE IF NOT EXISTS cajas (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    monto_inicial REAL NOT NULL DEFAULT 0,
    monto_final REAL,
    total_ventas REAL NOT NULL DEFAULT 0,
    total_efectivo REAL NOT NULL DEFAULT 0,
    total_tarjeta REAL NOT NULL DEFAULT 0,
    total_transferencia REAL NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'abierta',
    fecha_apertura TEXT NOT NULL DEFAULT (datetime('now')),
    fecha_cierre TEXT,
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
}

// ── Public API ──

export async function getDatabase(): Promise<Database> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: () => "/sql-wasm.wasm",
    });

    const saved = await loadFromIDB();
    db = saved ? new SQL.Database(saved) : new SQL.Database();

    db.run("PRAGMA foreign_keys = ON");
    createTables(db);
    await persist();
    return db;
  })();

  return initPromise;
}

export async function persist(): Promise<void> {
  if (!db) return;
  await saveToIDB(db.export());
}

/** Ejecutar un SELECT y devolver resultados como array de objetos */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null | Uint8Array)[] = [],
): Promise<T[]> {
  const database = await getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

/** Ejecutar INSERT/UPDATE/DELETE y persistir */
export async function execute(
  sql: string,
  params: (string | number | null | Uint8Array)[] = [],
): Promise<void> {
  const database = await getDatabase();
  database.run(sql, params);
  await persist();
}
