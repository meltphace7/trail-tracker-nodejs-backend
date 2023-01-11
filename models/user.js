const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        imageName: { type: String, required: true },
        imageUrl: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  ],
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);
