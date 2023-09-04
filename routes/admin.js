// Packages
const multer = require("multer");
const express = require("express");

// Constants


const upload = multer({
    dest: "public/images",
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

router.route("/products")
.get(adminController.getProducts)

router.delete("/products/:id", verifyToken, adminController.deleteProduct);

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



module.exports = router;
