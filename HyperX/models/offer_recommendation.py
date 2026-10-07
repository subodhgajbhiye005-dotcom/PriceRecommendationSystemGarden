
def recommend_offer(features, demand):
    if features["idle_time"] > 30 and demand < 5:
        return "Visibility Boost"
    if features["rating"] > 4.5:
        return "Premium Badge"
    return "No Offer"
