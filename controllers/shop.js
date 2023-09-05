// Models
const { Product } = require("../models/product");
const Order = require("../models/order");

// Packages
const PDFDocument = require("pdfkit");

// Controllers
const errorControllers = require("./error");

// Constants
const { productsPerPage } = require("../util/globalVars");

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;

    Product.count()
        .then((noOfProducts) => {
            const lastPage = Math.ceil(noOfProducts / productsPerPage);
            if (page < 1 || (page > lastPage && lastPage != 0)) {
                errorControllers.get404(req, res, next);
            } else {
                Product.find()
                    .skip((page - 1) * productsPerPage)
                    .limit(productsPerPage)
                    .then((products) => {
                        res.render("shop/index", {
                            prods: products,
                            pageTitle: "Shop",
                            path: "/",
                            currentPage: page,
                            lastPage,
                        });
                    });
            }
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;

    Product.count()
        .then((noOfProducts) => {
            const lastPage = Math.ceil(noOfProducts / productsPerPage);
            if (page < 1 || (page > lastPage && lastPage != 0)) {
                errorControllers.get404(req, res, next);
            } else {
                Product.find()
                    .skip((page - 1) * productsPerPage)
                    .limit(productsPerPage)
                    .then((products) => {
                        res.render("shop/product-list", {
                            prods: products,
                            pageTitle: "All Products",
                            path: "/products",
                            currentPage: page,
                            lastPage,
                        });
                    });
            }
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

exports.updateCart = async (req, res, next) => {
    const action = req.query.action;
    try {
        if (action == "add") {
            await req.user.addToCart(req.body.id);
        } else if (action == "delete") {
            await req.user.removeFromCart(req.body.id);
        }
    } catch (err) {
        console.log(err);
        return res.redirect("/500");
    }

    return res.redirect("/cart");
};

exports.getCart = async (req, res, next) => {
    let products, totalPrice;
    try {
        ({ products, totalPrice } = await req.user.getCart());
    } catch (err) {
        console.log(err);
        return res.redirect("/500");
    }

    return res.render("shop/cart", {
        products,
        pageTitle: "Your Cart",
        path: "/cart",
        totalPrice,
    });
};

exports.getCheckout = async (req, res, next) => {
    let products, totalPrice;
    try {
        ({ products, totalPrice } = await req.user.getCart());
    } catch (err) {
        console.log(err);
        res.redirect("/500");
    }

    res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products,
        totalPrice,
    });
};

exports.createOrder = async (req, res, next) => {
    try {
        const result = await req.user.createOrder();
        console.log(result);
        res.redirect("/orders");
    } catch (err) {
        console.log(err);
    }
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