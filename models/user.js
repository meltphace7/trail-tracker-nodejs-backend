const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
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
  // favorites: [
  //   {
  //     type: String,
  //     required: true
  //   }
  // ],
  favorites: [
    {
      trailId: {
        type: Schema.Types.ObjectId,
        ref: "Trail",
        required: true,
      },
      trailName: { type: String, required: true },
      state: { type: String, required: true },
      wildernessArea: { type: String, required: true },
      trailheadName: { type: String, required: false },
      bestSeason: [
        {
          type: Number,
          required: true,
        },
      ],
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
      miles: { type: Number, required: true },
      scenery: { type: Number, required: true },
      solitude: { type: Number, required: true },
      difficulty: { type: Number, required: true },
      description: { type: String, required: true },
      author: { type: String, required: true },
      authorId: { type: String, required: true },
      images: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);
