// Utilties
const {db} = require('../util/database');
const productsCol = db.collection('products');


// NPM Packages
const {ObjectId} = require('mongodb');

// Models


class Product {
    constructor(title, price, description, imageUrl, sellerId) {
        this.title = title;
        this.price = parseFloat(price);
        this.description = description;
        this.imageUrl = imageUrl;
        this.sellerId = sellerId ? new ObjectId(sellerId):null;
    }

    async save() {
        const result = await productsCol.insertOne(this);
        return result;
    }

    static async getAll() {
        const cursor = productsCol.find();
        const products = await cursor.toArray();
        cursor.close();
        return products;
    }

    static async getById(...ids) {
        ids = ids.map(id => {
            try {
                return new ObjectId(id);
            } catch (err) {
                // Nothing
            }
        });
        const cursor = productsCol.find({_id: {$in: ids}});
        const products = await cursor.toArray();  // Returns a Promise
        cursor.close();
        return products;
    }

    static async deleteById(...ids) {
        ids = ids.map(id => {
            try {
                return new ObjectId(id);
            } catch (err) {
                // Nothing
            }
        });

        const result = await productsCol.deleteMany({_id: {$in: ids}});
        return result;
    }

    static async updateById(id, productData) {
        const result = await productsCol.replaceOne({_id: new ObjectId(id)}, productData);
        return result;
    }
}


module.exports = Product;
