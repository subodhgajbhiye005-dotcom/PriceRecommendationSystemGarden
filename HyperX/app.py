
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from data_sources.internal_data import get_internal_data
from data_sources.external_data import get_external_data
from features.feature_engineering import build_features
from models.demand_forecast import predict_demand
from models.price_optimization import optimize_price
from models.discount_effectiveness import discount_probability
from models.offer_recommendation import recommend_offer
from decision_engine.decision_engine import final_decision

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def get_home():
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Price Recommendation System</title>
    <link rel="stylesheet" href="/static/styles.css">
</head>
<body>
    <div class="container">
        <h1>🌱 Price Recommendation System</h1>

        <form id="recommendationForm">
            <div class="form-group">
                <label for="userId">User ID:</label>
                <input type="number" id="userId" required placeholder="Enter user ID">
            </div>

            <div class="form-group">
                <label for="gardenerId">Gardener ID:</label>
                <input type="number" id="gardenerId" required placeholder="Enter gardener ID">
            </div>

            <div class="form-group">
                <label for="location">Location:</label>
                <input type="text" id="location" required placeholder="Enter location (e.g., New York)">
            </div>

            <button type="submit" id="submitBtn">Get Price Recommendation</button>
        </form>

        <div id="result" class="result">
            <div id="loading" class="loading">Getting recommendation...</div>
            <div id="response"></div>
        </div>
    </div>

    <script src="/static/script.js"></script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)

@app.post("/price-recommendation")
def get_price(user_id: int, gardener_id: int, location: str):
    internal = get_internal_data(user_id, gardener_id, location)
    external = get_external_data(location)
    time_features = {"season_flag": "monsoon"}

    features = build_features(internal, external, time_features)
    demand = predict_demand(features)
    base_price = optimize_price(demand, external["competitor_price"])
    disc_prob = discount_probability(features)
    final_price, discount = final_decision(base_price, disc_prob)
    offer = recommend_offer(features, demand)

    return {
        "predicted_demand": demand,
        "base_price": base_price,
        "final_price": final_price,
        "discount": discount,
        "offer": offer
    }
