const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// const sendGridTransport = require("nodemailer-sendgrid-transport");
const dotenv = require("dotenv");

dotenv.config({ path: "./vars/.env" });

const User = require("../models/user");
const Trail = require("../models/trail");

// const sendGridKey = process.env.SENDGRID_KEY;
// const transporter = nodemailer.createTransport(
//   sendGridTransport({
//     auth: {
//       api_key: sendGridKey,
//     },
//   })
// );

// SIGNS UP USER WITH VALIDATED USERINPUT
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

// LOGS IN USER WITH ENTERED USER INPUT
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
          "aVerySecretiveSecret503",
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
          "aVerySecretiveSecret503",
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

// GETS AUTH DATA FROM USER IF TOKEN DETECTED IN THEIR LOCAL STORAGE
exports.postFetchAuth = (req, res, next) => {
  const userId = req.userId;
  let isAdmin = false;
  if (req.isAdmin) {
    isAdmin = true;
  }
  User.findById(userId)
    .then((user) => {
        const favorites = user.favorites;
        const userName = user.userName

      res.status(200).json({ message: "User Found!", favorites: favorites, userName: userName });
    })
    .catch((err) => {});
};

// UPDATES THE USERS CART IN THE DB
exports.putUpdateAuth = (req, res, next) => {
  const userId = req.userId;
  const sentFavorites = req.body.favorites;

  // Push these objects into the USer cart
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

// // GETS ACCOUNT DATA FOR LOGGED IN USER
// exports.postGetAccount = (req, res, next) => {
//   const userId = req.userId;
//   User.findById(userId)
//     .populate("orders")
//     .exec((err, user) => {
//       // SORTS BY DATE - LASTEST TO OLDEST
//       const byDate = (a, b) => {
//         let d1 = new Date(a.date.slice(0, -1));
//         let d2 = new Date(b.date.slice(0, -1));
//         return d2.valueOf() - d1.valueOf();
//       };

//       const sortedOrders = user.orders.sort(byDate);

//       const userData = {
//         userId: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         orders: sortedOrders,
//       };

//       res.status(200).json({ user: userData });
//     });
// };

// // CLEARS USERS CART AND ADDS STOCK BACK TO EACH PRODUCT WHEN USER LOGS OUT
// exports.postClearCart = (req, res, next) => {
//   const userId = req.userId;
//   const userCart = req.body;
//   // Restock each product from users cart
//   userCart.forEach((item) => {
//     Product.findById(item.id)
//       .then((product) => {
//         product.stock = product.stock + item.quantity;
//         return product.save();
//       })
//       .then((result) => {})
//       .catch((err) => {
//         console.log(err);
//       });
//   });

//   // Clear user's cart
//   User.findById(userId)
//     .then((user) => {
//       user.cart.items = [];
//       return user.save();
//     })
//     .then((result) => {})
//     .catch((err) => {
//       console.log(err);
//     });
// };

// // Sends an Email to User's Email with a token and link to a new password form
// exports.postResetPassword = (req, res, next) => {
//   const email = req.body.email;
//   console.log(email);
//   let userId;
//   crypto.randomBytes(32, (err, buffer) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     const token = buffer.toString("hex");
//     User.findOne({ email: email })
//       .then((user) => {
//         if (!user) {
//           const error = new Error("No account with that email found!");
//           error.statusCode = 404;
//           throw error;
//         }
//         user.resetToken = token;
//         user.resetTokenExpiration = Date.now() + 3600000;
//         userId = user._id;
//         console.log("USER ID", userId);
//         return user.save();
//       })
//       .then((result) => {
//         // SEND PASSWORD RESET EMAIL TO USERS EMAIL
//         transporter
//           .sendMail({
//             to: req.body.email,
//             from: "bdallonline@proton.me",
//             subject: "Reset Password",
//             html: `
//           <p>You have requested a password reset.</p>
//           <p>Click this <a clicktracking="off" href="http://localhost:3000/new-password/${token}">LINK</a> to set a new password</p>
//           <p>If LINK does not work visit this url: http://localhost:3000/new-password/${token} </p>
//           `,
//           })
//           .then((result) => {})
//           .catch((err) => {
//             console.log(err);
//           });
//         // console.log(result)
//         res
//           .status(200)
//           .json({
//             userId: userId,
//             message:
//               "Check your email and click the link to change your password",
//           });
//       })
//       .catch((err) => {
//         console.log(err);
//         next();
//       });
//   });
// };

// // Takes Users new password and replaces old password with it
// exports.postNewPassword = (req, res, next) => {
//   const passwordToken = req.params.token;
//   const userId = req.body.userId;
//   const newPassword = req.body.newPassword;
//   let resetUser;

//   User.findOne({
//     resetToken: passwordToken,
//     resetTokenExpiration: { $gt: Date.now() },
//     _id: userId,
//   })
//     .then((user) => {
//       resetUser = user;
//       return bcrypt.hash(newPassword, 12);
//     })
//     .then((hashedPassword) => {
//       resetUser.password = hashedPassword;
//       resetUser.resetToken = undefined;
//       resetUser.resetTokenExpiration = undefined;
//       return resetUser.save();
//     })
//     .then((result) => {
//       res.status(200).json({ message: "Your password has been changed!" });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
