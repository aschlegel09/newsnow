$(function () {
    // 1: On Load
    // ==========



    function displayResults(artTitles) {
        // First, empty the table
        $("#articles").empty();

        // Then, for each entry of that json...
        artTitles.forEach(function (art) {
            // Append each of the art piece's properties to the table
            var tr = $("<tr>").append(
                $("<td>").text(art.title),
                $("<td>").text(art.summary),
                $("<td>").text(art.category),
                $("<td>").text(art.link),
                $("<td>").text(art.time),
                $("<td>").text(art.image)
            );

            $("#articles").append(tr);
        });
    }

    // First thing: ask the back end for json with all artTitles
    $.getJSON("/articles", function (data) {
        for (var i = 0; i < data.length; i++) {
            // Display information on the page
            $("#articles").append(
                "<tr data-id=" + data[i]._id + ">" +
                "<td><button>Save this article " + data[i]._id + "</button><br><button id='view'>View your note</button></td><td>" +
                data[i].title + "</td><td>" +
                data[i].summary + "</td><td>" +
                data[i].category + "</td><td>" +
                data[i].link + "</td><td>" +
                data[i].time + "</td><td>" +
                data[i].image + "</td></tr>"
            );
        };
   

        function setActive(selector) {
            // remove and apply 'active' class to distinguish which column we sorted by
            $("th").removeClass("active");
            $(selector).addClass("active");
        }
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

        $("#view").on("click", function () {

            $.getJSON("/view", function () {
                res.redirect("/view");
            });
        }),

        // When user clicks the category sort button, display the table sorted by category
        $("#category-sort").on("click", function () {
            // Set new column as currently-sorted (active)
            setActive("#category");

            $.getJSON("/category", function (data) {
                displayResults(data);
            });
        }),

        // // When user clicks the title sort button, display the table sorted by title
        // $("#time-sort").on("click", function () {
        //     // Set new column as currently-sorted (active)
        //     setActive("#time");

        //     // Do an api call to the back end for json with all artTitles sorted by title
        //     $.getJSON("/time", function (artTitles) {
        //         // Call our function to generate a table body
        //         displayResults(artTitles);
        //     });
        // }),

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
        });
    });

    // Whenever someone clicks a p tag
    $(document).on("click", "td", function () {
        // Empty the notes from the note section
        $("#notes").empty();
        // Save the id from the p tag
        var thisId = $(this).attr("data-id");

        // Now make an ajax call for the Article
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log(data);
                // The title of the article
                $("#notes").append("<h6>ID: " + data._id + "</h6>");

                $("#notes").append("<h5>Headline: " + data.title + "</h5>");
                // An input to enter a new title
                $("#notes").append("<tr><td><input id='titleinput' name='title' placeholder='Title'></td></tr>");
                // A textarea to add a new note body
                $("#notes").append("<tr><td><textarea id='bodyinput' name='body' placeholder='Body'></textarea></td></tr>");
                // A button to submit a new note, with the id of the article saved to it
                $("#notes").append("<tr><td><button data-id=" + data._id + " id='savenote'>Save Note</button></td></tr>");

                // If there's a note in the article
                if (data.note) {
                    // Place the title of the note in the title input
                    $("#titleinput").val(data.note.title);
                    // Place the body of the note in the body textarea
                    $("#bodyinput").val(data.note.body);
                }
            });
    });

    // When you click the savenote button
    $(document).on("click", "#savenote", function () {
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("data-id");

        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
            // With that done
            .then(function (data) {
                // Log the response
                console.log(data);
                // Empty the notes section
                $("#notes").empty();
            });

        // Also, remove the values entered in the input and textarea for note entry
        $("#titleinput").val("");
        $("#bodyinput").val("");
    });
});