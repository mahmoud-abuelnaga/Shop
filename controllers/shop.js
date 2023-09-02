// Models
const { Product } = require("../models/product");
const Order = require("../models/order");

// Packages
const PDFDocument = require("pdfkit");

// Controllers
const errorControllers = require("./error");

exports.getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render("shop/product-list", {
                prods: products,
                pageTitle: "All Products",
                path: "/products",
            });
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render("shop/index", {
                prods: products,
                pageTitle: "Shop",
                path: "/",
            });
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.getProductDetails = (req, res, next) => {
    Product.findById(req.params.id)
        .then((product) => {
            if (product) {
                res.render("shop/product-detail", {
                    pageTitle: product.title,
                    product,
                    path: "/products",
                });
            } else {
                errorControllers.get404(req, res, next);
            }
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(({ products }) => {
            res.render("shop/cart", {
                products,
                pageTitle: "Your Cart",
                path: "/cart",
            });
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.updateCart = (req, res, next) => {
    const action = req.query.action;
    let promise;
    if (action == "add") {
        promise = req.user.addToCart(req.body.id);
    } else if (action == "delete") {
        promise = req.user.removeFromCart(req.body.id);
    }

    promise
        .then((result) => {
            // console.log(result);
            res.redirect("/cart");
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then((orders) => {
            res.render("shop/orders", {
                path: "/orders",
                pageTitle: "Your Orders",
                orders,
            });
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.createOrder = (req, res, next) => {
    req.user
        .createOrder()
        .then((result) => {
            console.log(result);
            res.redirect("/orders");
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
    });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findOne({ _id: orderId, userId: req.user._id })
        .then((order) => {
            if (order) {
                const doc = new PDFDocument();
                doc.pipe(res); // Pipe what is written in document to the response

                doc.fontSize(20).text(`Order #${orderId}`);
                doc.moveDown();
                doc.fontSize(17).text("Products:");
                for (const product of order.products) {
                    doc.fontSize(14).text(
                        `${product.title} (${product.quantity} x $${product.price})`
                    );
                }
                doc.moveDown();
                doc.fontSize(17).text(`Total Price: $${order.totalPrice}`);

                doc.end();
            } else {
                res.redirect("/404");
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/500");
        });
};
