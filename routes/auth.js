const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');

const adminsPath = path.join(__dirname, '../data/admin.json');
const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const admin = admins.find((a) => a.username === username);
   
  if (admin && admin.password === password) {
    req.session.isLoggedIn = true; 
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Username or Password is incorrect.'});
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('An error occurred while logging out.');
    }
    res.redirect('/');
  });
});

module.exports = router;
