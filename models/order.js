// NPM Packages
const mongoose = require('mongoose');

// Utilites


// Models
// const User = require('./user');
// const {Product, ProductSchema} = require('./product');


// Model Definition
const OrderSchema = new mongoose.Schema({
    products: [{}],
    totalPrice: Number,
    userId: {
        type: mongoose.ObjectId,
        ref: 'User',
    }
},
{
    methods: {
        async getUser() {
            const result = await this.populate('userId');
            return this.userId;
        },

    }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;