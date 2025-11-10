const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./data/db.sqlite');
const JWT_SECRET = 'replace_this_with_a_long_random_secret';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --------------------
// Authentication
// --------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, user) => {
    if(err) return res.status(500).json({ error: 'DB error' });
    if(!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });

    console.log(`[LOGIN] Admin ${username} logged in at ${new Date().toLocaleString()}`);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, displayName: user.displayName, email: user.email });
  });
});

// Middleware to protect routes
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err) return res.status(401).json({ error: 'Invalid token' });
    req.admin = payload;
    next();
  });
}

// Change password
app.post('/api/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  db.get('SELECT * FROM admins WHERE id = ?', [req.admin.id], async (err, user) => {
    if(err) return res.status(500).json({ error: 'DB error' });
    const ok = await bcrypt.compare(oldPassword, user.password);
    if(!ok) return res.status(400).json({ error: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE admins SET password = ? WHERE id = ?', [hashed, req.admin.id], function(err){
      if(err) return res.status(500).json({ error: 'Could not update password' });
      console.log(`[PASSWORD] Admin ${req.admin.username} changed password at ${new Date().toLocaleString()}`);
      res.json({ success: true });
    });
  });
});

// Create new admin (superadmin only)
app.post('/api/admins', authMiddleware, async (req,res)=>{
  const { username, password, displayName, email } = req.body;
  if(!username || !password || !displayName || !email)
    return res.status(400).json({error:'All fields required'});

  try {
    const hash = await bcrypt.hash(password,10);
    db.run('INSERT INTO admins (username,password,displayName,email) VALUES (?,?,?,?)',
      [username,hash,displayName,email],
      function(err){
        if(err){
          if(err.message.includes('UNIQUE')) return res.status(400).json({error:'Username/email already exists'});
          return res.status(500).json({error:'DB error'});
        }
        console.log(`[ADMIN] New admin ${username} created by ${req.admin.username}`);
        res.json({id:this.lastID});
      });
  } catch(err){
    res.status(500).json({error:'Server error'});
  }
});


// Leader management
app.get('/api/leaders', authMiddleware, (req,res)=>{
  db.all('SELECT * FROM leaders',[],(err,rows)=>{
    if(err) return res.status(500).json({error:'DB error'});
    res.json(rows);
  });
});

app.post('/api/leaders', authMiddleware, (req,res)=>{
  const { first, last, position, email } = req.body;
  db.run('INSERT INTO leaders (first,last,position,email) VALUES (?,?,?,?)', [first,last,position,email], function(err){
    if(err) return res.status(500).json({error:'DB error'});
    console.log(`[LEADER] Admin ${req.admin.username} added leader ${first} ${last} at ${new Date().toLocaleString()}`);
    res.json({ id: this.lastID });
  });
});

app.put('/api/leaders/:id', authMiddleware, (req,res)=>{
  const { id } = req.params;
  const { first,last,position,email } = req.body;
  db.run('UPDATE leaders SET first=?,last=?,position=?,email=? WHERE id=?', [first,last,position,email,id], function(err){
    if(err) return res.status(500).json({error:'DB error'});
    console.log(`[LEADER] Admin ${req.admin.username} updated leader ${id} at ${new Date().toLocaleString()}`);
    res.json({ changes: this.changes });
  });
});

const nodemailer = require('nodemailer');
const crypto = require('crypto');

let resetTokens = {}; // store { token: { userId, expires } } temporarily

// Configure transporter (example: Gmail)
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{ user:'yourgmail@gmail.com', pass:'yourapppassword' }
});

// Request password reset
app.post('/api/forgot-password', (req,res)=>{
  const { email } = req.body;
  if(!email) return res.status(400).json({error:'Email required'});
  db.get('SELECT id FROM admins WHERE email=?',[email],(err,user)=>{
    if(err) return res.status(500).json({error:'DB error'});
    if(!user) return res.status(400).json({error:'No admin with that email'});

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour
    resetTokens[token] = { userId: user.id, expires };

    const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
    transporter.sendMail({
      from:'yourgmail@gmail.com',
      to: email,
      subject:'Ruhwehgcea Admin Password Reset',
      html:`Click <a href="${resetLink}">here</a> to reset your password (1 hour valid).`
    }, (err,info)=>{
      if(err) console.error(err);
      res.json({message:'Password reset email sent'});
    });
  });
});

// Reset password endpoint
app.post('/api/reset-password', async (req,res)=>{
  const { token, newPassword } = req.body;
  const entry = resetTokens[token];
  if(!entry) return res.status(400).json({error:'Invalid token'});
  if(Date.now()>entry.expires) return res.status(400).json({error:'Token expired'});

  try{
    const hash = await bcrypt.hash(newPassword,10);
    db.run('UPDATE admins SET password=? WHERE id=?',[hash,entry.userId], function(err){
      if(err) return res.status(500).json({error:'DB error'});
      delete resetTokens[token];
      console.log(`[PASSWORD] Admin ${entry.userId} reset password via token`);
      res.json({success:true});
    });
  }catch(err){
    res.status(500).json({error:'Server error'});
  }
});


// Public leaders (emails hidden)
app.get('/public/leaders',(req,res)=>{
  db.all('SELECT id,first,last,position FROM leaders',[],(err,rows)=>{
    if(err) return res.status(500).json({error:'DB error'});
    res.json(rows);
  });
});

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
