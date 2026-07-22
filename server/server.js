const express = require("express");
const cors = require("cors");

const boardsRoute = require("./routes/boards");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
    res.json({
        connected: true,
        message: "React is connected!"
    });
});

app.use("/api/boards", boardsRoute);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});