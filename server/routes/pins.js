import express from "express";
import fakePins from "../data/fakePins.js";

const router = express.Router();

router.get("/", (req, res) => {
  const { boardId } = req.query;

  if (!boardId) {
    return res.status(400).json({
      message: "A boardId is required."
    });
  }

  const matchingPins = fakePins.filter(
    pin => pin.boardId === boardId
  );

  res.json(matchingPins);
});

export default router;