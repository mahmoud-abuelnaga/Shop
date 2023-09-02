// Models
const User = require("../models/user");

// Core Modules

// NPM Packages
const { validationResult } = require("express-validator");

// Constants


// Utilites

// Controller

module.exports.getLogin = (req, res, next) => {
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        userExists: req.query.notice,
        errorMessage: null,
        oldInput: {},
        errors: {},
    });
};

module.exports.postLogin = (req, res, next) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        req.session.loggedIn = true;
        req.session.userId = req.user._id;
        res.redirect("/");
    } else {
        const errorMessage = result.mapped().email.msg;
        res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            userExists: req.query.notice,
            oldInput: {
                email: req.body.email,
                password: req.body.password,
            },
            errorMessage: errorMessage,
        });
    }
};

module.exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
};

module.exports.getSignup = (req, res, next) => {
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: null,
        oldInput: {},
        errors: {},
    });
};

module.exports.postSignup = (req, res, next) => {
    const result = validationResult(req);
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (result.isEmpty()) {
        User.create({ name, email, password })
            .then((user) => {
                if (user) {
                    console.log("New User was created");
                    res.redirect("/login");
                }
            })
            .catch((err) => {
                res.redirect("/500");
            });
    } else {
        const errors = result.mapped();
        res.status(422).render("auth/signup", {
            path: "/signup",
            pageTitle: "Signup",
            oldInput: {
                name,
                email,
                password,
                confirmPassword,
            },
            errors,
        });
    }
};

exports.getResetPass = (req, res, next) => {
    if (req.query.emailSent == "true") {
        res.render("messages/resetPass", {
            path: "/reset-pass",
            pageTitle: "Email Sent",
        });
    } else {
        res.render("auth/resetPass", {
            path: "/reset-pass",
            pageTitle: "Reset Password",
            errorMessage: null,
        });
    }
};

exports.postResetPass = (req, res, next) => {
    const errors = validationResult(req).array();

    if (errors.length == 0) {
        req.user.sendResetPassEmail();
        res.redirect("reset-pass?emailSent=true");
    } else {
        const errorMessage = errors[0].msg;
        res.status(422).render("auth/resetPass", {
            path: "/reset-pass",
            pageTitle: "Reset Password",
            errorMessage,
        });
    }
};

exports.getEditPass = (req, res, next) => {
    const resetToken = req.params.resetToken;

    const renderResetPass = () => {
        res.render("auth/resettingPass", {
            path: "/reset-pass",
            pageTitle: "Resetting Password",
            resetToken,
            errorMessage: null,
        });
    };

    const errors = validationResult(req);
    if (errors.isEmpty()) {
        renderResetPass();
    } else {
        res.status(403).render("messages/tokenExpire", {
            path: "/reset-pass",
            pageTitle: "Token Expired",
        });
    }
};

// Check if you check for the password in signup
exports.postEditPass = (req, res, next) => {
    const resetToken = req.params.resetToken;
    const password = req.body.password;
    const confirmPass = req.body.confirmPassword;
    const errors = validationResult(req).array();

    const renderResetPass = () => {
        const errorMessage = errors[0].msg;
        res.status(422).render("auth/resettingPass", {
            path: "/reset-pass",
            pageTitle: "Resetting Password",
            resetToken,
            errorMessage: errorMessage,
        });
    };

    if (errors.length == 0) {
        req.user.password = password;
        req.user.resetToken = null;
        req.user.resetTokenExpiration = null;
        req.user
            .save()
            .then((result) => {
                res.redirect("/login");
            })
            .catch((err) => {
                res.redirect("/500");
            });
    } else {
        const error = errors[0];
        if (error.path == "resetToken") {
            res.status(401).render("messages/tokenExpire", {
                path: "/reset-pass",
                pageTitle: "Token Expired",
            });
        } else {
            renderResetPass();
        }
    }
};
