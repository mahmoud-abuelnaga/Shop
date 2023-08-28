// Utilites


// NPM Packages
const mongoose = require('mongoose');

// Models
const {Product} = require('./product');
const Order = require('./order');


// Model Definition
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    cart: [{productId: {type: mongoose.ObjectId, ref: 'Product',}, quantity: {type: Number, default: 1}}],
},
{
    methods: {
        async addToCart(productId) {
            const item = this.cart.find(item => item.productId == productId);
            if (item) {
                item.quantity += 1;
            } else {
                this.cart.push({productId, quantity: 1});
            }

            const result = await this.save()
            return result;
        },

        async removeFromCart(productId) {
            this.cart = this.cart.filter(item => item.productId != productId);
            const result = await this.save();
            return result;
        },

        async getCart() {
            const result = await this.populate('cart.productId');
            let totalPrice = 0;
            const products = this.cart.map(item => {
                let product = {_id: item.productId._id, title: item.productId.title, price: item.productId.price, sellerId: item.productId.sellerId, quantity: item.quantity};
                product.quantity = item.quantity;
                totalPrice += (product.price * product.quantity);
                return product;
            });

            return {products, totalPrice};
        },

        async getOrders() {
            const orders = await Order.find({userId: this._id});
            return orders;
        },

        async createOrder() {
            const {products, totalPrice} = await this.getCart();
            const order = new Order({products, totalPrice, userId: this._id});
            const result = await order.save();
            this.cart = [];
            await this.save();
            return result;
        }
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;