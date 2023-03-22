import { Schema, model } from "mongoose";

const date = new Date();

const cartSchema = new Schema({
  timestamp: { type: Date, default: date.toUTCString() },
  products: { type: Array, required: true },
});

export const Cart = model("cart", cartSchema);
