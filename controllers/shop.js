// Models
const Product = require('../models/product');

// Controllers
const errorControllers = require('./error');


exports.getProducts = (req, res, next) => {
    Product.getAll()
    .then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    });
    
};

exports.getIndex = (req, res, next) => {
    Product.getAll()
    .then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    });
};

exports.getProductDetails = (req, res, next) => {
    const productId = req.params.id;
    Product.getById(productId)
    .then(product => {
        product = product[0];
        if (product) {
            res.render('shop/product-detail', { pageTitle: product.title, product, path: '/products' });
        } else {
            errorControllers.get404(req, res, next);
        }
        
    });
}


exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then(cartProducts => {
        res.render('shop/cart', {
            products: cartProducts,
            pageTitle: 'Your Cart',
            path: '/cart',
        });
    })
    
};

exports.updateCart = (req, res, next) => {
    const action = req.query.action;
    let promise;
    if (action == 'add') {
        promise = req.user.addToCart(req.body.id);
    } else if (action == 'delete') {
        promise = req.user.removeFromCart(req.body.id);
    }
    
    promise.then(result => {
        console.log(result);
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(err);
    })
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
    .then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders,
        });
    })
    .catch(err => {
        console.log(err);
    })
    
};

exports.createOrder = (req, res, next) => {
    req.user.createOrder()
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => {
        console.log(err);
    });
    
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};



