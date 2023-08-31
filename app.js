// Packages
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// Core Modules
const path = require('path');

// Constants
const DATABASE = 'shop' 
const URI = `mongodb+srv://mahmoud:${process.env.mongoDB_shop_pass}@cluster0.ffkdxbs.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;

// Controllers
const errorController = require('./controllers/error');
const {isLoggedIn, getToken} = require('./middlewares/auth');

// Utilities
const {genGlobalSecret} = require('./util/auth');

// Models
const User = require('./models/user');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/error');

// App
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mysecret',
    resave: false,  // Only resave the session when there is a change in the session information. If set to true, the session is save with every request from the user
    saveUninitialized: false,   //  This can be useful to prevent storing empty or unnecessary sessions for users who don't perform any actions that require session data.
    store: MongoStore.create({  // Sets up the database collection used to store the sessions
        mongoUrl: URI,
    }),
}));

app.use(flash());   // You need to define the flash middleware after the session middleware as the flash messages are stored in the sessions database

app.use(getToken);

app.use((req, res, next) => {
    res.locals.loggedIn =  req.session.loggedIn;
    next();
});

app.use((req, res, next) => {
    if (req.session.loggedIn) {
        User.findById(req.session.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        });
    } else {
        next();
    }
});

// Routes
app.use('/admin', isLoggedIn, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);
app.use(errorController.get404);

const main = async () => {
    // Connect to the database
    const result = await mongoose.connect(URI);
    console.log('.....Connected to MongoDB database.....');
    // console.log(result);

    // Generate Login Secret
    await genGlobalSecret();
    
    console.log('....Listening to requests....')
    app.listen(3000);   // Listen on port 3000
}

main()
.catch(err => {
    console.log(err);
});