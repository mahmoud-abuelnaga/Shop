const { body } = require("express-validator");

const validTitle = body("title", 'Invalid Title. Title must be at least 7 characters').notEmpty({}).isLength({
    min: 7,
});

const validDescription = body("description", 'Invalid Description. Description must be at least 50 characters').notEmpty().isLength({
    min: 50,
});

const validPrice = body("price", 'Invalid Price. Minimum Price is: $0.5').notEmpty().isNumeric().isFloat({ min: 0.5 });

const validProduct = [validTitle, validPrice, validDescription];

module.exports = {
    validTitle,
    validDescription,
    validPrice,
    validProduct,
};
