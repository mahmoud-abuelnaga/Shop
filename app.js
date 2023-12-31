// Packages
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const helmet = require("helmet");
const compression = require('express-compression');
const morgan = require("morgan");

const path = require('path');
const fs = require("fs");

// Constants
const DATABASE = 'shop' 
const URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_CLUSTER0_PASS}@cluster0.ffkdxbs.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;
const logStream = fs.createWriteStream(path.join(__dirname, "access.log"));

// Controllers
const errorController = require('./controllers/error');
const {isLoggedIn, getToken} = require('./middlewares/auth');

// Utilities


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
app.use(helmet());  // set secure response headers
app.use(compression()); // compress response assets (html, css, js), but not images
app.use(morgan("combined", {stream: logStream}));  // log incoming requests
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'mysecret',
    resave: false,  // Only resave the session when there is a change in the session information. If set to true, the session is save with every request from the user
    saveUninitialized: false,   //  This can be useful to prevent storing empty or unnecessary sessions for users who don't perform any actions that require session data.
    store: MongoStore.create({  // Sets up the database collection used to store the sessions
        mongoUrl: URI,
    }),
}));

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

app.use(getToken);

// Routes
app.use('/admin', isLoggedIn, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);
app.use(errorController.get404);

// Error Middleware
app.use((err, req, res, next) => {
    console.log(err)
});

const main = async () => {
    // Connect to the database
    const result = await mongoose.connect(URI);
    console.log('.....Connected to MongoDB database.....');
    // console.log(result);
    
    console.log('....Listening to requests....')
    app.listen(process.env.PORT || 3000);   // Listen on port 3000
}

main()
.catch(err => {
    console.log(err);
});