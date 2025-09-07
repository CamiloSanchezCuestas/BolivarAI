import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Detectar ruta actual (por módulos ES)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sirve el HTML y archivos estáticos desde la misma carpeta
app.use(express.static(__dirname));

// Endpoint de chat
app.post("/api/chat", async (req, res) => {
  const prompt = req.body.prompt || "";
  if (!prompt.trim()) return res.status(400).json({ error: "Prompt vacío" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // o gpt-4o / gpt-4.1 según lo que prefieras
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: "Error de OpenAI", details: text });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "(sin respuesta)";
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
});

// Inicia servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});



