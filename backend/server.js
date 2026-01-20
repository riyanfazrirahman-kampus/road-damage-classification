require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const classificationRoute = require("./routes/classification.route");

// Routes
app.use("/api/classification", classificationRoute);

// Root endpoint
app.get('/', (req, res) => {
    res.send({ status: "success", message: 'Selamat Datang di API Road Damage Clasification!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`SERVER running on: http://localhost:${PORT}`);
});
