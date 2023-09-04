// Core Modules
const fs = require("fs/promises");
const path = require("path");

// Models
const { Product } = require("../models/product");

// Controllers
const errorControllers = require("./error");

// Modules
const express = require("express");
const { validationResult } = require("express-validator");

// Utilites
const rootDir = require("../util/path");

// Helpers
const renderAddProduct = (res, errors = {}, oldInput = {}) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        errors,
        oldInput,
    });
};

const renderEditProduct = (res, product, errors = {}, oldInput = {}) => {
    res.render("admin/edit-product", {
        pageTitle: `Edit: ${product.title}`,
        path: `/admin/edit-product/${product._id}`,
        product,
        oldInput,
        errors,
    });
};

// Constants
const { productsPerPage } = require("../util/globalVars");

/**
 * Renders a form to add a product to the database on this route: '/admin/add-product'
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.getAddProduct = (req, res, next) => {
    renderAddProduct(res);
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
exports.postAddProduct = async (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const result = validationResult(req);

    if (result.isEmpty() && image) {
        // Create a new product & save it to the database
        let product = new Product({
            title,
            price,
            description,
            sellerId: req.user._id,
        });

        product = await product.save();
        const imageType = image.mimetype.split("/")[1];
        const imageName = product._id.toString() + "." + imageType;
        const fullImagePath = path.join(
            rootDir,
            "public",
            "images",
            imageName
        );
        product.imagePath = path.join("images", imageName);
        await product.save();
        await fs.rename(image.path, fullImagePath);
        res.redirect("/admin/products");
        
    } else {
        const errors = result.mapped();
        if (!image) {
            errors.image = {
                msg: "Image needs to be of type jpg, jpeg or png",
            };
        }

        const oldInput = {
            title,
            price,
            description,
        };

        renderAddProduct(res, errors, oldInput);
    }
};

/**
 * Shows all the available products in '/admin/products' route
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;

    req.user
        .countOwnedProducts()
        .then((noOfProducts) => {
            const lastPage = Math.ceil(noOfProducts / productsPerPage);
            if (page < 1 || (page > lastPage && lastPage != 0)) {
                errorControllers.get404(req, res, next);
            } else {
                req.user.getOwnedProducts(page).then((products) => {
                    res.render("admin/products", {
                        path: "/admin/products",
                        pageTitle: "Admin Products",
                        prods: products,
                        userId: req.user._id,
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

/**
 * Renders a form to edit a product on this route: '/admin/edit-product/:id'. It works by providing the productId for the product you want to edit in the route
 *
 * @param {express.Request} req
 * @param {express.Response} resonst product = new Product({
 * @param {express.NextFunction} next
 */
exports.getEditProduct = (req, res, next) => {
    Product.findOne({ _id: req.params.id, sellerId: req.user._id })
        .then((product) => {
            if (!product) {
                errorControllers.get404(req, res, next);
            } else {
                renderEditProduct(res, product);
            }
        })
        .catch((err) => {
            res.redirect("/500");
        });
};

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
    const product = {
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
    };
    const image = req.file;

    const result = validationResult(req);
    if (result.isEmpty()) {
        Product.findOneAndUpdate(
            { _id: idToUpdate, sellerId: req.user._id },
            product
        )
            .then((product) => {
                if (!product) {
                    return res.redirect("/404");
                }

                if (image) {
                    fs.rename(
                        image.path,
                        path.join(rootDir, "public", product.imagePath)
                    ).then((result) => {
                        res.redirect("/admin/products");
                    });
                } else {
                    res.redirect("/admin/products");
                }
            })
            .catch((err) => {
                res.redirect("/500");
            });
    } else {
        const errors = result.mapped();
        renderEditProduct(res, product, errors);
    }
};
/**
 * Deletes a product from the database using the id provided in this route: '/delete-product/:id'
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.deleteProduct = async (req, res, next) => {
    let product;
    try {
        product = await Product.findOneAndDelete({
            _id: req.params.id,
            sellerId: req.user._id,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Sever-Side Error",
        });
    }

    if (product) {
        const fullImagePath = path.join(rootDir, "public", product.imagePath);
        try {
            await fs.unlink(fullImagePath);
        } catch (err) {
            console.log(err);
        }

        try {           
            await Product.removeFromCarts(req.params.id);
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Sever-Side Error",
            });
        }

        return res.status(200).json({
            message: "Success!",
        });
    } else {
        return res.status(403).json({
            message: "Not Authorized",
        });
    }
};
