import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buscarPorCodigo } from "../services/productosService";
import EscanerCodigo from "../components/EscanerCodigo";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Scan,
  DollarSign,
  Package,
  Clock,
  LogOut,
  Search,
  X,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Camera,
} from "lucide-react";
import type { Producto } from "../types/database";

interface CartItem {
  producto: Producto;
  cantidad: number;
}

export default function PuntoVenta() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [productoEscaneado, setProductoEscaneado] = useState<Producto | null>(
    null,
  );
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "success" | "warn">(
    "error",
  );
  const [buscando, setBuscando] = useState(false);
  const [metodoPago, setMetodoPago] = useState<
    "efectivo" | "tarjeta" | "transferencia"
  >("efectivo");
  const [mostrarEscaner, setMostrarEscaner] = useState(false);

  const mostrarMensaje = (
    texto: string,
    tipo: "error" | "success" | "warn" = "error",
  ) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    if (tipo === "success") {
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const buscarProductoPorCodigo = async (codigo: string) => {
    if (!codigo.trim()) {
      mostrarMensaje("Ingresa un código válido", "warn");
      return;
    }

    setBuscando(true);
    try {
      const data = await buscarPorCodigo(codigo.trim());

      if (!data) {
        setProductoEscaneado(null);
        mostrarMensaje("Producto no encontrado", "error");
      } else if (data.stock_actual <= 0) {
        setProductoEscaneado(null);
        mostrarMensaje("Producto sin stock disponible", "warn");
      } else {
        setProductoEscaneado(data);
        setMensaje("");
      }
    } catch {
      setProductoEscaneado(null);
      mostrarMensaje("Error al buscar producto", "error");
    }
    setBuscando(false);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    buscarProductoPorCodigo(codigo);
    setCodigo("");
  };

  const agregarAlCarrito = (producto: Producto, cantidad = 1) => {
    const existente = carrito.find((item) => item.producto.id === producto.id);
    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock_actual) {
        mostrarMensaje(
          `Stock insuficiente (Disponible: ${producto.stock_actual})`,
          "warn",
        );
        return;
      }
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: nuevaCantidad }
            : item,
        ),
      );
    } else {
      if (cantidad > producto.stock_actual) {
        mostrarMensaje(
          `Stock insuficiente (Disponible: ${producto.stock_actual})`,
          "warn",
        );
        return;
      }
      setCarrito([...carrito, { producto, cantidad }]);
    }
    setProductoEscaneado(null);
    mostrarMensaje("Producto agregado al carrito", "success");
  };

  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    const item = carrito.find((i) => i.producto.id === id);
    if (item && nuevaCantidad > item.producto.stock_actual) {
      mostrarMensaje(
        `Stock insuficiente (Disponible: ${item.producto.stock_actual})`,
        "warn",
      );
      return;
    }
    setCarrito(
      carrito.map((i) =>
        i.producto.id === id ? { ...i, cantidad: nuevaCantidad } : i,
      ),
    );
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(carrito.filter((i) => i.producto.id !== id));
  };

  const limpiarCarrito = () => {
    setCarrito([]);
    setProductoEscaneado(null);
    setMensaje("");
  };

  const calcularSubtotal = () =>
    carrito.reduce((acc, i) => acc + i.producto.precio_venta * i.cantidad, 0);

  const calcularTotal = () => calcularSubtotal();

  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  const formatoPrecio = (valor: number) =>
    valor.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  const procesarVenta = () => {
    if (carrito.length === 0) {
      mostrarMensaje("El carrito está vacío", "warn");
      return;
    }
    mostrarMensaje(
      `Venta procesada correctamente por ${formatoPrecio(calcularTotal())}`,
      "success",
    );
    limpiarCarrito();
  };

  const fechaHoy = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mensajeClasses = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warn: "bg-amber-50 border-amber-200 text-amber-700",
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg p-2">
                <Scan className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight leading-none">
                  Sistema POS
                </h1>
                <p className="text-[11px] text-blue-200">Punto de Venta</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-blue-200">
              <Clock className="h-4 w-4" />
              <span className="capitalize hidden sm:inline">{fechaHoy}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-lg text-sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Toast / Mensaje ── */}
      {mensaje && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 w-full mt-3">
          <div
            className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium ${mensajeClasses[tipoMensaje]}`}>
            <span>{mensaje}</span>
            <button onClick={() => setMensaje("")}>
              <X className="h-4 w-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
          {/* ── Columna izquierda: Escáner + Producto ── */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Barra de búsqueda grande */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <form onSubmit={handleScan} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Escanea o escribe el código del producto..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={buscando}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white px-6 rounded-xl font-medium transition flex items-center gap-2 text-sm">
                  <Scan className="h-4 w-4" />
                  {buscando ? "..." : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarEscaner(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 rounded-xl font-medium transition flex items-center gap-2 text-sm"
                  title="Escanear con cámara">
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Cámara</span>
                </button>
              </form>
            </div>

            {/* Producto encontrado */}
            {productoEscaneado && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 rounded-xl p-3 shrink-0">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-mono mb-0.5">
                        {productoEscaneado.codigo}
                      </p>
                      <h3 className="text-lg font-bold text-slate-800">
                        {productoEscaneado.nombre}
                      </h3>
                      {productoEscaneado.descripcion && (
                        <p className="text-sm text-slate-500 mt-0.5">
                          {productoEscaneado.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatoPrecio(productoEscaneado.precio_venta)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Stock:{" "}
                      <span className="font-semibold text-slate-600">
                        {productoEscaneado.stock_actual}
                      </span>{" "}
                      uds
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => agregarAlCarrito(productoEscaneado, 1)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    <Plus className="h-5 w-5" />
                    Agregar al carrito
                  </button>
                  <button
                    onClick={() => setProductoEscaneado(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 rounded-xl transition">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Lista del carrito (detalle) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                  <ShoppingCart className="h-4 w-4" />
                  Detalle de Venta
                  {totalItems > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  )}
                </h3>
                {carrito.length > 0 && (
                  <button
                    onClick={limpiarCarrito}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                    Vaciar
                  </button>
                )}
              </div>

              {/* Header de tabla */}
              {carrito.length > 0 && (
                <div className="grid grid-cols-[1fr_120px_100px_100px_40px] gap-2 px-5 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <span>Producto</span>
                  <span className="text-center">Cantidad</span>
                  <span className="text-right">P. Unit.</span>
                  <span className="text-right">Subtotal</span>
                  <span></span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {carrito.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-slate-300">
                    <ShoppingCart className="h-16 w-16 mb-3 stroke-1" />
                    <p className="text-base font-medium">Carrito vacío</p>
                    <p className="text-sm mt-1">
                      Escanea un producto para comenzar
                    </p>
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div
                      key={item.producto.id}
                      className="grid grid-cols-[1fr_120px_100px_100px_40px] gap-2 items-center px-5 py-3 border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {item.producto.nombre}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {item.producto.codigo}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            actualizarCantidad(
                              item.producto.id,
                              item.cantidad - 1,
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 active:bg-slate-200 transition">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center font-semibold text-sm">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            actualizarCantidad(
                              item.producto.id,
                              item.cantidad + 1,
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 active:bg-slate-200 transition">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-right text-sm text-slate-500">
                        {formatoPrecio(item.producto.precio_venta)}
                      </p>
                      <p className="text-right text-sm font-semibold text-slate-800">
                        {formatoPrecio(
                          item.producto.precio_venta * item.cantidad,
                        )}
                      </p>
                      <button
                        onClick={() => eliminarDelCarrito(item.producto.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition mx-auto">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Columna derecha: Resumen y Pago ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Método de pago */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Método de Pago
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    key: "efectivo" as const,
                    label: "Efectivo",
                    icon: Banknote,
                  },
                  {
                    key: "tarjeta" as const,
                    label: "Tarjeta",
                    icon: CreditCard,
                  },
                  {
                    key: "transferencia" as const,
                    label: "Transfer.",
                    icon: ArrowRightLeft,
                  },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setMetodoPago(key)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition text-sm font-medium ${
                      metodoPago === key
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }`}>
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen de venta */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Resumen de Venta
              </h3>

              <div className="space-y-2 text-sm flex-1">
                <div className="flex justify-between text-slate-500">
                  <span>Artículos ({totalItems})</span>
                  <span>{formatoPrecio(calcularSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Descuento</span>
                  <span>{formatoPrecio(0)}</span>
                </div>
                <div className="border-t border-dashed border-slate-200 my-3" />
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-slate-800">
                    TOTAL
                  </span>
                  <span className="text-3xl font-extrabold text-emerald-600">
                    {formatoPrecio(calcularTotal())}
                  </span>
                </div>
              </div>

              {/* Botón de cobrar */}
              <button
                onClick={procesarVenta}
                disabled={carrito.length === 0}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 ${
                  carrito.length > 0
                    ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}>
                <DollarSign className="h-6 w-6" />
                {carrito.length > 0
                  ? `Cobrar ${formatoPrecio(calcularTotal())}`
                  : "Sin productos"}
              </button>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={limpiarCarrito}
                className="bg-white border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center justify-center gap-2">
                <X className="h-4 w-4" />
                Cancelar Venta
              </button>
              <button
                onClick={() => navigate("/productos")}
                className="bg-white border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition flex items-center justify-center gap-2">
                <Package className="h-4 w-4" />
                Ver Inventario
              </button>
            </div>
          </div>
        </div>
      </main>

      {mostrarEscaner && (
        <EscanerCodigo
          onScan={(codigoEscaneado) => {
            setMostrarEscaner(false);
            setCodigo(codigoEscaneado);
            buscarProductoPorCodigo(codigoEscaneado);
          }}
          onClose={() => setMostrarEscaner(false)}
        />
      )}
    </div>
  );
}
