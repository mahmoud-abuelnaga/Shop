// NPM Packages
const { ObjectId } = require('mongodb');

// Utilites
const {db} = require('../util/database');
const ordersCol = db.collection('orders');

// Models
const User = require('./user');


// Model Definition
class Order {
    constructor(products, buyerId, id) {
        this.products = products;
        this.totalPrice = this.products.reduce((price, product) => price + parseFloat(product.price), 0);
        this.buyerId = new ObjectId(buyerId);
        this._id = id ? new ObjectId(id) : null;
    }

    async save() {
        let result;
        if (this._id) {
            result = await ordersCol.updateOne({_id: this._id}, {
                $set: this
            });
            if (result.modifiedCount == 0) {
                throw Error('No such order to update');
            }
        } else {
            result = await ordersCol.insertOne(this);
        }

        return result;
    }

    static async getOrder(orderId) {
        try {
            orderId = new ObjectId(orderId);
        } catch (err) {
            // Nothing
        }

        const order = await ordersCol.findOne({_id: orderId});
        if (order) {
            return new Order(order.products, order.buyerId, order._id);
        } else {
            throw Error('No such order');
        }
    }

    async getBuyer(buyerId) {
        const buyer = await User.getById(buyerId);
        return buyer;
    }

    static async getUserOrders(userId) {
        userId = new ObjectId(userId);
        const orders = await ordersCol.find({buyerId: userId}).toArray();
        return orders;
    }
}

module.exports = Order;