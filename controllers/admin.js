// Core Modules

// Models
const Product = require('../models/product');
const User = require('../models/user');

// Controllers
const errorControllers = require('./error');

// Utilites

// Constants 


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = parseFloat(req.body.price);
    const description = req.body.description;

    // Create a new product & save it to the database
    const product = new Product(title, price, description, imageUrl, req.user._id);
    product.save()
    .then(result => {
        console.log(result);
        res.redirect('/admin/products')
    })
    .catch(err => {
        console.log(err);
        res.redirect('/create-product-error');
    });
};

exports.getProducts = (req, res, next) => {
    Product.getAll()
    .then(products => {
        res.render('admin/products', {
            path: '/admin/products',
            pageTitle: 'Admin Products',
            prods: products,
        });
    })
    .catch(err => {
        console.log(err);
    });
    
};

exports.getEditProduct = (req, res, next) => {
    Product.getById(req.params.id)
    .then(product => {
        product = product[0];
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

exports.postEditProduct = (req, res, next) => {
    const idToUpdate = req.params.id;
    const product = {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
    }

    Product.updateById(idToUpdate, product)
    .then(result => {
        console.log('....Product Updated....');
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
        res.redirect('/create-product-error');
    });
    
}

exports.deleteProduct = (req, res, next) => {
    Product.deleteById(req.params.id)
    .then(result => {
        // console.log('....Deleted Product from products collection....');
        return User.removeFromAllCarts(req.params.id);
    })
    .then(result => {
        // console.log('....Deleted product form users cart....');
        // console.log(result);
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
        res.redirect('/create-product-error');
    });
}