async function saveClassification(req, res) {
    try {
        const { secure_url, public_id, bytes } = req.cloudinary;

        res.json({
            status: "success",
            image: {
                url: secure_url,
                public_id,
                bytes
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Upload gagal",
            detail: err.message || err
        });
    }
};

module.exports = { saveClassification };
