$(document).ready(function() {
    console.log("Page Loaded");

    $("#filter").click(function() {
        make_predictions();
    });
});

// Call Flask API endpoint
function make_predictions() {
    let economic_loss = $("#economic_loss").val();
    let avg_waste = $("#avg_waste").val();
    let population = $("#population").val();
    let household_waste = $("#household_waste").val();
    let country = $("#country").val();
    let year = $("#year").val();
    let food_category = $("#food_category").val();

    // Create the payload
    let payload = {
        "economic_loss": economic_loss,
        "avg_waste": avg_waste,
        "population": population,
        "household_waste": household_waste,
        "country": country,
        "year": year,
        "food_category": food_category
    };

    // Send POST request to prediction endpoint
    $.ajax({
        type: "POST",
        url: "/make_predictions_api",
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify({ "data": payload }),
        success: function(returnedData) {
            console.log("Prediction Response:", returnedData);
            // You can display the result here too
            $("#prediction-result").html(`<strong>Prediction:</strong> ${returnedData.prediction}`);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}