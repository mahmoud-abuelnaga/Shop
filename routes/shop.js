// Utilites
const path = require('path');

// NPM Packages
const express = require('express');

// Controllers
const shopController = require('../controllers/shop');
const errorController = require('../controllers/error');

// Routes
const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:id', shopController.getProductDetails);  // Adding dynamic route

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.updateCart)

router.get('/orders', shopController.getOrders);

router.post('/create-order', shopController.createOrder);

router.get('/checkout', shopController.getCheckout);

module.exports = router;
