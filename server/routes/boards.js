const express = require("express");
const router = express.Router();

const fakeBoards = require("../data/fakeBoards");

router.get("/", (req, res) => {
    res.json(fakeBoards);
});

module.exports = router;