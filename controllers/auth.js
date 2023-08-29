// Models
const User = require("../models/user");

// NPM Packages
const bcrypt = require("bcryptjs");
const Tokens = require("csrf");

// Constants
const SALT = 4;
const tokens = new Tokens(); // Used to CSRF Tokens generation

// Utilites
const { sendTextMail } = require("../util/mail");

// Controller

module.exports.getLogin = (req, res, next) => {
    tokens.secret().then((secret) => {
        req.flash("secret", secret);
        res.locals.token = tokens.create(secret);
        const errorMessage = req.flash("error")[0];
        res.render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            userExists: req.query.notice,
            errorMessage,
        });
    });
};

module.exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let user;

    User.findOne({ email })
        .then((usr) => {
            if (usr) {
                user = usr;
                return bcrypt.compare(password, user.password);
            } else {
                req.flash("error", "Invalid Email or Password");
                res.redirect("/login");
            }
        })
        .then((matched) => {
            if (matched) {
                req.session.loggedIn = true;
                req.session.userId = user._id;
                return tokens.secret();
            } else {
                try {
                    req.flash("error", "Invalid Email or Password");
                    res.redirect("/login");
                } catch (err) {
                    // Nothing
                }
            }
        })
        .then((secret) => {
            if (secret) {
                req.session.secret = secret;
                res.redirect("/");
            }
        })
        .then(() => {
            // sendTextMail(
            //     "abuelnaga.m0@gmail.com",
            //     "New Login",
            //     "Someone just logged in",
            //     (err, info) => {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             console.log(info);
            //         }
            //     }
            // );
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports.logout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

module.exports.getSignup = (req, res, next) => {
    tokens.secret().then((secret) => {
        const errorMessage = req.flash("error")[0];
        res.locals.token = tokens.create(secret);
        req.flash('secret', secret);
        res.render("auth/signup", {
            path: "/signup",
            pageTitle: "Signup",
            errorMessage,
        });
    });
};

module.exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email })
        .then((user) => {
            // console.log(user);
            if (user) {
                req.flash("error", "This user already exists");
                res.redirect("/signup");
            } else {
                return bcrypt.hash(password, SALT);
            }
        })
        .then((password) => {
            if (password) {
                return User.create({ name, email, password });
            }
        })
        .then((user) => {
            if (user) {
                console.log("New User was created");
                res.redirect("/login");
            }
        });
};

exports.getResetPass = (req, res, next) => {
    const errorMessage = req.flash("error")[0];
    res.render("auth/resetPass", {
        path: "/reset-pass",
        pageTitle: "Reset Password",
        errorMessage,
    });
};

exports.postResetPass = (req, res, next) => {
    const email = req.body.email;
    User.findOne({ email }).then((user) => {
        if (user) {
            
        } else {
            req.flash("error", "This email doesn't exist");
            res.redirect("/reset-pass");
        }
    });
};
