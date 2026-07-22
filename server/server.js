import express from "express";
import cors from "cors";
import pinsRoute from "./routes/pins.js";
import boardsRoute from "./routes/boards.js";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    connected: true,
    message: "React is connected to Express!"
  });
});

app.use("/api/boards", boardsRoute);
app.use("/api/pins", pinsRoute);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});