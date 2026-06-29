import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini client to avoid startup crashes if key is missing
  let aiClient: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY is not configured. Please add your Gemini API Key in Settings > Secrets.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API Route: Search Smartphone Resolution using Gemini AI
  app.post("/api/search-resolution", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ error: "검색어를 입력해주세요." });
      }

      console.log(`[AI Search] Querying resolution for: ${query}`);

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Find the official precise screen specification for this smartphone model: "${query.trim()}". Return the response strictly matching the schema. If it's a generic query like "Galaxy S24", find specs of the base model. If the device is not found or is ambiguous, do your best to guess/provide the closest standard real model.`,
        config: {
          systemInstruction: "You are an expert mobile hardware specifications finder. You retrieve screen size, resolution width, height, aspect ratio, notch type (notch, dynamic-island, punch-hole, none) and ppi for any mobile device requested.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["id", "name", "width", "height", "aspectRatio", "screenSize", "notchType", "ppi"],
            properties: {
              id: {
                type: Type.STRING,
                description: "Unique url-safe slug kebab-case identifier, starting with 'search-', e.g., 'search-galaxy-note-20-ultra'"
              },
              name: {
                type: Type.STRING,
                description: "Clean public model display name, e.g., 'Galaxy Note 20 Ultra' or 'Xiaomi 13 Pro'"
              },
              width: {
                type: Type.INTEGER,
                description: "Screen physical resolution width in pixels (e.g., 1440 or 1080)"
              },
              height: {
                type: Type.INTEGER,
                description: "Screen physical resolution height in pixels (e.g., 3088 or 2400)"
              },
              aspectRatio: {
                type: Type.STRING,
                description: "Aspect ratio string, e.g., '19.3:9', '19.5:9', '20:9'"
              },
              screenSize: {
                type: Type.STRING,
                description: "Screen diagonal size with unit, e.g., '6.9\"', '6.7\"', '6.3\"'"
              },
              notchType: {
                type: Type.STRING,
                description: " cutout type. Must be exactly one of: 'notch', 'dynamic-island', 'punch-hole', 'none'"
              },
              ppi: {
                type: Type.INTEGER,
                description: "Pixels-per-inch density, e.g., 496, 515, 460"
              }
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini API returned an empty response.");
      }

      const specs = JSON.parse(responseText.trim());
      console.log(`[AI Search] Successfully resolved specs:`, specs);
      res.json(specs);
    } catch (error: any) {
      console.error("[AI Search] Error during resolution search:", error);
      res.status(500).json({ error: error.message || "스마트폰 스펙을 조회하는 도중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
