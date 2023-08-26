// NPM Packages
const express = require('express');

// Controllers
const authController = require('../controllers/auth');


const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.logout);

module.exports = router;