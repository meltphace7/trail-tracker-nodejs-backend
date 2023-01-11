const express = require("express");
const { body } = require("express-validator");
const Trail = require("../models/trail");
const trailsController = require("../controllers/trails");
const isAuth = require("../middleware/auth");

const router = express.Router();

router.get("/trails", trailsController.getTrails);

router.put(
  "/submit-trail",
  [
    body("name").custom((value, { req }) => {
      return Trail.findOne({ name: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Trail name already exists!");
        }
      });
    }),
    body("state").trim().not().isEmpty(),
    body("wildernessArea").trim().not().isEmpty(),
    body("seasonStart").trim().isLength({ min: 1 }),
    body("seasonEnd").trim().isLength({ min: 1 }),
    body("longitude").trim().isLength({ min: 1 }),
    body("latitude").trim().isLength({ min: 1 }),
    body("miles").trim().isLength({ min: 1 }),
    body("scenery").trim().isLength({ min: 1 }),
    body("solitude").trim().isLength({ min: 1 }),
    body("difficulty").trim().isLength({ min: 1 }),
    body("description").trim().isLength({ min: 10 }),
  ],
  isAuth,
  trailsController.putAddTrail
);

module.exports = router;