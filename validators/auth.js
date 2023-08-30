// Packages
const { body, param } = require("express-validator");

// Models
const User = require("../models/user");

/**
 * Checks if the `name` field is valid. The `name` field is valid if:
 *
 * - It's not empty;
 */
exports.validName = body("name", 'Invalid Name').notEmpty({
    ignore_whitespace: true,
});

/**
 * Checks if the form `email` input is valid. Email is valid if:
 *
 * - No such email in the database
 * - Email is in valid format
 */
exports.validSignUpEmail = body("email", "Please enter a valid email")
    .isEmail()
    .custom((email) => {
        return User.findOne({ email }).then((user) => {
            if (user) {
                return Promise.reject("This email already exists");
            }
        });
    });

/**
 * Checks if the form `password` input is valid. Password is valid if:
 *
 * - Password length is between 7 & 35
 */
exports.validPasssword = body(
    "password",
    "Please enter a valid password whose length is between 5 & 35"
).isLength({
    min: 5,
    max: 35,
});

/**
 * Check if the `confirmPassword` input is valid. Confirmed Password is valid if:
 *
 * - `confirmPassword` matches the `password` field
 */
exports.validConfirmPassword = body("confirmPassword").custom(
    (confirmPassword, { req }) => {
        if (confirmPassword != req.body.password) {
            throw new Error(
                "The confirmed password doesn't match the password."
            );
        } else {
            return true;
        }
    }
);

/**
 * Checks if the login email & password is valid. If the login email is valid, the user with the valid credentials is found under: `req.user`,
 * otherwise you can get errors using `validationResult(req)`
 */
exports.validLoginParams = body("email", "Invalid email or password")
    .notEmpty({
        ignore_whitespace: true,
    })
    .custom((email, { req }) => {
        return User.findOne({ email }).then((user) => {
            if (user) {
                return user.validPassword(req.body.password).then((valid) => {
                    if (!valid) {
                        return Promise.reject();
                    } else {
                        req.user = user;
                    }
                });
            } else {
                return Promise.reject();
            }
        });
    });

/**
 * Checks if the login email is valid. If the login email is valid, the user with the valid credentials is found under: `req.user`,
 * otherwise you can get errors using `validationResult(req)`
 */
exports.validLoginEmail = body("email", "Invalid email")
    .notEmpty({
        ignore_whitespace: true,
    })
    .custom((email, { req }) => {
        return User.findOne({ email }).then((user) => {
            if (!user) {
                return Promise.reject();
            } else {
                req.user = user;
            }
        });
    });

/**
 * Checks if the reset password token is valid. If the token is valid, the user with the valid token is found under: `req.user`,
 * otherwise you can get errors using `validationResult(req)`
 */    
exports.validResetToken = param("resetToken").custom((resetToken, { req }) => {
    return User.findOne({
        resetToken,
        resetTokenExpiration: { $gt: Date.now() },
    }).then((user) => {
        if (!user) {
            return Promise.reject();
        } else {
            req.user = user;
        }
    });
});
