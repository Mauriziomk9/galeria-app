import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const supabase = createClient(
  "https://xswytgkswrtteflowxap.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd3l0Z2tzd3J0dGVmbG93eGFwIiwicm9sZSI6InB1YmxpYyIsImlhdCI6MTY5NTE0NzYyMSwiZXhwIjoxMzkxNTE0NzYyMX0.UgJ6wYaVBoL6K50IavugmrPyq5dMrJ6Tjtw3gFAqIjA"
);

function UploadImagem() {
  return <div>Página de Upload</div>;
}

function ListaImagens() {
  const [imagens, setImagens] = useState([]);
  const [certificando, setCertificando] = useState(null);

  useEffect(() => {
    async function fetchImagens() {
      const { data, error } = await supabase.from("imagens").select("*");
      if (!error) setImagens(data);
    }
    fetchImagens();
  }, []);

  const gerarCertificado = async (imagem) => {
    setCertificando(imagem.id);
    const canvas = await html2canvas(document.getElementById(`certificado-${imagem.id}`));
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF();
    doc.addImage(imgData, "PNG", 10, 10, 190, 0);
    doc.save(`certificado-${imagem.codigo || imagem.id}.pdf`);
    setCertificando(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Imagens Cadastradas</h2>
      {imagens.length === 0 && <p>Nenhuma imagem encontrada.</p>}
      {imagens.map((img) => (
        <div key={img.id} style={{ marginBottom: 40 }}>
          <p><strong>{img.nome || "(Sem nome)"}</strong></p>
          <p>Série: {img.serie || "(Sem série)"}</p>
          <p>Código: {img.codigo || img.id}</p>
          <div id={`certificado-${img.id}`} style={{ padding: 10, border: '1px solid #ccc', width: 300 }}>
            <h3>Certificado de Autenticidade</h3>
            <p><strong>Obra</strong></p>
            <p>Título: {(img.serie || "[Série Desconhecida]") + " - " + (img.codigo || img.id)}</p>
            <p>Data da Tomada: {img.dataoriginal || "Desconhecida"}</p>
            <p>Técnica: Fotografia Fine Art sobre papel algodão</p>
            <p>Dimensão: 50x75cm</p>
            <p>Número da Cópia: 1/10</p>
            <p>Esta obra fotográfica faz parte de uma edição controlada e é acompanhada por este certificado assinado pelo autor.</p>
          </div>
          <button onClick={() => gerarCertificado(img)} disabled={certificando === img.id}>
            {certificando === img.id ? "Gerando..." : "Gerar Certificado"}
          </button>
        </div>
      ))}
    </div>
  );
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
