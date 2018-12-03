var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    res.render("index", {user: req.user});
  });

  app.get("/create", function (req, res) {
    res.render("create");
  });

  app.get("/view", function (req, res) {
    db.Item.findAll({ }).then(function (dbItems) {
      res.render("view", {
        items: dbItems
      });
    });
  });

  // Load example page and pass in an example by id
  app.get("/item/:id", function (req, res) {
    db.Item.findOne({
      where: {
        id: req.params.id
      }
    }).then(function (dbItem) {
      res.render("example", {
        item: dbItem
      });
    });
  });


    // Load example page and pass in an example by id
    app.get("/category/:category", function (req, res) {
      db.Item.findAll({
        where: {
          category: req.params.category
        }
      }).then(function (dbItems) {
        res.render("view", {
          items: dbItems
        });
      });
    });
  

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};