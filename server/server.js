import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pinsRoute from "./routes/pins.js";
import boardsRoute from "./routes/boards.js";



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


/*app.get("/", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});
*/

app.get("/api/status", (req, res) => {
  res.json({
    connected: true,
    message: "React is connected to Express!"
  });
});

app.use("/api/boards", boardsRoute);
app.use("/api/pins", pinsRoute);

// Serve the React build
const clientBuildPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientBuildPath));

app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});