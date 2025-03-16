const { validationResult } = require("express-validator");
const Trail = require("../models/trail");
const User = require("../models/user");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const dotenv = require("dotenv");
const sharp = require("sharp");

dotenv.config({ path: "./vars/.env" });

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const pirateWeatherKey = process.env.PIRATEWEATHER_KEY;


// CONFIGURES s3 object so the image can be stored
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

////// FETCHES ALL TRAILS FROM MONGODB /////////////
exports.getTrails = async (req, res, next) => {
  const trails = await Trail.find();

  res.status(201).json({ message: "Trails Fetched!", trails: trails });
};

////// FETCHES SINGLE TRAIL FOR TRAIL DETAIL PAGE ////////
exports.getTrailDetail = async (req, res, next) => {
  const trailId = req.params.trailId;
  const trail = await Trail.findById(trailId);
  if (!trail) {
    throw new Error('Could not find trail!')
  } 
  res.status(201).json({ message: "Trail found", trail: trail });
};

////// ADDS A NEW TRAIL TO MONGODB /////////////////////
exports.putAddTrail = async (req, res, next) => {
   console.log("images", req.files);
  const images = req.files;
  const userId = req.userId;
  console.log('NEW TRAIL ADDED')

  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    if (!images) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findById(userId)
  
    if (!user) {
      const error = new Error("Could not find user!");
      error.statusCode = 422;
      throw error;
    }
    //// S3 IMAGES
    const randomImageName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");

    const imageNameArray = [];

    await Promise.all(images.map((image) => {
      const imageName = randomImageName();
      imageNameArray.push(imageName);

      //// RESIZE IMAGE WITH SHARP
      return sharp(image.buffer).resize({ width: 1800, height: null, fit: "contain" }).toBuffer()
        .then(buffer => {
          const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: buffer,
            ContentType: image.mimetype,
          };
          const command = new PutObjectCommand(params);
          return s3.send(command);
        })
      ///////
    }));

    const imageUrls = imageNameArray.map((image) => {
      return `https://trail-tracker-image-bucket.s3.us-west-2.amazonaws.com/${image}`;
    });

    const seasonArray = [+req.body.seasonStart, +req.body.seasonEnd];

    const trailName = req.body.trailName;
    const state = req.body.state;
    const wildernessArea = req.body.wildernessArea;
    const trailheadName = req.body.trailheadName;
    const bestSeason = seasonArray;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    const miles = req.body.miles;
    const scenery = req.body.scenery;
    const solitude = req.body.solitude;
    const difficulty = req.body.difficulty;
    const description = req.body.description;
    const author = req.body.author;
    const authorId = req.body.authorId;

    const newTrail = new Trail({
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
    await newTrail.save();
    user.submittedTrails.push(newTrail._id);
    await user.save();
    // afterUser
   
    res.status(201).json({ message: "You trail was added!" });

  } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
    next()
  }
 
};

////// FETCHES SINGLE TRAIL FOR TRAIL DETAIL PAGE ///////////
exports.getTrailDetail = async (req, res, next) => {
  const trailId = req.params.trailId;
  const trail = await Trail.findById(trailId);

  res.status(201).json({ message: "Trail found", trail: trail });
};

////// FETCHES SINGLE TRAIL FOR EDIT TRAIL PAGE ///////////
exports.postfetchTrailEdit = async (req, res, next) => {
 try { const trailId = req.params.trailId;
  const trail = await Trail.findById(trailId);
  if (!trail) {
    throw new Error('Could not find trail!')
  }

   res.status(201).json({ message: "Trail found", trail: trail });
 } catch (err) {
   console.log(err)
 }
};

////// EDITS/REPLACES OLD TRAIL DATA WITH NEW DATA ////////////
exports.putEditTrail = async (req, res, next) => {
   try {
     const trailId = req.body.trailId;
     const images = req.files;

     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       const error = new Error("Please enter  valid trail data!");
       error.statusCode = 422;
       error.data = errors.array();
       throw error;
     }

     const updatedSeasonArray = [+req.body.seasonStart, +req.body.seasonEnd];

     const updatedTrailName = req.body.trailName;
     const updatedState = req.body.state;
     const updatedWildernessArea = req.body.wildernessArea;
     const updatedTrailheadName = req.body.trailheadName;
     const updatedLongitude = req.body.longitude;
     const updatedLatitude = req.body.latitude;
     const updatedMiles = req.body.miles;
     const updatedScenery = req.body.scenery;
     const updatedSolitude = req.body.solitude;
     const updatedDifficulty = req.body.difficulty;
     const updatedDescription = req.body.description;

     // IF NEW IMAGES SENT, UPLOADS TO S3
     const imageNameArray = [];
     if (images) {
       const randomImageName = (bytes = 32) =>
         crypto.randomBytes(bytes).toString("hex");
       
        await Promise.all(
          images.map((image) => {
            const imageName = randomImageName();
            imageNameArray.push(imageName);

            //// RESIZE IMAGE WITH SHARP
            return sharp(image.buffer)
              .resize({ width: 1800, height: null, fit: "contain" })
              .toBuffer()
              .then((buffer) => {
                const params = {
                  Bucket: bucketName,
                  Key: imageName,
                  Body: buffer,
                  ContentType: image.mimetype,
                };
                const command = new PutObjectCommand(params);
                return s3.send(command);
              });
            ///////
          })
        );
     }
     const imageUrls = imageNameArray.map((image) => {
       return `https://trail-tracker-image-bucket.s3.us-west-2.amazonaws.com/${image}`;
     });

     // CHANGES TRAIL DATA IN MONGODB
     const trail = await Trail.findById(trailId);

     if (images.length !== 0) {
       trail.images = imageUrls;
     } else {
       trail.images = trail.images;
     }

     trail.trailName = updatedTrailName;
     trail.state = updatedState;
     trail.wildernessArea = updatedWildernessArea;
     trail.trailheadName = updatedTrailheadName;
     trail.bestSeason = updatedSeasonArray;
     trail.longitude = updatedLongitude;
     trail.latitude = updatedLatitude;
     trail.miles = updatedMiles;
     trail.scenery = updatedScenery;
     trail.solitude = updatedSolitude;
     trail.difficulty = updatedDifficulty;
     trail.description = updatedDescription;

     await trail.save();

     res.status(201).json({ message: "Trail edited successfully" });
   } catch (err) {
     console.log(err);
     next();
   }
  
};

// DELETES A TRAIL FROM MONGODB
exports.postDeleteTrail = (req, res, next) => {
  const trailId = req.body.trailId;
  const trailImageArray = req.body.trailImages;

  // DELETES IMAGE FROM s3 BUCKET
  trailImageArray.forEach((imageUrl) => {
    const imageName = imageUrl.slice(62);
    const deleteImage = async () => {
      const params = {
        Bucket: bucketName,
        Key: imageName,
      };
      const command = new DeleteObjectCommand(params);
      await s3.send(command);
    };
    deleteImage();
  });

  // DELETES TRAIL FROM MONGO
  Trail.findByIdAndRemove(trailId)
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Trail Deleted!" });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getTrailWeatherKey = (req, res, next) => {
  res.status(201).json({ pirateWeatherKey: pirateWeatherKey });
};
