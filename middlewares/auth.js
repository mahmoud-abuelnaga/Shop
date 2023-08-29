// NPM Packages
const Tokens = require('csrf');

// Utilites

// Constants
const tokens = new Tokens();

module.exports.isLoggedIn = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports.embedToken = (req, res, next) => {
    if (req.session.loggedIn) {
        res.locals.token = tokens.create(req.session.secret);
    }
    
    next();
}

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
        res.redirect('/authentication-error');
    }
}

module.exports.getPendingSecret = (req, res, next) => {
    req.secret = req.flash('secret')[0];
    next();
}