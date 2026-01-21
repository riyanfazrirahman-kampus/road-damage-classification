const db = require("../config/firebase");
const { sendToFastAPI, getModelsAvailable, getStatusModel } = require("../services/fastapi.service");


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
        // 1. Ambil data dari hasil klasifikasi
        const file = req.file;

        const {
            model,
            predictions,
            location
        } = req.body;

        if (!file) {
            return res.status(400).json({ error: "File image wajib" });
        }

        if (!model || !predictions) {
            return res.status(400).json({
                error: "Data tidak lengkap"
            });
        }

        // 2. upload ke Firebase Storage
        const fileName = `images/${Date.now()}-${file.originalname}`;

        const fileUpload = bucket.file(fileName);
        await fileUpload.save(compressedBuffer, {
            contentType: "image/jpeg"
        });

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // 3. Simpan ke Firestore
        const payload = {
            imageUrl,
            model,
            predictions,
            location,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db
            .collection("classifications")
            .add(payload);

        // 3. Response ke client
        res.json({
            status: "success",
            message: "Berhasil klasifikasi & simpan data",
            id: docRef.id,
            data: payload
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "fail",
            error: "Gagal memproses klasifikasi"
        });
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


module.exports = { predictImage, saveClassification, getModels, getStatus, getHistory };
