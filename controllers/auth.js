const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config({ path: "./vars/.env" });

// SECRET JWT PHRASE
const secretPhrase = process.env.JWT_SECRET_PHRASE;

const User = require("../models/user");

////// SIGNS UP USER WITH VALIDATED USERINPUT ///////
exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const userName = req.body.userName;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        userName: userName,
        email: email,
        password: hashedPw,
        firstName: firstName,
        lastName: lastName,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

////// LOGS IN USER WITH ENTERED USER INPUT ////////
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  // FINDS A USER BASED ON USERS EMAIL INPUT
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found!");
        error.statusCode = 401;
        throw error;
      }
      // IF USER IS FOUND, USER PASSWORD INPUT COMPARED TO THE DB PASSWORD
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      // THROWS ERROR IF USERINPUT PASSWORD AND DB PASSWORD DONT MATCH
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }

      // CHECK IF USER IS ADMIN
      if (isEqual && email === "brd9326@protonmail.com") {
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
            isAdmin: true,
          },
          secretPhrase,
          { expiresIn: "1h" }
        );
        res.status(200).json({
          token: token,
          userId: loadedUser._id.toString(),
          userName: loadedUser.userName,
          isAdmin: true,
          favorites: loadedUser.favorites,
        });
      } else {
        //IF PASSWORD VALID, TOKEN CREATED WITH JWT
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
          },
          secretPhrase,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          token: token,
          userId: loadedUser._id.toString(),
          userName: loadedUser.userName,
          favorites: loadedUser.favorites,
        });
      }
    })

    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

////// GETS AUTH DATA FOR USER IF TOKEN DETECTED IN THEIR LOCAL STORAGE ///////////
exports.postFetchAuth = (req, res, next) => {
  const userId = req.userId;
  let isAdmin = false;
  if (req.isAdmin) {
    isAdmin = true;
  }
  User.findById(userId)
    .then((user) => {
      const favorites = user.favorites;
      const userName = user.userName;

      res.status(200).json({
        message: "User Found!",
        favorites: favorites,
        userName: userName,
      });
    })
    .catch((err) => {});
};

////// UPDATES USER'S FAVORITES ARRAY IN MONGODB ///////
exports.putUpdateAuth = (req, res, next) => {
  const userId = req.userId;
  const sentFavorites = req.body.favorites;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find User!");
        error.status = 400;
        throw error;
      }
      user.favorites = sentFavorites;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Favorites updated!" });
    })
    .catch((err) => {
      console.log(err);
    });
};

////// FETCHES USER'S SUBMITTED TRAILS FOR ACCOUNT PAGE
exports.postFetchUserTrails = (req, res, next) => {
  console.log("User Submitted Trails");
  const userId = req.userId;
  User.findById(userId)
    .populate("submittedTrails")
    .exec((err, user) => {
      res.status(200).json({ submittedTrails: user.submittedTrails });
    });
};
