const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../financeiro.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao conectar ao banco:', err.message);
    else console.log('Conectado ao banco de dados SQLite.');
});

db.serialize(() => {
    // 1. Tabela de Usuários (COM A NOVA COLUNA monthly_income)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            monthly_income REAL DEFAULT 0 -- Nova Coluna
        )
    `);

    // 2. Contas
    db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            balance REAL DEFAULT 0,
            is_fixed INTEGER DEFAULT 0, 
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    // 3. Categorias
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            icon TEXT, 
            type TEXT NOT NULL, 
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    // 4. Cartões
    db.run(`
        CREATE TABLE IF NOT EXISTS credit_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            closing_day INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    // 5. Transações
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER,
            description TEXT,
            amount REAL NOT NULL,
            type TEXT NOT NULL, 
            date TEXT NOT NULL,
            origin_type TEXT NOT NULL,
            origin_id INTEGER NOT NULL,
            is_fixed INTEGER DEFAULT 0,
            attachment_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(category_id) REFERENCES categories(id)
        )
    `);
});

module.exports = db;