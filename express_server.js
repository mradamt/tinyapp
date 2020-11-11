const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const express = require('express');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  "abc1": {
    id: "abc1",
    email: "email@email.com",
    password: "passwordle"
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('user_registration', templateVars);
});

app.post('/register', (req, res) => {
  const eml = req.body.email;
  const pw = req.body.password;
  // If email or password are blank, return status 400
  if (eml === '' || pw === '') {
    res.status(400).send('<h3>Error:</h3><p>Email and Password must be non-empty</p>')
  }
  // If email already exists in DB, return status 400
  if (checkUsersKeyVal('email', eml)) {
    res.status(400).send(`<h3>Error:</h3><p><em>${eml}</em> is already registered</p>`)
    console.log('heyhyhehahahahahhahahahaah')
  }
  // For this app we are unlikely to see more than 36^4 users, so id length = 4
  const user_id = generateRandomString(4);
  users[user_id] = {
    id: user_id,
    email: eml,
    password: pw,
  };
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});

app.post('/login', (req, res) =>{
  res.cookie('user_id', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  console.log(users);
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  // Add longURL from req.body to urlDatabase with key = new random string length 6
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  /* Preferred behaviour: redirect to /urls after new url creation */
  // res.redirect(`/urls/${shortURL}`)
  res.redirect(`/urls/`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  }
  res.status(404).send(`<h3>404: Page Not Found</h3><p>ShortURL <em>u/${req.params.shortURL}</em> does not exist.</p>`);
});

// TODO: should below be .use or .get?
app.use(function(req, res, next) {
  return res.status(404).send(`<h3>404: Page Not Found</h3>`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


const generateRandomString = (length) => {
  return Math.random().toString(36).substring(2, length + 2);
};

const checkUsersKeyVal = (key, value) => {
  for (const user of Object.values(users)) {
    if (user[key] === value) {
      return true;
    }
  }
  return false;
};