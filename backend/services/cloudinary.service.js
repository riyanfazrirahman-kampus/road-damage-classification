const cloudinary = require("../config/cloudinary");

function uploadToCloudinary(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder || "default",
                resource_type: "image",
                quality: "auto",
                fetch_format: "auto"
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
}

module.exports = { uploadToCloudinary };
