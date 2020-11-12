const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


const express = require('express');
const app = express();
const PORT = 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


const users = {
  "aaaa": {
    id: "aaaa",
    email: "a@a.com",
    password: "$2b$10$4vcj0i4jQ10Cf2mLS9d6muS3UHNhciJP5Xtsh.rB2j8xF1zJVcoeS"
  },
  "bbbb": {
    id: "bbbb",
    email: "b@b.com",
    password: "$2b$10$5iveLn/S2KdRArRYTkYFKezgWP5WQiYhX6WOzFcER1HyMADuIRA/."
  },
};
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", user_id: "aaaa"},
  "9sm5xK": {longURL: "http://www.google.com", user_id: "aaaa"}
};


app.set('view engine', 'ejs');


app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('user_registration', templateVars);
});
app.post('/register', (req, res) => {
  const email = req.body.email;
  const plainPassword = req.body.password;
  // If email or password are blank, return status 400
  if (!email || !plainPassword) {
    return res.status(400).send('<h3>Error:</h3><p>Email and Password must be non-empty</p>');
  }
  // If email already exists in DB, return status 400
  if (lookupUserByKey('email', email)) {
    return res.status(400).send(`<h3>Error:</h3><p><em>${email}</em> is already registered</p>`);
  }
  // Generate new id, hash password, then add this new user object to users
  const id = generateRandomString(4);
  const password = bcrypt.hashSync(plainPassword, 10);
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  res.render('login', {user: undefined});
});
app.post('/login', (req, res) =>{
  const email = req.body.email;
  const plainPassword = req.body.password;
  // If email or password are blank, return status 400
  if (!email || !plainPassword) {
    return res.status(400).send('<h3>Error:</h3><p>Email and Password must be non-empty</p>');
  }
  // Confirm user exists
  user = lookupUserByKey('email', email);
  if (!user) {
    return res.status(403).send('<h3>Error:</h3><p>User account not found</p>');
  }
  // Confirm password is correct
  if (!bcrypt.compareSync(plainPassword, user.password)) {
    return res.status(403).send('<h3>Error:</h3><p>Permission denied</p>');
  }
  const id = user.id;
  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});
app.get('/urls', (req, res) => {
  // Log to console current status of both databases
  console.log(users);
  console.log(JSON.stringify(urlDatabase, null, 2));
  
  const user = users[req.session.user_id];
  if (!user) {
    return res.render('urls_index', {urls: undefined, user: undefined});
  }
  const templateVars = {
    urls: urlsForUser(user.id),
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});
app.post('/urls', (req, res) => {
  // Add longURL from req.body to urlDatabase with key = new random string length 6
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, user_id: req.session.user_id };
  /* Preferred behaviour: redirect to /urls after new url creation */
  // res.redirect(`/urls/${shortURL}`)
  res.redirect(`/urls/`);
});

app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(304).redirect('/login');
  }
  res.render('urls_new', {'user': user});
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  // If user not logged in, redirect to login
  if (!user) {
    return res.status(304).redirect('/login');
  }
  const usersShortURLs = Object.keys(urlsForUser(user.id));
  // If user does not 'own' this shortURL return 401
  if (!usersShortURLs.includes(req.params.shortURL)) {
    return res.status(401).send(`
      <h3>401: Unauthorised</h3>
      <p>You do not have permission to edit this record</p>`);
  }
  // User owns this shortURL, proceed with edit GET
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render('urls_show', templateVars);
});
app.post('/urls/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  const usersShortURLs = Object.keys(urlsForUser(user.id));
  // If user does not 'own' this shortURL return 401
  if (!usersShortURLs.includes(req.params.shortURL)) {
    return res.status(401).send('401: Unauthorised. You do not have permission to edit this record');
  }
  // User owns this shortURL, proceed with edit POST
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session.user_id];
  const usersShortURLs = Object.keys(urlsForUser(user.id));
  // If user does not 'own' this shortURL return 401
  if (!usersShortURLs.includes(req.params.shortURL)) {
    return res.status(401).send('401: Unauthorised. You do not have permission to delete this record');
  }
  // User owns this shortURL, proceed with delete POST
  delete urlDatabase[req.params.shortURL];
  return res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const urlObj = urlDatabase[req.params.shortURL];
  if (urlObj) {
    return res.redirect(urlObj.longURL);
  }
  res.status(404).send(`
    <h3>404: Page Not Found</h3>
    <p>ShortURL <strong>u/${req.params.shortURL}</strong> does not exist.</p>`);
});

// TODO: should below be .use or .get?
app.use(function(req, res, next) {
  return res.status(404).send(`<h3>404: Page Not Found</h3>`);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});


const generateRandomString = (length) => {
  return Math.random().toString(36).substring(2, length + 2);
};

// Allow DB lookup by key (email or id), return {user} if user[key] matches confirmValue
const lookupUserByKey = (key, confirmValue) => {
  for (const user of Object.values(users)) {
    if (user[key] === confirmValue) {
      return user;
    }
  }
  return;
};

const urlsForUser = (id) => {
  const userUrls = {};
  for (const [shortURL, urlObj] of Object.entries(urlDatabase)) {
    if (urlObj.user_id === id) {
      userUrls[shortURL] = urlObj;
    }
  }
  return userUrls;
};