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
 * If the user is logged in, a CSRF token is created with his session `secret` key & set as a local variable in `res.locals.token`, to be used to embed a CSRF token in the forms.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
module.exports.getAuthToken = (req, res, next) => {
    if (req.session.loggedIn) {
        res.locals.token = tokens.create(req.session.secret);
    }

    next();
};

/**
 * If the user isn't logged in, a secret is created to create a CSRF token. The CSRF Token is available using `res.locals.token`. 
 *
 * The secret used to create the CSRF token is then flashed using: `req.flash('secret', <secretKey>)` to be used in the next request to verify the CSRF token.
 * 
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
module.exports.getUnAuthToken = (req, res, next) => {
    if (!req.session.loggedIn) {
        tokens.secret().then((secret) => {
            res.locals.token = tokens.create(secret);
            req.flash("secret", secret);
            next();
        });
    } else {
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
    let secret;
    if (req.session.loggedIn) {
        secret = req.session.secret;
    } else {
        secret = req.secret;
    }

    const verified = tokens.verify(secret, req.body.token);
    if (verified) {
        next();
    } else {
        res.redirect("/authentication-error");
    }
};

/**
 * The function get the flash secret using `req.flash('secret', <secretKey>)` and set it under `req.secret`. The works the function `getUnAuthToken` (which is used to create a CSRF Token & flash its secret for non logged in user) & `verifyToken` (which is use to verify the token using the secret under `req.secret` for non logged in user).
 * 
 * 
 * 
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
module.exports.getUnAuthSecret = (req, res, next) => {
    if (!req.session.loggedIn) {
        req.secret = req.flash("secret")[0];
    }
    next();
};
