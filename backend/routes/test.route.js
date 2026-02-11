const router = require("express").Router();
const upload = require("../middlewares/upload.middleware");
const cloudinaryUpload = require("../middlewares/upload.cloudinary.middleware");

const cloudinaryTes = require("../test/cloudinary.test")

router.post("/cloudinary/upload",
    upload.single("file"),
    cloudinaryUpload({ folder: "test-upload" }),
    cloudinaryTes.saveClassification
);

module.exports = router;
