// Utilites
const {db} = require('../util/database');
const usersCol = db.collection('users');

// NPM Packages
const { ObjectId } = require('mongodb');

// Models
const Product = require('./product');
const Order = require('./order');


// Model Definition
class User {
    constructor(name, email, id, cart = [], orders = []) {
        this.name = name;
        this.email = email;
        this.cart = cart;
        try {
            this._id = id ? new ObjectId(id):null;
        } catch (err) {
            // Nothing
        }

        this.orders = [];
        
    }

    async save() {
        let result;
        if (this._id) {
            result = await usersCol.updateOne({_id: this._id}, {
                $set: this,
            });
            if (result.modifiedCount == 0) {
                throw Error('No such user to update');
            }
        } else {
            result = await usersCol.insertOne(this);
        }

        return result;
    }

    static async delete(userId) {
        try {
            userId = new ObjectId(userId);
        } catch (err) {
            // Nothing
        }

        const result = usersCol.deleteOne({_id: userId});
        return result;
    }

    static async getById(id) {
        let user = await usersCol.findOne({_id: new ObjectId(id)});
        if (user) {
            user = new User(user.name, user.email, user._id, user.cart);
        } else {
            throw Error('No user was found');
        }
        
        return user;
    }

    static async getByQuery(query) {
        let user = await usersCol.findOne(query);
        if (user) {
            user = new User(user.name, user.email, user._id, user.cart);
        } else {
            throw Error('No user was found');
        }
        
        return user;
    }

    async getCart() {
        const products = [];

        for (let prod of this.cart) {
            const quantity = prod.quantity;
            let product = await Product.getById(prod.productId);
            console.log(product);
            product = product[0];
            product.quantity = quantity;
            products.push(product);
        }


        return products;
    }

    async addToCart(productId) {
        let result;

        const filter = {_id: this._id};
        const update = {
            $inc: {'cart.$[i].quantity': 1},
        };

        const options = {
            arrayFilters: [
                {'i.productId': productId}
            ],
        };

        result = await usersCol.updateOne(filter, update, options);
        if (result.modifiedCount == 0) {
            result = await usersCol.updateOne(filter, {
                $push: {
                    'cart': {productId, quantity: 1},
                }
            });

            this.cart.push({productId, quantity: 1});
        } else {
            for (let product of this.cart) {
                if (product.productId == productId) {
                    product.quantity += 1;
                    break;
                }
                this }
        }
        
        return result;
    }   

    async removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId != productId);
        const result = await this.save();
        return result;
    }
    
    static async removeFromAllCarts(...productIds) {
        const result = await usersCol.updateMany({}, {
            $pull: {
                'cart': {
                    productId: {$in: productIds},
                },
            },

        });

        return result;
    }

    async clearCart() {
        this.cart = [];
        this.save();
    }

    async createOrder() {
        const cartProducts = await this.getCart();
        const order = new Order(cartProducts, this._id.toString());
        let result = await order.save();
        result = await this.clearCart();
        return result;
    }

    async getOrders() {
        const orders = await Order.getUserOrders(this._id.toString());
        return orders;
    }
}

module.exports = User;