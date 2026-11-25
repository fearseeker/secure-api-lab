const express = require('express');
const { users, documents, employees } = require('./data');

const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---

// Логування запитів
const loggingMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;

    console.log(`[${timestamp}] ${method} ${url}`);

    next();
};

// Аутентифікація користувача
const authMiddleware = (req, res, next) => {
    const login = req.headers['x-login'];
    const password = req.headers['x-password'];

    const user = users.find(
        u => u.login === login && u.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: 'Authentication failed. Please provide valid credentials in headers X-Login and X-Password.'
        });
    }

    req.user = user;

    next();
};

// Авторизація адміністратора
const adminOnlyMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin role required.'
        });
    }

    next();
};

// --- ГЛОБАЛЬНІ MIDDLEWARE ---

app.use(express.json());
app.use(loggingMiddleware);

// --- МАРШРУТИ ДЛЯ РЕСУРСІВ ---

// Отримання списку документів
app.get('/documents', authMiddleware, (req, res) => {
    res.status(200).json(documents);
});

// Створення нового документа
app.post('/documents', authMiddleware, (req, res) => {
    const newDocument = req.body;

    newDocument.id = Date.now();
    documents.push(newDocument);

    res.status(201).json(newDocument);
});

// Отримання списку співробітників
app.get('/employees', authMiddleware, adminOnlyMiddleware, (req, res) => {
    res.status(200).json(employees);
});

// --- ЗАПУСК СЕРВЕРА ---

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});