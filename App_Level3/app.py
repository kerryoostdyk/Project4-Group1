from flask import Flask, render_template, redirect, request, jsonify
from modelHelper import ModelHelper

# Create an instance of Flask
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

modelHelper = ModelHelper()

# Route to render index.html template using data from Mongo
@app.route("/")
def home():
    # Return template and data
    return render_template("index.html")

@app.route("/about_us")
def about_us():
    # Return template and data
    return render_template("about_us.html")

@app.route("/tableau1")
def tableau():
    # Return template and data
    return render_template("tableau1.html")

@app.route("/tableau2")
def tableau2():
    # Return template and data
    return render_template("tableau2.html")

@app.route("/report")
def report():
    # Return template and data
    return render_template("report.html")

@app.route("/works_cited")
def works_cited():
    # Return template and data
    return render_template("works_cited.html")

@app.route("/make_predictions", methods=["GET"])
def make_predictions_page():
    return render_template("make_predictions.html")

# Handles the POST request for predictions
@app.route("/make_predictions_api", methods=["POST"])
def make_predictions_api():
    content = request.json["data"]
    print(content)

    # parse
    economic_loss = float(content["economic_loss"])
    avg_waste = float(content["avg_waste"])
    population = float(content["population"])
    household_waste = float(content["household_waste"])
    country = content["country"]
    year = content["year"]
    food_category = (content["food_category"])

    preds = modelHelper.make_predictions(economic_loss, avg_waste, population, household_waste, country, year, food_category)
    return(jsonify({"ok": True, "prediction": str(preds)}))


#############################################################

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, public, max-age=0"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r

#main
if __name__ == "__main__":
    app.run(debug=True)
