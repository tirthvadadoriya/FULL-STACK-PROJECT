const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const blogPosts = [
    {
        id: 1,
        title: "On keeping a slow notebook",
        author: "Marginalia",
        date: "2026-07-20",
        summary: "Why a page that fills in slowly is more useful than one that fills in fast.",
        body: "A slow notebook gives space to notice what matters rather than chasing every idea into a polished thought.",
        tags: ["Notes"],
        status: "published",
        createdAt: "2026-07-20T09:00:00.000Z"
    },
    {
        id: 2,
        title: "Three questions worth re-asking",
        author: "Marginalia",
        date: "2026-07-11",
        summary: "A short list I return to whenever a plan starts to feel certain.",
        body: "Some questions become more useful the longer they sit with you, especially when a plan is beginning to feel too settled.",
        tags: ["Life"],
        status: "published",
        createdAt: "2026-07-11T09:00:00.000Z"
    },
    {
        id: 3,
        title: "Reading in the margins",
        author: "Marginalia",
        date: "2026-06-29",
        summary: "Notes on annotating books without ruining them for the next reader.",
        body: "Margins are the best place to keep a conversation with a book without trying to replace it.",
        tags: ["Reading"],
        status: "published",
        createdAt: "2026-06-29T09:00:00.000Z"
    },
    {
        id: 4,
        title: "Full stack development",
        author: "Tirth Vadadoriya",
        date: "2026-07-28",
        summary: "a short, punchy 2-to-3 sentence overview at the top of a resume that highlights your core tech stack, years of experience, and top professional achievements",
        body: "Full stack development involves building both the client-side user interface and the server-side backend. Key components include frontend design, backend logic, and database management.\nCore Front-End Technologies\nHTML/CSS: Structure and style web pages.\nJavaScript: Add interactive features and dynamic behavior.\nFrameworks: Use tools like React, Angular, or Vue.js.\nCore Back-End Technologies\nRuntimes/Languages: Run server code with Node.js, Python, Java, or PHP.\nFrameworks: Build APIs using Express, Django, or Spring.\nDatabases: Store data using MySQL, PostgreSQL, or MongoDB.\nEssential ToolsVersion Control: Track code changes using Git and GitHub.\nDeployment: Launch apps via cloud services like AWS.",
        tags: ["Notes", "Reading"],
        status: "published",
        createdAt: "2026-07-28T14:32:47.008Z"
    },
    {
        id: 5,
        title: "Full stack development",
        author: "Tirth Vadadoriya",
        date: "2026-07-28",
        summary: "a short, punchy 2-to-3 sentence overview at the top of a resume that highlights your core tech stack, years of experience, and top professional achievements",
        body: "Full stack development involves building both the client-side user interface and the server-side backend. Key components include frontend design, backend logic, and database management.Core Front-End TechnologiesHTML/CSS: Structure and style web pages.JavaScript: Add interactive features and dynamic behavior.Frameworks: Use tools like React, Angular, or Vue.js.Core Back-End TechnologiesRuntimes/Languages: Run server code with Node.js, Python, Java, or PHP.Frameworks: Build APIs using Express, Django, or Spring.Databases: Store data using MySQL, PostgreSQL, or MongoDB.Essential ToolsVersion Control: Track code changes using Git and GitHub.Deployment: Launch apps via cloud services like AWS.",
        tags: ["Notes", "Reading"],
        status: "published",
        createdAt: "2026-07-28T14:33:54.129Z"
    }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));
