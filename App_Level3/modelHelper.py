import pandas as pd
import numpy as np
import pickle
import os

class ModelHelper():
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "waste_model_pipeline.h5")
        with open(self.model_path, 'rb') as f:
            self.model = pickle.load(f)

    def make_predictions(self, economic_loss, avg_waste, population, household_waste, country, year, food_category):
        df = pd.DataFrame({
            "economic_loss": [economic_loss],
            "avg_waste": [avg_waste],
            "population": [population],
            "household_waste": [household_waste],
            "country": [country],
            "year": [year],
            "food_category": [food_category]
        })

        preds = self.model.predict(df)
        return preds[0]
