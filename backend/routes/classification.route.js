const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const { predictImage, getModels, getStatus, getHistory, saveClassification } = require("../controllers/classification.controller");

router.get("/", getStatus);
router.get("/models", getModels);
router.get("/history", getHistory);
router.post("/predict", upload.single("file"), predictImage);
router.post("/save-predict", upload.single("file"), saveClassification);

module.exports = router;
