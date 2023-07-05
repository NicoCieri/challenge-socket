import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import { __dirname } from "./utils.js";
import ProductManager from "./managers/products.manager.js";
import validateProductMiddleware from "./middlewares/validateProductFields.middleware.js";
import { uploader } from "./middlewares/multer.js";
import { PRODUCTS_PATH } from "./paths.js";

const app = express();

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

const httpServer = app.listen(PORT, () => {
  console.log(`Server ok en puerto ${PORT}`);
});

const socketServer = new Server(httpServer);

const productManager = new ProductManager(PRODUCTS_PATH);

app.post(
  "/api/products",
  uploader.single("thumbnail"),
  validateProductMiddleware,
  async (req, res) => {
    const newProduct = req.body;
    newProduct.thumbnails = [req.file.filename];

    const { product, error } = await productManager.addProduct(newProduct);

    if (error) {
      res.status(500).json({ error: `${error}` });
      return;
    }

    const { products } = await productManager.getProducts();

    res.json({ product });
    socketServer.emit("product:added", { products, product });
  }
);

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  const { product } = await productManager.getProductById(Number(id));
  const { error } = await productManager.deleteProduct(Number(id));
  const { products } = await productManager.getProducts();

  if (error) {
    res.status(500).json({ error: `${error}` });
    return;
  }
  res.json({ id: Number(id) });
  socketServer.emit("product:removed", { product, products });
});

app.get("/", async (req, res) => {
  try {
    const { products, error } = await productManager.getProducts();

    if (error) res.render("error", { message: error, code: 500 });
    else res.render("home", { products });
  } catch (error) {
    res.render("error", { message: error, code: 500 });
  }
});

app.get("/realtimeproducts", async (req, res) => {
  try {
    const { products, error } = await productManager.getProducts();

    if (error) res.render("error", { message: error, code: 500 });
    else res.render("realTimeProducts", { products });
  } catch (error) {
    res.render("error", { message: error, code: 500 });
  }
});

socketServer.on("connection", (socket) => {
  console.log("New connection stablished", socket.id);
});
