module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        loggedIn: req.loggedIn,
    });
}

module.exports.postLogin = (req, res, next) => {
    req.session.loggedIn = true;    // Assigning the middleware session() gives you access to a session object which is used to manage the session for each unique client 
    res.redirect('/');              // Session information is by default stored in the ram
}