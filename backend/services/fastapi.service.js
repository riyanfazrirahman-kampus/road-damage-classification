require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const FASTAPI_PORT = process.env.FASTAPI_PORT
const FASTAPI_URL = process.env.FASTAPI_URL || `http://localhost:${FASTAPI_PORT}`;


async function getStatusModel() {
    for (let i = 0; i < 3; i++) {
        try {
            const res = await axios.get(FASTAPI_URL, { timeout: 60000 });
            return res.data;
        } catch (err) {
            console.log("Retry:", i + 1);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    throw new Error("FastAPI not responding");
}

async function getModelsAvailable() {
    const response = await axios.get(FASTAPI_URL + `models`, {
        timeout: 30000,
    });

    return response.data;
}

async function sendToFastAPI({ file, model_name }) {
    const formData = new FormData();

    formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

    formData.append("model_name", model_name);

    const response = await axios.post(FASTAPI_URL + `predict`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000,
    });

    return response.data;
}

module.exports = { sendToFastAPI, getModelsAvailable, getStatusModel };
