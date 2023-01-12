const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trailSchema = new Schema({
  trailName: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  wildernessArea: {
    type: String,
    required: true,
  },
  trailheadName: {
    type: String,
    required: false,
  },
  bestSeason: [
    {
      type: Number,
      required: true,
    },
  ],
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  miles: {
    type: Number,
    required: true,
  },
  scenery: {
    type: Number,
    required: true,
  },
  solitude: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = mongoose.model("Trail", trailSchema);
