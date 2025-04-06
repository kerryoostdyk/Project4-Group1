$(document).ready(function() {
    console.log("Page Loaded");

    $("#filter").click(function() {
        // alert("button clicked!");
        make_predictions();
    });
});


// call Flask API endpoint
function make_predictions() {
    let economic_loss = $("#economic_loss").val();
    let avg_waste = $("#avg_waste").val();
    let population = $("#population").val();
    let household_waste = $("#household_waste").val();
    let country = $("#country").val();
    let year = $("#year").val();
    let food_category = $("#food_category").val();


    // check if inputs are valid

     // create the payload
     let payload = {
        "economic_loss ": economic_loss ,
        "avg_waste": avg_waste,
        "population": population,
        "household_waste": household_waste,
        "country": country,
        "year": year,
        "food_category": food_category
    }

    // Perform a POST request to the query URL
    $.ajax({
        type: "POST",
        url: "/make_predictions",
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({ "data": payload }),
        success: function(returnedData) {
            // print it
            console.log(returnedData);

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });

}

