
def final_decision(price, discount_prob):
    MAX_DISCOUNT = 0.25
    if discount_prob > 0.6:
        discount = min(discount_prob * 0.2, MAX_DISCOUNT)
        return round(price * (1 - discount), 2), f"{int(discount*100)}% Discount"
    return price, "No Discount"
