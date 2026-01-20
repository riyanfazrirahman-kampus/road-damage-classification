const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const { predictImage, getModels, getStatus } = require("../controllers/classification.controller");

router.get("/", getStatus);
router.get("/models", getModels);
router.post("/predict", upload.single("file"), predictImage);

module.exports = router;
