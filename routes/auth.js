// NPM Packages
const express = require("express");

// Controllers
const authController = require("../controllers/auth");
const { verifyToken, getUnAuthToken, isLoggedIn } = require("../middlewares/auth");

const router = express.Router();

router
    .route("/login")
    .get(authController.getLogin)
    .post(verifyToken, authController.postLogin);

router.post("/logout", isLoggedIn, verifyToken, authController.logout);

router
    .route("/signup")
    .get(authController.getSignup)
    .post(verifyToken, authController.postSignup);

router
    .route("/reset-pass")
    .get(authController.getResetPass)
    .post(verifyToken, authController.postResetPass);

router
    .route("/edit-pass/:resetToken")
    .get(authController.getEditPass)
    .post(verifyToken, authController.postEditPass);

module.exports = router;
