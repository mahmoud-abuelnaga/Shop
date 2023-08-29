// Models
const User = require("../models/user");

// Core Modules


// NPM Packages
const bcrypt = require("bcryptjs");
const Tokens = require("csrf");

// Constants
const SALT = 4;
const tokens = new Tokens(); // Used to CSRF Tokens generation

// Utilites

// Controller

module.exports.getLogin = (req, res, next) => {
    const errorMessage = req.flash("error")[0];
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        userExists: req.query.notice,
        errorMessage,
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
    const errorMessage = req.flash("error")[0];
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage,
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
                return User.create({ name, email, password });
            }
        })
        .then((user) => {
            if (user) {
                console.log("New User was created");
                res.redirect("/login");
            }
        })
        .catch(err => {
            console.log(err);
            res.redirect('/signup');
        });
};

exports.getResetPass = (req, res, next) => {
    if (req.query.emailSent == "true") {
        res.render("messages/resetPass", {
            path: "/reset-pass",
            pageTitle: "Email Sent",
        });
    } else {
        const errorMessage = req.flash("error")[0];
        res.render("auth/resetPass", {
            path: "/reset-pass",
            pageTitle: "Reset Password",
            errorMessage,
        });
    }
};

exports.postResetPass = (req, res, next) => {
    const email = req.body.email;
    User.findOne({ email }).then((user) => {
        if (user) {
            user.sendResetPassEmail();
            res.redirect("reset-pass?emailSent=true");
        } else {
            req.flash("error", "This email doesn't exist");
            res.redirect("/reset-pass");
        }
    });
};

exports.getEditPass = (req, res, next) => {
    const resetToken = req.params.resetToken;

    const renderResetPass = () => {
        const errorMessage = req.flash('error')[0];
        res.render("auth/resettingPass", {
            path: "/reset-pass",
            pageTitle: "Resetting Password",
            resetToken,
            errorMessage,
        });
    }

    User.findOne({resetToken, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        if (user) {
            renderResetPass();
        } else {
            res.render('messages/tokenExpire', {
                path: '/reset-pass',
                pageTitle: 'Token Expired',
            });
        }
    })
};

// Check if you check for the password in signup
exports.postEditPass= (req, res, next) => {
    const resetToken = req.params.resetToken;
    const password = req.body.pass;
    const confirmPass = req.body.confirmPass;

    User.findOne({resetToken})
    .then(user => {
        if (user) {
            if (password != confirmPass) {
                req.flash('error', "The confirmed password doesn't match the password");
                res.redirect(`/edit-pass/${resetToken}`);
            } else {
                user.password = password;
                user.resetToken = null;
                user.resetTokenExpiration = null;
                user.save();
                res.redirect('/login');
            }
        } else {
            res.render('messages/tokenExpire', {
                path: '/reset-pass',
                pageTitle: 'Token Expired',
            });
        }
    });
    
}