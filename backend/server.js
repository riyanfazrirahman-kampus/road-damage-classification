require("dotenv").config({
    path: `.env.${process.env.NODE_ENV || "development"}`
});
const express = require("express");
const cors = require("cors");
const path = require("path");
const favicon = require("serve-favicon");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));

// Import routes
const testApi = require("./routes/test.route");
const classificationRoute = require("./routes/classification.route");

// Routes
app.use("/api/test", testApi);
app.use("/api/classification", classificationRoute);

// Root endpoint
app.get('/', (req, res) => {
    res.render("index", {
        BASE_URL: process.env.BASE_URL
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`SERVER running on: http://localhost:${PORT}`);
});
