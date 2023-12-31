// Utilites
const { sendHTMLMail } = require("../util/mail");

// NPM Packages
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Tokens = require("csrf");

// Models
const Order = require("./order");
const { Product } = require("./product");

// Constants
const SALT = 4;
const tokens = new Tokens();
const { productsPerPage } = require("../util/globalVars");

// Helpers
const hashPassword = (value) => {
    const hashedValue = bcrypt.hashSync(value, SALT);
    return hashedValue;
};

// Model Definition
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            set: (name) => name.trim(),
        },
        email: {
            type: String,
            required: true,
            unique: true,
            set: (email) => email.trim().toLowerCase(),
        },
        password: {
            type: String,
            required: true,
            set: hashPassword,
        },
        cart: [
            {
                productId: { type: mongoose.ObjectId, ref: "Product" },
                quantity: { type: Number, default: 1 },
            },
        ],
        resetToken: {
            type: String,
        },
        resetTokenExpiration: {
            type: Date,
        },
    },
    {
        methods: {
            async addToCart(productId) {
                const item = this.cart.find(
                    (item) => item.productId == productId
                );
                if (item) {
                    item.quantity += 1;
                } else {
                    this.cart.push({ productId, quantity: 1 });
                }

                const result = await this.save();
                return result;
            },

            async removeFromCart(productId) {
                this.cart = this.cart.filter(
                    (item) => item.productId != productId
                );
                const result = await this.save();
                return result;
            },

            async getCart() {
                const result = await this.populate("cart.productId");
                let totalPrice = 0;
                const products = this.cart.map((item) => {
                    let product = {
                        _id: item.productId._id,
                        title: item.productId.title,
                        price: item.productId.price,
                        sellerId: item.productId.sellerId,
                        quantity: item.quantity,
                    };
                    product.quantity = item.quantity;
                    totalPrice += product.price * product.quantity;
                    return product;
                });

                return { products, totalPrice };
            },

            async getOrders() {
                const orders = await Order.find({ userId: this._id });
                return orders;
            },

            async createOrder() {
                const { products, totalPrice } = await this.getCart();
                const order = new Order({
                    products,
                    totalPrice,
                    userId: this._id,
                });
                const result = await order.save();
                this.cart = [];
                await this.save();
                return result;
            },

            async sendResetPassEmail() {
                const secret = await tokens.secret();
                let resetToken = await bcrypt.hash(secret, SALT);
                resetToken = resetToken.replace("/", "x");
                this.resetToken = resetToken;
                this.resetTokenExpiration = Date.now() + 30 * 60 * 1000; // Token expire after 30 min
                this.save();
                sendHTMLMail(
                    this.email,
                    "Password Reset",
                    `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/edit-pass/${resetToken}">link</a> if you want to reset. Otherwise just ignore this email.</p>
            `
                );
            },

            async getOwnedProducts(page) {
                const ownedProducts = await Product.find({sellerId: this._id, })
                    .skip((page - 1) * productsPerPage)
                    .limit(productsPerPage);
                return ownedProducts;
            },

            async getAllProducts() {
                const ownedProducts = await Product.find({sellerId: this._id, });
                return ownedProducts;
            },

            async countOwnedProducts() {
                const productsNo = await Product.count({sellerId: this._id});
                return productsNo;
            },

            async validPassword(password) {
                const valid = await bcrypt.compare(password, this.password);
                return valid;
            },
        },
    }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
