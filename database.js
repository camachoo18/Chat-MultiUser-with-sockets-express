const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Cambiar a una base de datos basada en archivo
const db = new sqlite3.Database('./chat.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, username TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

function saveMessage(username, message, callback) {
    const messageId = uuidv4();
    db.run("INSERT INTO messages (id, username, message) VALUES (?, ?, ?)", [messageId, username, message], (err) => {
        if (err) {
            return callback(err);
        }
        callback(null, { id: messageId, username, message });
    });
}

function getAllMessages(callback) {
    db.all("SELECT * FROM messages ORDER BY timestamp", [], (err, rows) => {
        if (err) {
            return callback(err);
        }
        callback(null, rows);
    });
}

module.exports = {
    saveMessage,
    getAllMessages
};