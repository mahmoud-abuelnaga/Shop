// NPM Packages
const express = require("express");

// Validators
const authValidator = require('../validators/auth');

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
    .post(verifyToken, [authValidator.validName, authValidator.validSignUpEmail, authValidator.validPasssword, authValidator.validConfirmPassword], authController.postSignup);

router
    .route("/reset-pass")
    .get(authController.getResetPass)
    .post(verifyToken, authController.postResetPass);

router
    .route("/edit-pass/:resetToken")
    .get(authController.getEditPass)
    .post(verifyToken, [authValidator.validPasssword, authValidator.validConfirmPassword], authController.postEditPass);

module.exports = router;
