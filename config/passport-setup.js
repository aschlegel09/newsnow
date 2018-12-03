var passport = require('passport');
var User = require('../models/user-model');

// stuff user info in cookie
passport.serializeUser((user, done) => {
    // identify user with id (not google id)
    done(null, user.id);
});

// when cookie comes back from browser, take id and find user
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});