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

        const result = await sendToFastAPI({ file, model_name });

        return res.json({
            success: "success",
            data: result,
        });

    } catch (error) {
        console.error(error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({ error: "Gagal memproses klasifikasi" });
    }
}

async function getModels(req, res) {
    try {
        const result = await getModelsAvailable();

        return res.json({
            success: "success",
            data: result,
        });
    } catch (error) {
        console.error(error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({ error: "Gagal mendapatakan data model yang tersedia" });
    }
}

async function getStatus(req, res) {
    try {
        const result = await getStatusModel();

        return res.json({
            result,
        });
    } catch (error) {
        console.error(error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({ error: "Server Models Die." });
    }
}

module.exports = { predictImage, getModels, getStatus };
