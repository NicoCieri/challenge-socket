import { Router } from "express";
import ProductManager from "../managers/products.manager.js";

const router = Router();

const productManager = new ProductManager();

router.post("/", validateProductMiddleware, async (req, res) => {
  const newProduct = req.body;

  const { product, error } = await productManager.addProduct(newProduct);

  if (error) res.status(500).json({ error: `${error}` });
  else res.json({ product });
});
