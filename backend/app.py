from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///sims.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# -------------------------
# Database Models
# -------------------------
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.Integer, default=lambda: int(time.time()))

# -------------------------
# Routes
# -------------------------
@app.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([
        {"id": p.id, "name": p.name, "quantity": p.quantity, "price": p.price}
        for p in products
    ])

@app.route("/products", methods=["POST"])
def add_product():
    data = request.json
    product = Product(
        name=data.get("name"),
        quantity=int(data.get("quantity")),
        price=float(data.get("price"))
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"message": "Product added!"}), 201

@app.route("/sales", methods=["POST"])
def add_sale():
    data = request.json
    product_id = data.get("product_id")
    quantity_sold = int(data.get("quantity_sold", 0))

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    if product.quantity < quantity_sold:
        return jsonify({"error": "Not enough stock available"}), 400

    product.quantity -= quantity_sold
    sale = Sale(product_id=product_id, quantity_sold=quantity_sold)
    db.session.add(sale)
    db.session.commit()
    return jsonify({"message": "Sale recorded successfully"})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
