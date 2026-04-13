import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { query } from "../lib/database";
import { Lock, User, Eye, EyeOff, Scan } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }

    setCargando(true);
    try {
      const rows = await query(
        "SELECT * FROM usuarios WHERE email = ? AND password = ? AND activo = 1 LIMIT 1",
        [email.trim(), password],
      );

      if (rows.length === 0) {
        setError("Credenciales incorrectas");
      } else {
        const usuario = rows[0] as Record<string, unknown>;
        sessionStorage.setItem(
          "usuario",
          JSON.stringify({
            id: usuario.id,
            nombre_completo: usuario.nombre_completo,
            email: usuario.email,
            rol: usuario.rol,
          }),
        );
        navigate("/admin");
      }
    } catch {
      setError("Error al iniciar sesión");
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <Scan className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sistema POS</h1>
          <p className="text-blue-300 text-sm mt-1">
            Acceso al panel de administración
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition text-sm">
              {cargando ? "Verificando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-slate-500 hover:text-blue-600 transition">
              Volver al Punto de Venta
            </button>
          </div>
        </div>

        <p className="text-center text-blue-400/60 text-xs mt-6">
          Usuario por defecto: admin@pos.com / admin123
        </p>
      </div>
    </div>
  );
}
