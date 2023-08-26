// Core Modules
const path = require('path');

// Controllers
const errorController = require('./controllers/error');

// NPM Modules
const express = require('express');
const session = require('express-session');

// Utilities
const mongoose = require('mongoose');

// Models
const User = require('./models/user');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/error');

// Constants
const DATABASE = 'shop' 
const URI = `mongodb+srv://mahmoud:${process.env.mongoDB_shop_pass}@cluster0.ffkdxbs.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;

// App
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mysecret',
    resave: false,  // Only resave the session when there is a change in the session information. If set to true, the session is save with every request from the user
    saveUninitialized: false,   //  This can be useful to prevent storing empty or unnecessary sessions for users who don't perform any actions that require session data.
}));

// Register the user
app.use((req, res, next) => {
    User.findById('64e6d11afa247a09690d5dec')
    .then(user => {
        // console.log(user);
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);
app.use(errorController.get404);


const main = async () => {
    // Connect to the database
    const result = await mongoose.connect(URI);
    console.log('.....Connected to MongoDB database.....');
    // console.log(result);

    // Create admin user if don't exist
    const admin = await User.findOneAndUpdate({email: 'admin@admin.com'}, {
        name: 'admin',
    },
    {
        new: true,
        upsert: true,
    });
    // console.log(admin);
    
    console.log('....Listening to requests....')
    app.listen(3000);   // Listen on port 3000
}

main()
.catch(err => {
    console.log(err);
});