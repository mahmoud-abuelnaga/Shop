// Packages
const path = require('path');
const express = require('express');

// Controllers
const adminController = require('../controllers/admin');

// Constants
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');

// Validation
const {validProduct} = require('../validators/admin');

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', verifyToken, validProduct, adminController.postAddProduct);

// /admin/edit-product/:id => GET
router.get('/edit-product/:id', adminController.getEditProduct);

// /admin/edit-product/:id => POST
router.post('/edit-product/:id', verifyToken, validProduct, adminController.postEditProduct);

// /admin/delet-product => POST
router.post('/delete-product/:id', verifyToken, adminController.deleteProduct);

module.exports = router;
