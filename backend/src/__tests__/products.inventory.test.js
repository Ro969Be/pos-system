import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import categoriesRouter from "../routes/shopCategories.routes.js";
import productsRouter from "../routes/shopProducts.routes.js";
import inventoryRouter from "../routes/shopInventory.routes.js";
import MenuCategory from "../models/MenuCategory.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops/:shopId/categories", categoriesRouter);
app.use("/api/shops/:shopId/products", productsRouter);
app.use("/api/shops/:shopId/inventory", inventoryRouter);

function authHeader() {
  const token = jwt.sign(
    {
      userId: "user-1",
      roles: ["Admin"],
      bindings: [{ shopId: "507f1f77bcf86cd799439011", role: "Admin" }],
    },
    process.env.JWT_SECRET
  );
  return { Authorization: `Bearer ${token}` };
}

describe("Products & Inventory", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a category and product", async () => {
    jest.spyOn(MenuCategory, "create").mockResolvedValue({
      _id: "cat1",
      shopId: "507f1f77bcf86cd799439011",
      name: "Drink",
    });
    jest.spyOn(MenuCategory, "find").mockReturnValue({
      sort: () => ({
        lean: () =>
          Promise.resolve([
            { _id: "cat1", shopId: "507f1f77bcf86cd799439011", name: "Drink" },
          ]),
      }),
    });
    jest
      .spyOn(MenuCategory, "exists")
      .mockResolvedValue(true);
    const productCreate = jest
      .spyOn(Product, "create")
      .mockResolvedValue({ _id: "prod1", name: "Coffee" });

    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/categories")
      .set(authHeader())
      .send({ name: "Drink" })
      .expect(201);

    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/products")
      .set(authHeader())
      .send({ name: "Coffee", price: 500, categoryId: "cat1" })
      .expect(201);

    expect(productCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Coffee", categoryId: "cat1" })
    );
  });

  it("updates inventory", async () => {
    const productId = "507f1f77bcf86cd799439012";
    jest.spyOn(Inventory, "findOne").mockReturnValue({
      lean: () => Promise.resolve({ productId, stockQty: 3 }),
    });
    jest
      .spyOn(Inventory, "findOneAndUpdate")
      .mockReturnValue({
        lean: () =>
          Promise.resolve({
            productId,
            stockQty: 8,
            hideWhenZero: false,
            lowStockNoteFlag: true,
          }),
      });

    const res = await request(app)
      .put(`/api/shops/507f1f77bcf86cd799439011/inventory/${productId}`)
      .set(authHeader())
      .send({ stockQty: 8, lowStockThreshold: 2, lowStockNoteFlag: true })
      .expect(200);

    expect(res.body.stockQty).toBe(8);
    expect(res.body.lowStockNoteFlag).toBe(true);
  });
});
