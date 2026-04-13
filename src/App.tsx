import { BrowserRouter, Routes, Route } from "react-router-dom";
import Productos from "./pages/Productos";
import PuntoVenta from "./pages/PuntoDeVenta";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PuntoVenta />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
