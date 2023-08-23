// NPM Packages
const express = require('express');

// Controllers
const errorController = require('../controllers/error');

// Routes
const router = express.Router();

router.get('/404', errorController.get404);

router.get('/create-product-error', errorController.getErrorCreatingProduct);

module.exports = router;