// Protótipo completo: App do Cliente + Painel Administrativo do Fotógrafo (com upload e certificado)

import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import * as exifr from "exifr";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const supabase = createClient(
  "https://xswytgkswrtteflowxap.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzd3l0Z2tzd3J0dGVmbG93eGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5OTg3NTEsImV4cCI6MjA2MzU3NDc1MX0.12NbfT5UPCvcOOtYXhRRmjoGkbqkO9Qb4RbGoVZxCrY"
);

function Certificado({ imagem, titulo, dataOriginal, onClose }) {
  const certRef = useRef();

  const gerarPDF = async () => {
    const canvas = await html2canvas(certRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`certificado_${titulo.replaceAll(" ", "_")}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[210mm] h-[297mm] overflow-auto" ref={certRef}>
        <h1 className="text-xl font-bold mb-4">Certificado de Autenticidade</h1>
        <img src={imagem} alt="Obra" className="w-1/2 mb-4 border" />
        <p><strong>Título:</strong> {titulo}</p>
        <p><strong>Data da Tomada:</strong> {dataOriginal}</p>
        <p><strong>Técnica:</strong> Fotografia Fine Art sobre papel algodão</p>
        <p><strong>Dimensão:</strong> 50x75cm</p>
        <p><strong>Número da Cópia:</strong> 1/10</p>
        <p className="mt-6 text-sm">
          Esta obra fotográfica faz parte de uma edição controlada e é acompanhada por este certificado assinado pelo autor.
        </p>
        <div className="mt-4 flex gap-4">
          <button onClick={gerarPDF} className="bg-black text-white px-4 py-2 rounded">
            Baixar PDF
          </button>
          <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function ListaImagens() {
  const [imagens, setImagens] = useState([]);
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    const fetchImagens = async () => {
      const { data, error } = await supabase.from("imagens").select("*").order("created_at", { ascending: false });
      if (error) console.error("Erro ao buscar imagens:", error);
      else setImagens(data);
    };
    fetchImagens();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Imagens Cadastradas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imagens.map((img) => (
          <div key={img.codigo} className="border p-4 rounded shadow">
            <img src={img.url} alt={img.nome} className="w-full mb-2 rounded" />
            <p><strong>Nome:</strong> {img.nome}</p>
            <p><strong>Código:</strong> {img.codigo}</p>
            <p><strong>Série:</strong> {img.serie}</p>
            <p><strong>Data Original:</strong> {img.data_original}</p>
            <button
              onClick={() => setCertData(img)}
              className="text-blue-600 mt-2 inline-block"
            >
              Gerar Certificado
            </button>
          </div>
        ))}
      </div>

      {certData && (
        <Certificado
          imagem={certData.url}
          titulo={`${certData.serie} - ${certData.codigo}`}
          dataOriginal={certData.data_original}
          onClose={() => setCertData(null)}
        />
      )}
    </div>
  );
}

function UploadImagem() {
  const [imagens, setImagens] = useState([]);
  const [serie, setSerie] = useState("Série Teste");
  const [mensagem, setMensagem] = useState("");

  const handleUpload = async (event) => {
    setMensagem("");
    const files = Array.from(event.target.files);

    const processadas = await Promise.all(
      files.map(async (file, index) => {
        try {
          const exif = await exifr.parse(file).catch(() => ({}));
          const nomeBase = file.name.split(".")[0].toUpperCase();
          const timestamp = Date.now();
          const codigo = `IMG-${timestamp}-${index}`;

          const { error: uploadError } = await supabase.storage
            .from("imagens")
            .upload(`${codigo}.jpg`, file);

          if (uploadError) {
            console.error("Erro no upload:", uploadError);
            setMensagem("Erro ao enviar imagem para o storage.");
            return null;
          }

          const { publicURL } = supabase.storage.from("imagens").getPublicUrl(`${codigo}.jpg`);

          const { error: insertError } = await supabase.from("imagens").insert({
            nome: nomeBase,
            codigo,
            url: publicURL,
            data_original: exif?.DateTimeOriginal || "Desconhecida",
            camera: exif?.Model || "Desconhecida",
            lente: exif?.LensModel || "Desconhecida",
            serie: serie
          });

          if (insertError) {
            console.error("Erro ao inserir na tabela:", insertError);
            setMensagem("Upload salvo no storage, mas falhou ao gravar na tabela.");
            return null;
          }

          setMensagem("Imagem enviada e salva com sucesso.");

          return {
            nome: nomeBase,
            codigo,
            url: publicURL
          };
        } catch (e) {
          console.error("Erro geral:", e);
          setMensagem("Erro inesperado durante o upload.");
          return null;
        }
      })
    );

    setImagens(processadas.filter(Boolean));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload de Imagens</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Nome da Série</label>
        <input
          type="text"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="border p-2 rounded w-full max-w-md"
        />
      </div>

      <input type="file" multiple onChange={handleUpload} className="mb-4" />

      {mensagem && <p className="mb-4 text-sm text-blue-600">{mensagem}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imagens.map((img) => (
          <div key={img.codigo} className="border p-4 rounded">
            <img src={img.url} alt={img.nome} className="w-full mb-2" />
            <p><strong>Nome:</strong> {img.nome}</p>
            <p><strong>Código:</strong> {img.codigo}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/imagens" element={<ListaImagens />} />
        <Route path="/admin/upload" element={<UploadImagem />} />
      </Routes>
    </Router>
  );
}