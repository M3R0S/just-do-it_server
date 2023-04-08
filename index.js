const fs = require("fs");
const jsonServer = require("json-server");
const path = require("path");
const clone = require("clone");
const data = require("./db.json");

const server = jsonServer.create();

const router = jsonServer.router(clone(data), {
    _isFake: true,
});

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// Эндпоинт для логина
server.post("/login", (req, res) => {
    try {
        const { username, password } = req.body;
        const db = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, "db.json"), "UTF-8")
        );
        const { users = [] } = db;

        const userFromBd = users.find(
            (user) => user.username === username && user.password === password
        );

        if (userFromBd) {
            return res.json(userFromBd);
        }

        return res.status(403).json({ message: "User not found" });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: e.message });
    }
});

// проверяем, авторизован ли пользователь
server.use((req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ message: "AUTH ERROR" });
    }
    if (req.path !== "/") {
        router.db.setState(clone(data));
    }

    next();
});

server.use(router);

// запуск сервера
server.listen(8000, () => {
    console.log("server is running on 8000 port");
});
