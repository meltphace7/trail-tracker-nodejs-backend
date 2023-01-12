const { validationResult } = require("express-validator");
const Trail = require("../models/trail");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config({ path: "./vars/.env" });

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// CONFIGURES s3 object so the image can be stored
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// FETCHES ALL TRAILS
exports.getTrails = async (req, res, next) => {
  const trails = await Trail.find();
  // Loop through products and create a imageURL based on the imageName
  for (const trail of trails) {
    trail.imageURLs = [];
    trail.images.forEach((image) => {
      const imageUrl = `https://trail-tracker-image-bucket.s3.us-west-2.amazonaws.com/${image}`;
    });
  }

  res.status(201).json({ message: "Trails Fetched!", trails: trails });
};

// FETCHES SINGLE TRAIL FOR TRAIL DETAIL PAGE
exports.getTrailDetail = async (req, res, next) => {
  const trailId = req.params.trailId;
  const trail = await Trail.findById(trailId);

  res.status(201).json({ message: "Trail found", trail: trail });
};

// ADDS A NEW TRAIL
exports.putAddTrail = (req, res, next) => {
  console.log("Trail submission received!");
  const images = req.files;
  console.log("images", images);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation failed!  Please enter valid trail data"
    );
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  //// S3 IMAGES
  const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString("hex");

  const imageNameArray = [];
  images.forEach((image) => {
    const imageName = randomImageName();
    imageNameArray.push(imageName);

    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: image.buffer,
      ContentType: image.mimetype,
    };
    const command = new PutObjectCommand(params);
    s3.send(command);
  });

  const imageUrls = imageNameArray.map((image) => {
    return `https://trail-tracker-image-bucket.s3.us-west-2.amazonaws.com/${image}`;
  });
    
  const seasonArray = [+req.body.seasonStart, +req.body.seasonEnd];

  const trailName = req.body.trailName;
  const state = req.body.state;
  const wildernessArea = req.body.wildernessArea;
  const trailheadName = req.body.trailheadName;
  const bestSeason = seasonArray
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  const miles = req.body.miles;
  const scenery = req.body.scenery;
  const solitude = req.body.solitude;
  const difficulty = req.body.difficulty;
    const description = req.body.description;
    const author = req.body.author;
    const authorId = req.body.authorId;

  const trail = new Trail({
    trailName,
    state,
    wildernessArea,
    trailheadName,
    bestSeason,
    longitude,
    latitude,
    miles,
    scenery,
    solitude,
    difficulty,
      description,
      author,
    authorId,
    images: imageUrls,
  });
  trail
    .save()
    .then((result) => {
      res.status(201).json({ message: "You trail was added!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
