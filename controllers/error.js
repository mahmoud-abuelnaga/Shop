module.exports.get404 = (req, res, next) => {
  res.status(404).render('error/404', { pageTitle: 'Page Not Found', path: '/404' });
};

module.exports.getErrorCreatingProduct = (res, req, next) => {
  res.render('error/productCRUD', {pageTitle: 'Product Error', path: '/error'});
}