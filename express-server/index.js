const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// GET Route
app.get("/", (req, res) => {
    res.send("Welcome to Express Server!");
});

// GET Route
app.get("/about", (req, res) => {
    res.json({
        name: "Tirth",
        course: "Computer Engineering"
    });
});

// POST Route
app.post("/user", (req, res) => {
    const data = req.body;

    res.json({
        message: "User received successfully!",
        user: data
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});