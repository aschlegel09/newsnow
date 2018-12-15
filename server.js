// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");

var PORT = process.env.PORT || 3000;

// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + "/public"));
// index route loads view.html
app.get("/", function (req, res) {
  res.render('index');
});

// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use morgan logger for logging requests
app.use(logger("dev"));

var connection = mongoose.connection;
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapedArt";

mongoose.connect(MONGODB_URI);

// // Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/scrapedArt", { useNewUrlParser: true });

// This makes sure that any errors are logged if mongodb runs into an issue
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function callback() {
  console.log("open connection");
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.artnet.com").then(function (response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);

    // Save an empty result object
    var result = {};

    $(".teaser").each(function (i, element) {

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("h2").text();
      result.link = $(this).children("a").attr("href");
      result.image = $(this).find("img").attr("src");
      result.category = $(this).find("h5").text();
      result.time = $(this).find("time").text();
      result.summary = $(this).find(".teaser-blurb").text();


      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        })
      // db.Article.aggregate([
      //   {
      //     "$group": {
      //       _id: { title: "$title" },
      //       dups: { $addToSet: "$_id" },
      //       count: { $sum: 1 }
      //     }
      //   },
      //   { 
      //     $match: 
      //     { 
      //       count: { "$gt": 1 } 
      //     } 
      //   }
      // ]).forEach(function (doc) {
      //   doc.dups.shift();
      //   db.Article.remove({ 
      //     _id: { $in: doc.dups } 
      //   });
      // }).catch(function (err) {
      //   // If an error occurred, send it to the client
      //   return res.json(err);
      // });
    });

    res.send("Scrape Complete");
  });

});



// Route for sorting articles by title
app.get("/title", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find().sort({ title: 1 })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for sorting articles by category
app.get("/category", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find().sort({ category: 1 })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// // Route for sorting articles by time
// app.get("/time", function (req, res) {
//   // Grab every document in the Articles collection
//   db.Article.find().sort({ time: 1 })
//     .then(function (dbArticle) {
//       res.json(dbArticle);
//     })
//     .catch(function (err) {
//       res.json(err);
//     });
// });

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// undefined
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {

  db.Article.findOne({ id: req.params._id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {

  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ id: req.params._id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route to get all articles and populate them with their notes
app.get("/notes", function (req, res) {
  // Find all articles
  db.Article.find({})
    // Specify that we want to populate the retrieved articles with any associated notes
    .populate("note")
    .then(function (dbArticle) {
      // If able to successfully find and associate all articles and Notes, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

