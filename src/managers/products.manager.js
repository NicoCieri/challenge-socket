import fs from "fs";
import { areProductFieldsValid } from "../utils.js";

export default class ProductManager {
  constructor(path) {
    this.path = path;
  }

  #areFieldsValid(product) {
    return areProductFieldsValid(product);
  }

  #isCodeUnique(code, products) {
    return !products.some((product) => product.code === code);
  }

  #generateId(products) {
    return (
      products.reduce(
        (maxId, product) => (product.id > maxId ? product.id : maxId),
        0
      ) + 1
    );
  }

  #checkIfProductExists(id, products) {
    return products.some((product) => product.id === id);
  }

  async #saveProductsToFile(products) {
    await fs.promises.writeFile(this.path, JSON.stringify(products));
  }

  async #getProductsFromFile() {
    if (fs.existsSync(this.path)) {
      const productsJSON = await fs.promises.readFile(this.path, "utf-8");

      return JSON.parse(productsJSON);
    } else return [];
  }

  async getProducts() {
    try {
      const products = await this.#getProductsFromFile();

      return { products };
    } catch (error) {
      return { error: "Error getting the products:" + error };
    }
  }

  async addProduct(product) {
    try {
      const products = await this.#getProductsFromFile();

      if (!this.#areFieldsValid(product)) {
        throw new Error("Invalid fields");
      }

      if (!this.#isCodeUnique(product.code, products)) {
        throw new Error("Code already exists");
      }

      const newProduct = {
        title: product.title,
        description: product.description,
        price: Number(product.price),
        category: product.category,
        code: product.code,
        stock: Number(product.stock),
        thumbnails: product.thumbnails || [],
        id: this.#generateId(products),
        status: product.status ?? true,
      };

      products.push(newProduct);

      await this.#saveProductsToFile(products);

      return { product: newProduct };
    } catch (error) {
      return { error: "Error adding the product:" + error };
    }
  }

  async getProductById(id) {
    try {
      const products = await this.#getProductsFromFile();

      const product = products.find((product) => product.id === id);

      return product ? { product } : { error: "Product not found" };
    } catch (error) {
      return { error: "Error getting the product:" + error };
    }
  }

  #isEditingCodeUnique(code, products, id) {
    return !products.some(
      (product) => product.code === code && product.id !== id
    );
  }

  async updateProduct(id, partialProduct) {
    try {
      const products = await this.#getProductsFromFile();
      const { product: productToUpdate } = await this.getProductById(id);

      const newProduct = {
        ...productToUpdate,
        ...partialProduct,
        id: productToUpdate.id,
      };

      const isNewCodeInvalid =
        partialProduct.code &&
        !this.#isEditingCodeUnique(partialProduct.code, products, id);

      if (isNewCodeInvalid) throw new Error("Code already exists");

      const newProducts = products.map((product) =>
        product.id === id ? newProduct : product
      );

      await this.#saveProductsToFile(newProducts);

      return { product: newProduct };
    } catch (error) {
      return { error: "Error updating the product:" + error };
    }
  }

  async deleteProduct(id) {
    try {
      const products = await this.#getProductsFromFile();
      const productExists = this.#checkIfProductExists(id, products);

      if (!productExists) throw new Error("Product not found");

      const filteredProducts = products.filter((product) => product.id !== id);
      await this.#saveProductsToFile(filteredProducts);

      return { id };
    } catch (error) {
      return { error: "Error deleting the product: " + error };
    }
  }
}
