// Utilites
const path = require('path');

// NPM Packages
const express = require('express');

// Controllers
const shopController = require('../controllers/shop');
const {isLoggedIn} = require('../controllers/auth');

// Routes
const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:id', shopController.getProductDetails);  // Adding dynamic route

router.get('/cart', isLoggedIn, shopController.getCart);

router.post('/cart', isLoggedIn, shopController.updateCart)

router.get('/orders', isLoggedIn, shopController.getOrders);

router.post('/create-order', isLoggedIn, shopController.createOrder);

router.get('/checkout', isLoggedIn, shopController.getCheckout);

module.exports = router;