// log incoming requests for debugging
app.use((req, res, next) => {
    console.log('REQ', req.method, req.path);
    next();
});
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.get(["/", "/index.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/about", (req, res) => {
    res.json({
        name: "Tirth",
        course: "Computer Engineering"
    });
});

function registerBlogRoutes(app, basePath = "/blogs") {
    app.get([basePath, `${basePath}/`], (req, res) => {
        res.json({
            count: blogPosts.length,
            posts: blogPosts
        });
    });

    app.get(`${basePath}/debug`, (req, res) => {
        res.json({
            route: `${basePath}/debug`,
            postIds: blogPosts.map((entry) => entry.id),
            count: blogPosts.length
        });
    });

    app.post(`${basePath}/update`, (req, res) => {
        const { id, title, author, date, summary, body, tags, status } = req.body;
        const postId = Number(id);
        const index = blogPosts.findIndex((entry) => entry.id === postId);

        if (index === -1) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        if (!title || !author || !date || !body) {
            return res.status(400).json({ message: 'Title, author, date, and body are required.' });
        }

        const updatedPost = Object.assign({}, blogPosts[index], {
            title: title.trim(),
            author: author.trim(),
            date: date.trim(),
            summary: summary ? summary.trim() : '',
            body: body.trim(),
            tags: Array.isArray(tags) ? tags : [],
            status: status || blogPosts[index].status,
            updatedAt: new Date().toISOString()
        });

        blogPosts[index] = updatedPost;

        res.json({ message: 'Blog post updated successfully!', post: updatedPost });
    });

    app.get(`${basePath}/:id`, (req, res) => {
        const postId = Number(req.params.id);
        const post = blogPosts.find((entry) => entry.id === postId);

        if (!post) {
            return res.status(404).json({
                message: "Blog post not found."
            });
        }

        res.json({
            post: post
        });
    });

    app.delete(`${basePath}/:id`, (req, res) => {
        const postId = Number(req.params.id);
        const index = blogPosts.findIndex((entry) => entry.id === postId);

        if (index === -1) {
            return res.status(404).json({ message: "Blog post not found." });
        }

        const [deletedPost] = blogPosts.splice(index, 1);

        res.json({
            message: "Blog post deleted successfully!",
            deletedPost: deletedPost
        });
    });

    app.put(`${basePath}/:id`, (req, res) => {
        const postId = Number(req.params.id);
        const index = blogPosts.findIndex((entry) => entry.id === postId);

        if (index === -1) {
            return res.status(404).json({ message: "Blog post not found." });
        }

        const { title, author, date, summary, body, tags, status } = req.body;

        if (!title || !author || !date || !body) {
            return res.status(400).json({
                message: "Title, author, date, and body are required."
            });
        }

        const updatedPost = Object.assign({}, blogPosts[index], {
            title: title.trim(),
            author: author.trim(),
            date: date.trim(),
            summary: summary ? summary.trim() : "",
            body: body.trim(),
            tags: Array.isArray(tags) ? tags : [],
            status: status || blogPosts[index].status,
            updatedAt: new Date().toISOString()
        });

        blogPosts[index] = updatedPost;

        res.json({
            message: "Blog post updated successfully!",
            post: updatedPost
        });
    });

    app.post(`${basePath}/:id`, (req, res) => {
        const postId = Number(req.params.id);
        const index = blogPosts.findIndex((entry) => entry.id === postId);

        if (index === -1) {
            return res.status(404).json({ message: "Blog post not found." });
        }

        const { title, author, date, summary, body, tags, status } = req.body;

        if (!title || !author || !date || !body) {
            return res.status(400).json({
                message: "Title, author, date, and body are required."
            });
        }

        const updatedPost = Object.assign({}, blogPosts[index], {
            title: title.trim(),
            author: author.trim(),
            date: date.trim(),
            summary: summary ? summary.trim() : "",
            body: body.trim(),
            tags: Array.isArray(tags) ? tags : [],
            status: status || blogPosts[index].status,
            updatedAt: new Date().toISOString()
        });

        blogPosts[index] = updatedPost;

        res.json({
            message: "Blog post updated successfully!",
            post: updatedPost
        });
    });

    app.post(basePath, (req, res) => {
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
}

registerBlogRoutes(app, "/blogs");
registerBlogRoutes(app, "/api/blogs");

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Debug: list registered routes (method + path)
try {
    const routes = [];
    app._router.stack.forEach(function (middleware) {
        if (middleware.route) { // routes registered directly on the app
            const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
            routes.push(methods + ' ' + middleware.route.path);
        } else if (middleware.name === 'router') { // router middleware
            middleware.handle.stack.forEach(function (handler) {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
                    routes.push(methods + ' ' + handler.route.path);
                }
            });
        }
    });
    console.log('Registered routes:\n' + routes.join('\n'));
} catch (e) {
    console.error('Could not list routes', e);
}