// db-init.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Open database (will create if not exists)
const dbPath = path.join(dataDir, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

// Async wrapper for convenience
const runAsync = (sql, params=[]) =>
  new Promise((resolve, reject) => db.run(sql, params, function(err){ err ? reject(err) : resolve(this); }));

const seedDB = async () => {
  try {
    // -------------------
    // Drop tables if they exist
    // -------------------
    await runAsync('DROP TABLE IF EXISTS admins');
    await runAsync('DROP TABLE IF EXISTS leaders');

    // -------------------
    // Create admins table
    // -------------------
    await runAsync(`
      CREATE TABLE admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        displayName TEXT,
        email TEXT
      )
    `);

    // Seed default admin
    const defaultPassword = await bcrypt.hash('admin', 10);
    await runAsync(
      'INSERT INTO admins (username,password,displayName,email) VALUES (?,?,?,?)',
      ['admin', defaultPassword, 'Administrator', 'admin@ruhwehgcea.com']
    );

    // -------------------
    // Create leaders table
    // -------------------
    await runAsync(`
      CREATE TABLE leaders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first TEXT,
        last TEXT,
        position TEXT,
        email TEXT
      )
    `);

    // Seed executive committee & advisors
    const leaders = [
      { first:'Samwel', last:'Ezekiel Odero', position:'Chairman', email:'samwel.oder@ruhwehgcea.com' },
      { first:'George', last:'Onyango', position:'Assistant Chair', email:'george.onyango@ruhwehgcea.com' },
      { first:'Timothy', last:'Oreta', position:'Secretary General', email:'timothy.oreta@ruhwehgcea.com' },
      { first:'Musa', last:'Kazi', position:'Deputy Secretary', email:'musa.kazi@ruhwehgcea.com' },
      { first:'Lucas', last:'Owino', position:'Treasurer', email:'lucas.owino@ruhwehgcea.com' },
      { first:'Yussuf', last:'Ooro Odongo', position:'Organizing Secretary', email:'yussuf.odongo@ruhwehgcea.com' },
      { first:'Samwel', last:'Okeyo', position:'Assistant Organizing Secretary', email:'samwel.okeyo@ruhwehgcea.com' },
      { first:'Eunice', last:'Were Ng’ani', position:'Internal Auditor', email:'eunice.ngani@ruhwehgcea.com' },
      { first:'Elmard', last:'Wara', position:'Finance Records', email:'elmard.wara@ruhwehgcea.com' },
      { first:'Turphosa', last:'Regina Adem', position:'Financial Advisor', email:'turphosa.adem@ruhwehgcea.com' },
      // Archbishops’ advisors
      { first:'Musa', last:'Kazi', position:'Archbishop Advisor', email:'musa.kazi@ruhwehgcea.com' },
      { first:'Alfayo', last:'Ng’ani', position:'Archbishop Advisor', email:'alfayo.ngani@ruhwehgcea.com' },
      { first:'Bishop', last:'Alfayo Bobo', position:'Archbishop Advisor', email:'bishop.bobo@ruhwehgcea.com' },
      { first:'George', last:'Onyango', position:'Archbishop Advisor', email:'george.onyango@ruhwehgcea.com' },
      { first:'Yussuf', last:'Ooro Odongo', position:'Archbishop Advisor', email:'yussuf.odongo@ruhwehgcea.com' },
      { first:'Sister', last:'Regina Auma', position:'Archbishop Advisor', email:'sister.auma@ruhwehgcea.com' },
      { first:'Samwel', last:'Odero', position:'Archbishop Advisor', email:'samwel.oder@ruhwehgcea.com' },
      { first:'Alfayo', last:'Onyuro', position:'Archbishop Advisor', email:'alfayo.onyuro@ruhwehgcea.com' },
      { first:'Isaiah', last:'Okwany', position:'Archbishop Advisor', email:'isaiah.okwany@ruhwehgcea.com' },
      { first:'Isaiah', last:'Otoyi', position:'Archbishop Advisor', email:'isaiah.otoyi@ruhwehgcea.com' }
    ];

    for (let l of leaders) {
      await runAsync('INSERT INTO leaders (first,last,position,email) VALUES (?,?,?,?)', [l.first, l.last, l.position, l.email]);
    }

    console.log('Database initialized successfully!');
    db.close();
  } catch (err) {
    console.error('Error initializing database:', err);
    db.close();
  }
};

seedDB();
