// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");

var PORT = 3000;

// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrapedArt", { useNewUrlParser: true });

var connection = mongoose.connection;
// This makes sure that any errors are logged if mongodb runs into an issue
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function callback() {
  console.log("open connection");
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.artnet.com/art-world").then(function (response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);

    // if (response.ObjectId) {
      $(".teaser-info").each(function (i, element) {
    // Save an empty result object
    var result = {};

    // Add the text and href of every link, and save them as properties of the result object
    result.time = $(this).children(".teaser-blurb").text(); //teaser-blurb
    result.title = $(this).children("a").text();
    result.link = $(this).children("a").attr("href");

    // Create a new Article using the `result` object built from scraping
    db.Article.create(result)
      .then(function (dbArticle) {
        // View the added result in the console
        console.log(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        return res.json(err);
      });
  });
});
  res.send("Scrape Complete");
  // res.redirect("/");
});

// Route for getting all Articles from the db
app.get("/all", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
