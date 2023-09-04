// NPM Packages
const Tokens = require("csrf");
const express = require("express");

// Utilites

// Constants
const tokens = new Tokens();

/**
 * Checks if user is logged in using his session.
 *
 * If the user is logged in `next()` is called passing the control to the next middleware, otherwise the user is redirected to the login page on '/login'.
 *
 * This middleware is mainly used with routes, that requires the user to be loggedin to perform the corresponding actions.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
module.exports.isLoggedIn = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
};

/**
 * Create CSRF Token using `req.session.secret` and set it under `res.locals.token`, to be used to embed a CSRF token in the forms.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
module.exports.getToken = (req, res, next) => {
        if (!req.session.secret) {
        tokens
            .secret()
            .then((secret) => {
                req.session.secret = secret;
                res.locals.token = tokens.create(req.session.secret);
                next();
            })
            .catch((err) => {
                res.redirect("/500");
            });
    } else {
        res.locals.token = tokens.create(req.session.secret);
        next();
    }
};

/**
 * Used to verify the CSRF token sent with the form as an input with the name `token` for either logged in whose secret is found in `req.session.secret` or non logged in user whose secret is expected to be found under `req.secret`.
 *
 * If the CSRF Token is valid, the middleware passes control to the next middleware, otherwise the user is redirect to `/authentication-error`.
 *
 * The function is mainly used to verify that the page is rendered using my server before proceeding in changing data related to the user, which help preventing CSRF Attacks.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
module.exports.verifyToken = (req, res, next) => {
    const secret = req.session.secret;
    let token = req.body.token;
    if (!token) {
        token = req.headers.token;
    }

    const verified = tokens.verify(secret, token);
    if (verified) {
        next();
    } else {
        res.redirect("/authentication-error");
    }
};
