// We'll be rewriting the table's data frequently, so let's make our code more DRY
// by writing a function that takes in 'art' (JSON) and creates a table body
$(function () {
    function displayResults(artTitles) {
        // First, empty the table
        $("tbody").empty();

        // Then, for each entry of that json...
        artTitles.forEach(function (art) {
            // Append each of the art piece's properties to the table
            var tr = $("<tr>").append(
                $("<td>").text(art.title),
                $("<td>").text(art.category),
                $("<td>").text(art.link),
                $("<td>").text(art.time),
                $("<td>").text(art.image)
            );

            $("tbody").append(tr);
        });
    }

    // Bonus function to change "active" header
    function setActive(selector) {
        // remove and apply 'active' class to distinguish which column we sorted by
        $("th").removeClass("active");
        $(selector).addClass("active");
    }

    function setWidth(selector) {
        $("td").removeClass("active");
        $(selector).addClass("td-width");
    }
    // 1: On Load
    // ==========

    // First thing: ask the back end for json with all artTitles
    $.getJSON("/all", function (data) {
        // Call our function to generate a table body
        // displayResults(data);
        // Display the apropos information on the page
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    },


        // 2: Button Interactions
        // ======================

        // When user clicks the title sort button, display table sorted by title
        $("#title-sort").on("click", function () {
            // Set new column as currently-sorted (active)
            setActive("#title");

            // Do an api call to the back end for json with all artTitles sorted by title
            $.getJSON("/title", function (data) {
                // Call our function to generate a table body
                displayResults(data);
            });
        }),

        // When user clicks the category sort button, display the table sorted by category
        $("#category-sort").on("click", function () {
            // Set new column as currently-sorted (active)
            setActive("#category");

            // Do an api call to the back end for json with all artTitles sorted by category
            $.getJSON("/category", function (data) {
                // Call our function to generate a table body
                displayResults(data);
            });
        }),

        //   scrape buttons
        // clear the body of articles
        $("#clear").on("click", function () {
            event.preventDefault();
            $("tbody").empty();
        }),

        //   redirect to scraper on click
        $("#scrape").on("click", function () {
            event.preventDefault();

            // Run an AJAX request for any unsaved headlines
            $.get("/scrape").then(function (data) {
                displayResults(data);
            });
        })
    );
});