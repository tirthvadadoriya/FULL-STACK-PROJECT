const express = require("express");

const app = express();
const PORT = 3000;

const blogPosts = [];

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.get("/", (req, res) => {
    res.send("Welcome to Express Server!");
});

app.get("/about", (req, res) => {
    res.json({
        name: "Tirth",
        course: "Computer Engineering"
    });
});

app.get("/blogs", (req, res) => {
    res.json({
        count: blogPosts.length,
        posts: blogPosts
    });
});

app.post("/blogs", (req, res) => {
    const { title, author, date, summary, body, tags, status } = req.body;

    if (!title || !author || !date || !body) {
        return res.status(400).json({
            message: "Title, author, date, and body are required."
        });
    }

    const newPost = {
        id: blogPosts.length + 1,
        title: title.trim(),
        author: author.trim(),
        date: date.trim(),
        summary: summary ? summary.trim() : "",
        body: body.trim(),
        tags: Array.isArray(tags) ? tags : [],
        status: status || "draft",
        createdAt: new Date().toISOString()
    };

    blogPosts.push(newPost);

    res.status(201).json({
        message: "Blog post created successfully!",
        post: newPost
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});