const refreshController = require("../controllers/refreshController");

// express Router
const express = require("express");
const router = express.Router();

router.get("/", refreshController);

module.exports = router;
