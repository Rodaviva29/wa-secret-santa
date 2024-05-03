const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const sorteioRoutes = require('./routes/sorteio');
const configRoutes = require('./routes/config');

const app = express();
const PORT = 4943;

require('dotenv').config();

const blockHtmlFiles = (req, res, next) => {
  if (req.path.endsWith('.html')) {
      res.redirect('/');
  } else {
      next();
  }
};

app.use(blockHtmlFiles);

app.use(bodyParser.json());

app.use(
  session({
    secret: 'mySecretSessionKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes); 
app.use('/', sorteioRoutes); 
app.use('/', configRoutes);

app.listen(PORT, () => {
  console.log(`Active in http://localhost:${PORT}.`);
});
