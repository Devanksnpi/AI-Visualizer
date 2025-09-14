const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  initialize() {
    return new Promise((resolve, reject) => {
      try {
        // Create database file in the data directory
        const dbPath = path.join(__dirname, 'ai_visualizer.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error('❌ Database connection failed:', err);
            reject(err);
            return;
          }
          
          console.log('✅ Connected to SQLite database');
          
          // Create tables
          this.createTables()
            .then(() => {
              console.log('✅ Database initialized successfully');
              resolve();
            })
            .catch(reject);
        });
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        reject(error);
      }
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      const tables = [
        // Chat sessions table (simplified without user authentication)
        `CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Questions table
        `CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          question TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
        )`,
        
        // Answers table
        `CREATE TABLE IF NOT EXISTS answers (
          id TEXT PRIMARY KEY,
          question_id TEXT NOT NULL,
          text TEXT NOT NULL,
          visualization TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
        )`,
        
        // Create indexes for better performance
        `CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions (session_id)`,
        `CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers (question_id)`
      ];

      let completed = 0;
      const total = tables.length;

      tables.forEach(sql => {
        this.db.exec(sql, (err) => {
          if (err) {
            console.error('Error creating table:', err);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            resolve();
          }
        });
      });
    });
  }

  // Chat session management (simplified without user authentication)
  createChatSession(title = 'New Chat') {
    return new Promise((resolve, reject) => {
      const id = require('uuid').v4();
      const sql = `INSERT INTO chat_sessions (id, title) VALUES (?, ?)`;
      
      this.db.run(sql, [id, title], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id, title, createdAt: new Date().toISOString() });
      });
    });
  }

  getChatSessions() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT cs.*, 
               COUNT(q.id) as question_count,
               MAX(q.created_at) as last_activity
        FROM chat_sessions cs
        LEFT JOIN questions q ON cs.id = q.session_id
        GROUP BY cs.id
        ORDER BY cs.updated_at DESC
      `;
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  getChatSession(sessionId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM chat_sessions WHERE id = ?`;
      
      this.db.get(sql, [sessionId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  updateChatSession(sessionId, title) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE chat_sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      this.db.run(sql, [title, sessionId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  deleteChatSession(sessionId) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM chat_sessions WHERE id = ?`;
      
      this.db.run(sql, [sessionId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }

  // Question and answer management
  createQuestion(sessionId, question) {
    return new Promise((resolve, reject) => {
      const id = require('uuid').v4();
      const sql = `INSERT INTO questions (id, session_id, question) VALUES (?, ?, ?)`;
      
      this.db.run(sql, [id, sessionId, question], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Update session timestamp
        const updateSql = `UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        databaseService.db.run(updateSql, [sessionId], (updateErr) => {
          if (updateErr) {
            console.error('Error updating session timestamp:', updateErr);
          }
        });
        
        resolve({ id, sessionId, question, createdAt: new Date().toISOString() });
      });
    });
  }

  createAnswer(questionId, text, visualization) {
    return new Promise((resolve, reject) => {
      const id = require('uuid').v4();
      const sql = `INSERT INTO answers (id, question_id, text, visualization) VALUES (?, ?, ?, ?)`;
      
      this.db.run(sql, [id, questionId, text, JSON.stringify(visualization)], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id, questionId, text, visualization, createdAt: new Date().toISOString() });
      });
    });
  }

  getQuestionsBySession(sessionId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT q.*, a.id as answer_id, a.text as answer_text, a.visualization
        FROM questions q
        LEFT JOIN answers a ON q.id = a.question_id
        WHERE q.session_id = ?
        ORDER BY q.created_at ASC
      `;
      
      this.db.all(sql, [sessionId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const questions = rows.map(row => ({
          id: row.id,
          question: row.question,
          createdAt: row.created_at,
          answer: row.answer_id ? {
            id: row.answer_id,
            text: row.answer_text,
            visualization: JSON.parse(row.visualization),
            createdAt: row.created_at
          } : null
        }));
        
        resolve(questions);
      });
    });
  }

  getQuestionById(questionId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT q.*, a.id as answer_id, a.text as answer_text, a.visualization
        FROM questions q
        LEFT JOIN answers a ON q.id = a.question_id
        WHERE q.id = ?
      `;
      
      this.db.get(sql, [questionId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }
        
        const question = {
          id: row.id,
          sessionId: row.session_id,
          question: row.question,
          createdAt: row.created_at,
          answer: row.answer_id ? {
            id: row.answer_id,
            text: row.answer_text,
            visualization: JSON.parse(row.visualization),
            createdAt: row.created_at
          } : null
        };
        
        resolve(question);
      });
    });
  }

  getAnswerById(answerId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT a.*, q.question, q.session_id
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.id = ?
      `;
      
      this.db.get(sql, [answerId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }
        
        const answer = {
          id: row.id,
          questionId: row.question_id,
          question: row.question,
          sessionId: row.session_id,
          text: row.text,
          visualization: JSON.parse(row.visualization),
          createdAt: row.created_at
        };
        
        resolve(answer);
      });
    });
  }

  // Cleanup old data
  cleanupOldData(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    return new Promise((resolve, reject) => {
      const cutoffDate = new Date(Date.now() - maxAge).toISOString();
      
      const sql = `DELETE FROM chat_sessions WHERE updated_at < ?`;
      
      this.db.run(sql, [cutoffDate], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`🧹 Cleaned up ${this.changes} old chat sessions`);
        resolve();
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;