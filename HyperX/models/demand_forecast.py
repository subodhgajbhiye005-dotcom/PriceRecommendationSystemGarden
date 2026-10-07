
def predict_demand(features):
    base = features["demand_score"]
    if features["season_flag"] == "monsoon":
        base *= 1.2
    return round(base, 2)
