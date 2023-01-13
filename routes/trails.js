const express = require("express");
const { body } = require("express-validator");
const Trail = require("../models/trail");
const trailsController = require("../controllers/trails");
const isAuth = require("../middleware/auth");

const router = express.Router();

router.get("/trails", trailsController.getTrails);

router.get("/trail-detail/:trailId", trailsController.getTrailDetail);

router.put(
  "/submit-trail",
  [
    body("trailName").custom((value, { req }) => {
      return Trail.findOne({ trailName: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Trail name already exists!");
        }
      });
    }),
    body("state").trim().not().isEmpty(),
    body("wildernessArea").trim().not().isEmpty(),
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

router.post(
  "/edit-trail",
  [
    body("trailName").trim().not().isEmpty(),
    body("state").trim().not().isEmpty(),
    body("wildernessArea").trim().not().isEmpty(),
    body("longitude").trim().isLength({ min: 1 }),
    body("latitude").trim().isLength({ min: 1 }),
    body("miles").trim().isLength({ min: 1 }),
    body("scenery").trim().isLength({ min: 1 }),
    body("solitude").trim().isLength({ min: 1 }),
    body("difficulty").trim().isLength({ min: 1 }),
    body("description").trim().isLength({ min: 10 }),
  ],
  isAuth,
  trailsController.postEditTrail
);

router.post("/edit-trail/:trailId", isAuth, trailsController.postfetchTrailEdit);

module.exports = router;