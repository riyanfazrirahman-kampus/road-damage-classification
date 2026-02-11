const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const classificationController = require("../controllers/classification.controller");
const cloudinaryUpload = require("../middlewares/upload.cloudinary.middleware");

router.get("/", classificationController.getStatus);
router.get("/models", classificationController.getModels);
router.get("/history", classificationController.getHistory);

router.post("/predict", upload.single("file"), classificationController.predictImage);
router.post("/save-predict",
    upload.single("file"),
    cloudinaryUpload({ folder: "classifications" }),
    classificationController.saveClassification
);

module.exports = router;
