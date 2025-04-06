#app.py
import pandas as pd
from flask import Flask, jsonify, render_template, redirect, request
from sqlHelper import SQLHelper


#################################################
# Flask Setup
#################################################
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


sqlHelper = SQLHelper()


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/map")
def map():
    return render_template("map.html")

@app.route("/about_us")
def about_us():
    return render_template("about_us.html")

@app.route("/works_cited")
def work_cited():
    return render_template("works_cited.html")

@app.route("/analysis")
def analysis():
    return render_template("analysis.html")

#################################################
# API Routes
#################################################

@app.route("/api/v1.0/bar_data")
def bar_data():
    # Execute query
    df = sqlHelper.queryBarData()

    # Turn DataFrame into JSON
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/heat_data")
def heat_data():
    # Execute query
    df = sqlHelper.queryHeatData()

    # Convert DataFrame to JSON
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/table_data")
def table_data():
    # Execute Query
    df = sqlHelper.queryTableData()

    # Turn DataFrame into JSON
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/map_data")
def map_data():
    # Get the selected year and stat
    selected_year = request.args.get("year", default=None, type=int)
    selected_stat = request.args.get("stat", default="HR", type=str)

    # Execute Query with selected stat
    df = sqlHelper.queryMapData(selected_year, selected_stat)

    # Convert DataFrame to JSON
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/regression_data")
def regression_data():
    # Execute Query
    df = sqlHelper.queryRegressionData()

    # Convert DataFrame to JSON
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/v1.0/sunburst_data")
def sunburst_data():
    # Get the selected year from the request
    selected_year = request.args.get("year", default=None, type=int)

    # Execute Query and filter by year
    df = sqlHelper.querySunburstData(selected_year)

    # Convert DataFrame to JSON
    data = df.to_dict(orient="records")
    return jsonify(data)

##############################################################

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers['X-UA_Compatible'] = 'IE=Edge,chrome=1'
    r.headers["Cache-Control"] = "no-chace, no-store, must-revalidate, public, max-age=0"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    return r

if __name__ == '__main__':
    app.run(debug=True)