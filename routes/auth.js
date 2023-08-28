// NPM Packages
const express = require('express');

// Controllers
const authController = require('../controllers/auth');
const { verifyToken } = require('../middlewares/auth');


const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', verifyToken, authController.postLogin);
router.post('/logout', verifyToken, authController.logout);
router.get('/signup', authController.getSignup);
router.post('/signup', verifyToken, authController.postSignup);

module.exports = router;