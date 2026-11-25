const express = require('express');
const { users, documents, employees } = require('./data');

const app = express();
const PORT = 3000;

// Middleware для обробки JSON
app.use(express.json());

// --- MIDDLEWARE ---

// Аутентифікація користувача
const authMiddleware = (req, res, next) => {
    // Отримуємо логін та пароль із заголовків запиту
    const login = req.headers['x-login'];
    const password = req.headers['x-password'];

    // Шукаємо користувача
    const user = users.find(
        u => u.login === login && u.password === password
    );

    // Якщо користувача не знайдено
    if (!user) {
        return res.status(401).json({
            message: 'Authentication failed. Please provide valid credentials in headers X-Login and X-Password.'
        });
    }

    // Зберігаємо користувача в об'єкті запиту
    req.user = user;

    // Передаємо управління наступному обробнику
    next();
};

// Авторизація адміністратора
const adminOnlyMiddleware = (req, res, next) => {
    // Перевіряємо роль користувача
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin role required.'
        });
    }

    next();
};

// --- КІНЕЦЬ MIDDLEWARE ---

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
// Доступ тільки для адміністратора
app.get('/employees', authMiddleware, adminOnlyMiddleware, (req, res) => {
    res.status(200).json(employees);
});

// --- КІНЕЦЬ МАРШРУТІВ ---

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});