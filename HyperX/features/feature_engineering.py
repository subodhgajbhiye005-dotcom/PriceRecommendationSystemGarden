
def build_features(internal, external, time_features):
    return {
        "demand_score": internal["avg_bookings_per_hour"] * external["location_demand_index"],
        "competition_density": external["competition_density"],
        "rating": internal["gardener_rating"],
        "idle_time": internal["idle_time_minutes"],
        "season_flag": time_features["season_flag"],
        "price_elasticity": internal["user_price_elasticity"],
        "past_discount_response": internal["past_discount_response"]
    }
