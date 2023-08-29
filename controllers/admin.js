// Core Modules

// Models
const {Product} = require('../models/product');

// Controllers
const errorControllers = require('./error');

// Modules
const express = require('express');

// Utilites


// Helpers


// Constants 

/**
 * Renders a form to add a product to the database on this route: '/admin/add-product'
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
    });
};

/**
 * Adds the product which is submitted in '/admin/add-product' form to the database. After the product is added, the user is redirected to '/admin/products' to see the product.
 * 
 * If the function fails to add the product to the database, the user is redirected to '/404' page
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = parseFloat(req.body.price);
    const description = req.body.description;

    // Create a new product & save it to the database
    const product = new Product({title, price, description, imageUrl, sellerId: req.user._id});
    product.save()
    .then(result => {
        // console.log(result);
        res.redirect('/admin/products')
    })
    .catch(err => {
        console.log(err);
        res.redirect('/404');
    });
};

/**
 * Shows all the available products in '/admin/products' route
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.getProducts = (req, res, next) => {
    req.user.getOwnedProducts()
    .then(products => {
        res.render('admin/products', {
            path: '/admin/products',
            pageTitle: 'Admin Products',
            prods: products,
            userId: req.user._id,
        });
    })
    .catch(err => {
        console.log(err);
    });
    
};

/**
 * Renders a form to edit a product on this route: '/admin/edit-product/:id'. It works by providing the productId for the product you want to edit in the route 
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.getEditProduct = (req, res, next) => {
    Product.findOne({_id: req.params.id, sellerId: req.user._id})
    .then(product => {
        if (!product) {
            errorControllers.get404(req, res, next);
        } else {
            res.render('admin/edit-product', {
                pageTitle: `Edit: ${product.title}`,
                path: `/admin/edit-product/${product._id}`,
                product,
            });
        }

    });
}

/**
 * Submit the the changes in the edit product form on this route: '/admin/edit-product/:id' to the database, then redirects the user to: '/admin/products'.
 * 
 * If editing the product failed in the database, the user is redirected to: '/404'
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.postEditProduct = (req, res, next) => {
    const idToUpdate = req.params.id;
    const productData = {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        price: parseFloat(req.body.price),
    };

    Product.updateOne({_id: idToUpdate, sellerId: req.user._id}, productData)
    .then(result => {
        console.log('....Product Updated....');
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
        res.redirect('/404');
    });
    
}
/**
 * Deletes a product from the database using the id provided in this route: '/delete-product/:id'
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.deleteProduct = (req, res, next) => {
    Product.deleteOne({_id: req.params.id, sellerId: req.user._id})
    .then(result => {
        console.log('....Deleted Product from products collection....');
        return Product.removeFromCarts(req.params.id);
    })
    .then(result => {
        console.log('....Deleted product form users cart....');
        // console.log(result);
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
        res.redirect('/404');
    });
}