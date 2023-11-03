var express = require("express");
var router = express.Router();

router.post("/classify", async function (req, res, next) {
  let imageData = req.files.file;
  var AWS = require("aws-sdk");

  var credentials = new AWS.Credentials(process.env.ACCESS_KEY, process.env.SECRET_KEY);
  AWS.config.credentials = credentials;
  AWS.config.update({ region: "ap-southeast-1" });

  const client = new AWS.Rekognition();
  const params = {
    Image: {
      Bytes: imageData.data,
    },
  };

  try {
    client.detectLabels(params, function (err, response) {
      if (err) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        let resultLables = [];

        response?.Labels.forEach((label) => {
          resultLables.push(label?.Name);
        });

        res.status(200).json({
          labels: resultLables,
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Unexpected Internal Server Error! Please try again" });
  }
});

module.exports = router;
