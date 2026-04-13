import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Scan, Package, ShoppingCart } from "lucide-react";

interface UsuarioSesion {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("usuario");
    if (!data) {
      navigate("/login");
      return;
    }
    setUsuario(JSON.parse(data));
  }, [navigate]);

  const cerrarSesion = () => {
    sessionStorage.removeItem("usuario");
    navigate("/login");
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg p-2">
                <Scan className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none">
                  Panel de Administración
                </h1>
                <p className="text-[11px] text-blue-200">{usuario.email}</p>
              </div>
            </div>
            <button
              onClick={cerrarSesion}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-lg text-sm">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Bienvenido, {usuario.nombre_completo}
        </h1>
        <p className="text-slate-500 mb-8">
          Has iniciado sesión exitosamente como{" "}
          <span className="font-semibold capitalize">{usuario.rol}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/productos")}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left hover:shadow-md hover:border-blue-200 transition group">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-xl p-3 group-hover:bg-blue-100 transition">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Gestión de Productos
                </h2>
                <p className="text-sm text-slate-500">
                  Agregar, editar y eliminar productos del inventario
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/")}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-left hover:shadow-md hover:border-emerald-200 transition group">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 rounded-xl p-3 group-hover:bg-emerald-100 transition">
                <ShoppingCart className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Punto de Venta
                </h2>
                <p className="text-sm text-slate-500">
                  Ir a la caja registradora
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
