const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://mahmoud:${process.env.mongoDB_shop_pass}@cluster0.ffkdxbs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

module.exports.client = client;
module.exports.db = client.db('shop');