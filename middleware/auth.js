const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./vars/.env" });

// SECRET JWT PHRASE
const secretPhrase = process.env.JWT_SECRET_PHRASE;

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated!");
    error.satusCode = 401;
    throw error;
  }

  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secretPhrase);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  if (req.userId === "637ef5b2e23c658abc643ef4") {
    req.isAdmin = true;
  }
  next();
};
