// Utilties


// NPM Packages
const mongoose = require('mongoose');

// Models


// Model Definition
const ProductSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: {
        type: String,
    },
    imageUrl: String,
    sellerId: {
        type: mongoose.ObjectId,
        ref: 'User',
    },
});

ProductSchema.statics.removeFromCarts = async (productId) => {
    const result = await mongoose.model('User').updateMany({}, {$pull: {cart: {productId}}});
    return result;
}

const Product = mongoose.model('Product', ProductSchema);


module.exports.Product = Product;
module.exports.ProductSchema = ProductSchema;
