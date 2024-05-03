const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const { isAuthenticated } = require('../helpers/middleware');
const { encrypt, decrypt } = require('../helpers/encryption');

const realizarSorteio = (users) => {
  let shuffledUsers = [...users];
  let sorteioValido = false;

  while (!sorteioValido) {
    sorteioValido = true;

    for (let i = shuffledUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]];
    }

    for (let i = 0; i < shuffledUsers.length; i++) {
      const nextIndex = (i + 1) % shuffledUsers.length;
      shuffledUsers[i].friend = shuffledUsers[nextIndex].username;

      if (shuffledUsers[i].friend === shuffledUsers[i].username) {
        sorteioValido = false;
      }
    }
  }

  return shuffledUsers;
};

router.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

router.post('/sortear', (req, res) => {
  const usersPath = path.join(__dirname, '../data/users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  const sorteados = realizarSorteio(users);

  // Encriptation
  sorteados.forEach((user) => {
    user.friend = encrypt(user.friend, 'mySecretKey');
  });

  fs.writeFileSync(usersPath, JSON.stringify(sorteados, null, 2));

  // Desencriptation
  sorteados.forEach((user) => {
    user.friend = decrypt(user.friend, 'mySecretKey');

    axios.post(
        'https://graph.facebook.com/v19.0/336126729578648/messages',
        {
          messaging_product: 'whatsapp',
          to: `${user.phone}`,
          type: 'template',
          template: {
            name: `${process.env.WA_API_TOKEN}`,
            language: { code: `${process.env.WA_TEMPLATE_LANGUAGE}` },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: `${user.username}`,
                  },
                  {
                    type: 'text',
                    text: `${user.friend}`,
                  },
                ],
              },
            ],
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WA_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        console.log('Message sent with success.', response.data);
      })
      .catch((error) => {
        console.error('Error sending message:', error.message);
      });
  });

  res.send('The request was sent with success.');
});

module.exports = router;
