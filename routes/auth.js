const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists!");
          }
        });
      }),
    body("password").trim().isLength({ min: 4 }),
    body("firstName").trim().not().isEmpty(),
    body("lastName").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.put("/update-auth", isAuth, authController.putUpdateAuth);

router.post("/fetch-auth", isAuth, authController.postFetchAuth);

router.post("/fetch-user-trails", isAuth, authController.postFetchUserTrails);

// router.post("/reset-password", authController.postResetPassword);

// router.post("/new-password/:token", authController.postNewPassword);

module.exports = router;
