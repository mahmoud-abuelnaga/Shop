// Core Modules
const path = require('path');

// Controllers
const errorController = require('./controllers/error');

// NPM Modules
const express = require('express');

// Utilities
const {client} = require('./util/database');

// Models
const User = require('./models/user');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/error');

// App
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Register the user
app.use((req, res, next) => {
    User.getByQuery({email: 'admin@admin.com'})
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err);
    });

});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorRoutes);
app.use(errorController.get404);

// Create admin user if don't exist


const startServer = async () => {
    try {
        const admin = await User.getByQuery({
            email: 'admin@admin.com',
        });
    } catch (err) {
        const admin = new User('admin', 'admin@admin.com');
        const result = await admin.save();
        console.log('....Created admin user....');
    }

    try {
        const cli = await client.connect();
        console.log('.....Connected to MongoDB database.....');
        app.listen(3000);
    } catch (err) {
        console.log(err);
    }
}

startServer();