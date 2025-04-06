import pandas as pd
import numpy as np
import pickle

class ModelHelper():
    def __init__(self):
        pass
    def make_predictions(self, economic_loss, avg_waste, population, household_waste, country, year, food_category):
        df=pd.DataFrame()
        df["economic_loss"]=[economic_loss]
        df["avg_waste"]=[avg_waste]
        df["population"]=[population]
        df["household_waste"]=[household_waste]
        df["country"]=[country]
        df["year"]=[year]
        df["food_category"]=[food_category]

        model = pickle.load(open("waste_model_pipeline.h5", 'rb'))

        preds = model.predict(df)

        return(total_food_waste)
