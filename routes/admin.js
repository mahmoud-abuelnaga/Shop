// Packages
const multer = require("multer");
const express = require("express");

// Constants
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/png"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

// Controllers
const adminController = require("../controllers/admin");

// Validation
const { validProduct } = require("../validators/product");

// /admin/products => GET
router.get("/products", adminController.getProducts);

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProduct);

// /admin/add-product => POST
router.post(
    "/add-product",
    upload.single('image'),
    verifyToken,
    validProduct,
    adminController.postAddProduct
);

// /admin/edit-product/:id => GET
router.get("/edit-product/:id", adminController.getEditProduct);

// /admin/edit-product/:id => POST
router.post(
    "/edit-product/:id",
    upload.single('image'),
    verifyToken,
    validProduct,
    adminController.postEditProduct
);

// /admin/delet-product => POST
router.post("/delete-product/:id", verifyToken, adminController.deleteProduct);

module.exports = router;
