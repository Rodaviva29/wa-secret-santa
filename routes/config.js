const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');

const { isAuthenticated } = require('../helpers/middleware');

router.get('/configuration', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'configuration.html'));
});

function loadUsers() {
  try {
    const data = fs.readFileSync(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error(e);
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  }
}

router.get('/users', (req, res) => {
  const users = loadUsers();
  res.json(users);
});

router.post('/users', (req, res) => {
  const { username, phone } = req.body;
  if (!username || !phone) {
    return res.status(400).send('Invalid data.');
  }

  const users = loadUsers();
  users.push({ username, phone, friend: null });
  saveUsers(users);

  res.status(201).send('Friend added sucessfully.');
});

router.put('/users/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { username } = req.body;

  const users = loadUsers();
  if (index < 0 || index >= users.length) {
    return res.status(400).send('Friend not found.');
  }

  users[index].username = username;
  saveUsers(users);

  res.send('Friend name updated successfully.');
});

router.delete('/users/:index', (req, res) => {
  const index = parseInt(req.params.index);

  const users = loadUsers();
  if (index < 0 || index >= users.length) {
    return res.status(400).send('Friend not found.');
  }

  users.splice(index, 1);
  saveUsers(users);

  res.send('Friend removed successfully.');
});

module.exports = router;
