// estan definidos los recursos de la base de datos
import { Schema, model } from "mongoose";

const productSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  /*   description: { type: String, required: true },
  stock: { type: Number, required: true }, */
});

export const Product = model("product", productSchema);
