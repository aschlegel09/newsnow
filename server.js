// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
// Initialize Express
var app = express();

// Set up a static folder (public) for our web app
app.use(express.static("public"));

// Database configuration
var databaseUrl = "scrapedArt";
var collections = ["artTitles, artImages, artCategories"];

// Use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections);

// This makes sure that any errors are logged if mongodb runs into an issue
db.on("error", function (error) {
  console.log("Database Error:", error);
});

// Routes
// 1. At the root path, send a simple hello world message to the browser
app.get("/", function (req, res) {
  res.send("Hello world");
});

// 2. At the "/all" path, display every entry in the art collection
app.get("/all", function (req, res) {
  // Query: In our database, go to the art collection, then "find" everything
  db.artTitles.find({}, function (error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  });
});

// 3. At the "/link" path, display every entry in the art collection, sorted by link
app.get("/link", function (req, res) {
  // Query: In our database, go to the art collection, then "find" everything,
  // but this time, sort it by link (1 means ascending order)
  db.artTitles.find().sort({ link: 1 }, function (error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  });
});

// 4. At the "/title" path, display every entry in the art collection, sorted by title
app.get("/title", function (req, res) {
  // Query: In our database, go to the art collection, then "find" everything,
  // but this time, sort it by title (-1 means descending order)
  db.artTitles.find().sort({ title: 1 }, function (error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  });
});

app.get("/image", function (req, res) {

  db.artImages.find().sort({ image: -1 }, function (error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://news.artnet.com/art-world").then(function (response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);

    $(".teaser-category").each(function (i, element) {

      var category = $(element).children("a").text(); //teaser-category

      if (category) {
        db.artCategories.insert({
          category: category
        }, function (err, inserted) {
          if (err) {
            console.log(err);
          } else {
            console.log(inserted);
          }
        });
      }
    });

    $(".teaser-info").each(function (i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").text(); //teaser-title
      var link = $(element).children("a").attr("href");
      var time = $(element).children(".teaser-blurb").text(); //teaser-blurb

      if (time) {
        db.artTitles.insert({
          time: time
        }, function (err, inserted) {
          if (err) {
            console.log(err);
          } else {
            console.log(inserted);
          }
        });
      }

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedLink collection
        db.artTitles.insert({
          title: title,
          link: link
        },
          function (err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          });
      }
    });

    $(".image-wrapper").each(function (i, element) {
      var image = $(element).children("img").attr("src");

      if (image) {
        db.artImages.insert({
          image: image
        },
          function (err, inserted) {
            if (err) {
              console.log(err);
            }
            else {
              console.log(inserted);
            }
          });
      }
    });

    // lookup is to join
    db.artTitles.aggregate([
      {
        $lookup:
        {
          from: "artImages",
          localField: "_id",
          foreignField: "image",
          as: "imageUrl"
        }
      }
    ]);

  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

// Set the app to listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});