
def optimize_price(demand, competitor_price):
    if demand > 8:
        return competitor_price + 50
    elif demand < 4:
        return competitor_price - 40
    return competitor_price
