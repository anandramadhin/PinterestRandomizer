import express from "express";
import fakeBoards from "../data/fakeBoards.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(fakeBoards);
});

export default router;