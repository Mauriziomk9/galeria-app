import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

function UploadImagem() {
  return <div>Página de Upload</div>;
}

function ListaImagens() {
  return <div>Imagens Cadastradas</div>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/imagens" element={<ListaImagens />} />
        <Route path="/admin/upload" element={<UploadImagem />} />
        <Route path="*" element={<Navigate to="/admin/imagens" />} />
      </Routes>
    </Router>
  );
}
