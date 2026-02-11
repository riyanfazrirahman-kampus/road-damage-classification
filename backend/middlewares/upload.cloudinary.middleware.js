const { uploadToCloudinary } = require("../services/cloudinary.service");

function cloudinaryUpload(options = {}) {
    return async function (req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "File wajib" });
            }

            if (!req.file.mimetype.startsWith("image/")) {
                return res.status(400).json({ error: "File harus image" });
            }

            const result = await uploadToCloudinary(req.file.buffer, options);

            // simpan hasil upload ke request
            req.cloudinary = result;

            next();
        } catch (err) {
            console.error("Cloudinary middleware error:", err);
            res.status(500).json({ error: "Upload ke Cloudinary gagal" });
        }
    };
}

module.exports = cloudinaryUpload;
