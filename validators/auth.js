const {body} = require('express-validator');

/**
 * Checks if the `name` field is valid. The `name` field is valid if:
 * 
 * - It's not empty;
 */
exports.validName = body('name')
                        .custom((name) => {
                            if (name.trim().length < 1) {
                                throw new Error("Name field can't be empty.");
                            } else {
                                return true;
                            }
                        });

/**
 * Checks if the form `email` input is valid. Email is valid if:
 * 
 * - No such email in the database
 * - Email is in valid format
 */
exports.validSignUpEmail = body('email', 'Please enter a valid email')
                            .isEmail()
                            .custom((email) => {
                                return User.findOne({ email })
                                        .then((user) => {
                                            if (user) {
                                                return Promise.reject('This email already exists');
                                            }
                                        })
                            });

/**
 * Checks if the form `password` input is valid. Password is valid if:
 * 
 * - Password length is between 7 & 35
 */
exports.validPasssword = body('password', 'Please enter a valid password whose length is between 7 & 35')
                            .isLength({
                                min: 7,
                                max: 35, 
                            });

/**
 * Check if the `confirmPassword` input is valid. Confirmed Password is valid if:
 * 
 * - `confirmPassword` matches the `password` field
 */
exports.validConfirmPassword = body('confirmPassword')
                                .custom((confirmPassword, {req}) => {
                                    if (confirmPassword != req.body.password) {
                                        throw new Error("The confirmed password doesn't match the password.");
                                    } else {
                                        return true;
                                    }
                                });


