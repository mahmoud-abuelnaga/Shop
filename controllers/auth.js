// Models
const User = require('../models/user');

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        loggedIn: req.session.loggedIn,
    });
}

module.exports.postLogin = (req, res, next) => {
    User.findById('64e6d11afa247a09690d5dec')
    .then(user => {
        if (user) {
            req.session.loggedIn = true;    
            req.session.userId = user._id;
            req.session.save((err) => { // Make sure that the session is save before proceeding
                console.log(err);
                res.redirect('/');
            });
            
        } else {
            res.redirect('/404');
        }
    })
    .catch(err => {
        console.log(err);
    });
}

module.exports.logout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}

module.exports.isLoggedIn = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        loggedIn: req.session.loggedIn,
    });
}

module.exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    
}