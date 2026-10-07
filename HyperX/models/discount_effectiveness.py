
def discount_probability(features):
    return round(
        features["price_elasticity"] * 0.4 +
        features["past_discount_response"] * 0.6, 2
    )
