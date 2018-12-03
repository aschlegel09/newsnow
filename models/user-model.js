// save records in mongodb
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    // * Headline - the title of the article
    headline: String,
    // * Summary - a short summary of the article
    summary: String,
    // * URL - the url to the original article
    url: String,
    // * Feel free to add more content to your database (photos, bylines, and so on).   
    photos: String
});

var User = mongoose.model('user', userSchema);

module.exports = User;