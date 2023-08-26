// NPM Packages
const express = require('express');

// Controllers
const authControllers = require('../controllers/auth');


const router = express.Router();

router.get('/login', authControllers.getLogin);
router.post('/login', authControllers.postLogin);

module.exports = router;