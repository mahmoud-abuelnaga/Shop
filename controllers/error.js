module.exports.get404 = (req, res, next) => {
    res.status(404).render("error/404", {
        pageTitle: "Page Not Found",
        path: "/404",
    });
};

module.exports.getAuthenitcationError = (req, res, next) => {
    res.status(401).render("error/authorization", {
        pageTitle: "Authorization Error",
        path: "/error",
    });
};

module.exports.get500 = (req, res, next) => {
    res.status(500).render("error/500", {
        pageTitle: '500',
        path: '/500',
    });
};
