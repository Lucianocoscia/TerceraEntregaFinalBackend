import { Schema, model } from "mongoose";

const date = new Date();

const cartSchema = new Schema({
  timestamp: { type: Date, default: date.toUTCString() },
  products: { type: Array, required: true },
  username: { type: String },
});

export const Cart = model("cart", cartSchema);
