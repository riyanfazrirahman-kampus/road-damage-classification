const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const { predictImage, getModels } = require("../controllers/classification.controller");

router.get("/", getModels);
router.post("/upload", upload.single("file"), predictImage);

module.exports = router;
