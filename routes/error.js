// NPM Packages
const express = require("express");

// Controllers
const errorController = require("../controllers/error");

// Routes
const router = express.Router();

router.get("/404", errorController.get404);

router.get("/500", errorController.get500);

router.get("/authentication-error", errorController.getAuthenitcationError);

module.exports = router;
