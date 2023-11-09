var express = require("express");
var router = express.Router();

router.post("/classify", async function (req, res, next) {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "File not found in request" });
    }
    let imageData = req.files.file;
    var AWS = require("aws-sdk");
    if (!process.env.ACCESS_KEY || !process.env.SECRET_KEY) {
      console.error(
        "ERROR: AWS credentials not provided. Make sure ACCESS_KEY and SECRET_KEY environment variables are set."
      );
      throw 500;
    }
    var credentials = new AWS.Credentials(process.env.ACCESS_KEY, process.env.SECRET_KEY);
    AWS.config.credentials = credentials;
    AWS.config.update({ region: "ap-southeast-1" });

    const client = new AWS.Rekognition();
    const params = {
      Image: {
        Bytes: imageData.data,
      },
    };

    const response = await client.detectLabels(params).promise();

    let resultLabels = response.Labels.map((label) => label.Name);

    res.status(200).json({
      labels: resultLabels,
    });
  } catch (err) {
    console.error("Error:", err);
    if (err.statusCode) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unexpected Internal Server Error! Please try again" });
    }
  }
});

module.exports = router;
