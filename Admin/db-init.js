const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

const runAsync = (sql, params=[]) =>
  new Promise((resolve,reject)=>db.run(sql, params, function(err){ err?reject(err):resolve(this); }));

const seedDB = async () => {
  try {
    await runAsync('DROP TABLE IF EXISTS admins');
    await runAsync('DROP TABLE IF EXISTS leaders');

    await runAsync(`
      CREATE TABLE admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        displayName TEXT,
        email TEXT
      )
    `);

    const defaultPassword = await bcrypt.hash('admin',10);
    await runAsync(
      'INSERT INTO admins (username,password,displayName,email) VALUES (?,?,?,?)',
      ['admin', defaultPassword, 'Administrator', 'admin@ruhwehgcea.com']
    );

    await runAsync(`
      CREATE TABLE leaders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first TEXT,
        last TEXT,
        position TEXT,
        email TEXT
      )
    `);

    const leaders = [
      { first:'Samwel', last:'Ezekiel Odero', position:'Chairman', email:'samwel.oder@ruhwehgcea.com' },
      { first:'George', last:'Onyango', position:'Assistant Chair', email:'george.onyango@ruhwehgcea.com' },
      { first:'Timothy', last:'Oreta', position:'Secretary General', email:'timothy.oreta@ruhwehgcea.com' },
      { first:'Musa', last:'Kazi', position:'Deputy Secretary', email:'musa.kazi@ruhwehgcea.com' },
      { first:'Lucas', last:'Owino', position:'Treasurer', email:'lucas.owino@ruhwehgcea.com' }
    ];

    for(let l of leaders) {
      await runAsync('INSERT INTO leaders (first,last,position,email) VALUES (?,?,?,?)',
        [l.first,l.last,l.position,l.email]);
    }

    console.log('Database initialized successfully!');
    db.close();
  } catch(err) {
    console.error(err);
    db.close();
  }
};

seedDB();
