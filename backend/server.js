require("dotenv").config({
    path: `.env.${process.env.NODE_ENV || "development"}`
});
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const testApi = require("./routes/test.route");
const classificationRoute = require("./routes/classification.route");

// Routes
app.use("/api/test", testApi);
app.use("/api/classification", classificationRoute);

// Root endpoint
app.get('/', (req, res) => {
    res.send({
        status: "success",
        message: "Selamat Datang di API Road Damage Clasification!",
        model_status: ""
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`SERVER running on: http://localhost:${PORT}`);
});
