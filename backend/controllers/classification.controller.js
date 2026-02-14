const db = require("../config/firebase");
const { sendToFastAPI, getModelsAvailable, getStatusModel } = require("../services/fastapi.service");

async function getStatus(req, res) {
    try {
        const status = await getStatusModel();

        return res.json(status);

    } catch (error) {
        console.error(error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({ error: "Server Models Die." });
    }
}


async function getModels(req, res) {
    try {
        const result = await getModelsAvailable();

        return res.json({
            status: "success",
            message: "Berhasil Mendapatkan Model Tersedia",
            data: result,
        });
    } catch (error) {
        console.error(error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({
            status: "fail",
            error: "Gagal mendapatakan data model yang tersedia"
        });
    }
}


async function getHistory(req, res) {
    try {
        const snapshot = await db
            .collection("classifications")
            .orderBy("created_at", "desc")
            .limit(20)
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            status: "success",
            data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "fail",
            error: "Gagal mengambil data"
        });
    }
}


async function predictImage(req, res) {
    try {
        const file = req.file;
        const { model_name } = req.body;

        if (!file) {
            return res.status(400).json({ error: "File image wajib" });
        }

        if (!model_name) {
            return res.status(400).json({ error: "model_name wajib" });
        }

        // 1. Kirim ke FastAPI
        const result = await sendToFastAPI({ file, model_name });

        // 2. Response ke client
        res.json({
            status: "success",
            message: "klasifikasi berhasil!",
            data: result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "fail",
            error: "proses klasifikasi gagal!"
        });
    }
}


async function saveClassification(req, res) {
    try {
        const { model, predictions, location } = req.body;
        const uploadResult = req.cloudinary;

        if (!uploadResult) {
            return res.status(400).json({
                status: "fail",
                step: "upload",
                error: "Upload image ke Cloudinary gagal"
            });
        }

        if (!model || !predictions) {
            return res.status(400).json({
                status: "fail",
                step: "validation",
                error: "Data tidak lengkap"
            });
        }

        let parsedPredictions;
        try {
            parsedPredictions =
                typeof predictions === "string"
                    ? JSON.parse(predictions)
                    : predictions;
        } catch (err) {
            return res.status(400).json({
                status: "fail",
                step: "parse_predictions",
                error: "Format predictions harus JSON valid"
            });
        }

        // Payload
        const payload = {
            image: {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
                bytes: uploadResult.bytes,
                format: uploadResult.format
            },
            model,
            predictions: parsedPredictions,
            location,
            created_at: new Date(),
            updated_at: new Date()
        };

        let docRef;
        try {
            docRef = await db.collection("classifications").add(payload);
        } catch (dbError) {
            console.error("Firestore error:", dbError);

            return res.status(500).json({
                status: "fail",
                step: "database",
                error: "Gagal menyimpan ke Firestore",
                detail: dbError.message
            });
        }

        // Success
        res.json({
            status: "success",
            message: "Data klasifikasi berhasil disimpan",
            id: docRef.id,
            data: payload
        });

    } catch (error) {
        console.error("Unexpected error:", error);

        res.status(500).json({
            status: "fail",
            step: "unknown",
            error: "Terjadi kesalahan tidak terduga",
            detail: error.message
        });
    }
}


module.exports = {
    getStatus,
    getModels,
    getHistory,
    predictImage,
    saveClassification,
};
