
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db } = require("./firebase");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

// Test API
app.get("/api/health", (req, res) => {
  res.json({ message: "Billing API is running" });
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch products" });
  }
});

// Add a product
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        error: "Valid name, non-negative price and stock are required",
      });
    }

    const product = {
      name: name.trim(),
      price,
      stock,
      createdAt: new Date().toISOString(),
    };

    const doc = await db.collection("products").add(product);

    res.status(201).json({
      id: doc.id,
      ...product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to add product" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
