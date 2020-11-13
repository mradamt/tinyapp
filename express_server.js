// External modules
const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
// Internal modules
const { generateRandomString, lookupUserByKey, urlsForUser } = require('./helpers');

// Setup Express 'app'
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['aeb7', 'l92b']
}));
app.use(methodOverride('_method'));

// Define dummy databases
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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca", 
    user_id: "aaaa", 
    uniqueVisits: 0,
    visitorCount: 0,
    visits: {}
  },
  "9sm5xK": {
    longURL: "http://www.google.com", 
    user_id: "aaaa", 
    uniqueVisits: 0,
    visitorCount: 0,
    visits: {}
  },
};


/* Define routes (sorted by route then method) */
// REGISTER PAGE
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  // If user is logged in, redirect to /urls
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('user_registration', templateVars);
});
// POST: REGISTER NEW USER
app.post('/register', (req, res) => {
  const email = req.body.email;
  const plainPassword = req.body.password;
  // If email or password are blank, return status 400
  if (!email || !plainPassword) {
    return res.status(400).send('<h3>Error:</h3><p>Email and Password must be non-empty</p>');
  }
  // If email already exists in DB, return status 400
  if (lookupUserByKey(users, 'email', email)) {
    return res.status(400).send(`<h3>Error:</h3><p><em>${email}</em> is already registered</p>`);
  }
  // Generate new id, hash password, then add this new user object to users
  const id = generateRandomString(4);
  const password = bcrypt.hashSync(plainPassword, 10);
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect('/urls');
});


// LOGIN PAGE
app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  // If user is logged in, redirect to /urls
  if (user) {
    return res.redirect('/urls');
  }
  res.render('login', {user: undefined});
});
// POST: USER LOGIN AND AUTHENTICATION
app.post('/login', (req, res) =>{
  const email = req.body.email;
  const plainPassword = req.body.password;
  // If email or password are blank, return status 400
  if (!email || !plainPassword) {
    return res.status(400).send('<h3>Error:</h3><p>Email and Password must be non-empty</p>');
  }
  // Confirm user exists
  user = lookupUserByKey(users, 'email', email);
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
// POST: LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


// REDIRECT FROM '/'
app.get('/', (req, res) => {
  // If user not logged in, redirect to /login
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});
// LIST USER'S URLS
app.get('/urls', (req, res) => {
  console.log(urlDatabase)
  // console.log(users)

  // If user not logged in, render urls_index with undefined templateVars
  const user = users[req.session.user_id];
  if (!user) {
    return res.render('urls_index', {urls: undefined, user: undefined});
  }
  const templateVars = {
    urls: urlsForUser(urlDatabase, user.id),
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});
// POST: GENERATE NEW URL
app.post('/urls', (req, res) => {
  const user = users[req.session.user_id];
  // If user not logged in, return status 401
  if (!user) {
    return res.status(401).send(`
      <h3>401: Unauthorised</h3>
      <p>You do not have permission to perform this action</p>`);
  }
  // Add longURL from req.body to urlDatabase with key = new random string length 6
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, user_id: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});


// PAGE TO CREATE NEW URL
app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(304).redirect('/login');
  }
  res.render('urls_new', {'user': user});
});


// EDIT EXISTING URL
app.get('/urls/:shortURL', (req, res) => {
  // If user not logged in, return status 401
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send(`
      <h3>401: Unauthorised</h3>
      <p>You do not have permission to edit this record</p>`);
  }
  // If user does not 'own' this shortURL return 401
  const usersShortURLs = Object.keys(urlsForUser(urlDatabase, user.id));
  if (!usersShortURLs.includes(req.params.shortURL)) {
    return res.status(401).send(`
      <h3>401: Unauthorised</h3>
      <p>You do not have permission to edit this record</p>`);
  }
  // User owns this shortURL, proceed with edit GET
  const templateVars = {
    shortURL: req.params.shortURL,
    urlObj: urlDatabase[req.params.shortURL],
    user: users[req.session.user_id],
  };
  res.render('urls_show', templateVars);
});
// POST: EDIT EXISTING URL
app.put('/urls/:shortURL', (req, res) => {
  // If user not logged in, return status 401
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send(`
      <h3>401: Unauthorised</h3>
      <p>You do not have permission to edit this record</p>`);
  }
  // If user does not 'own' this shortURL return 401
  const usersShortURLs = Object.keys(urlsForUser(urlDatabase, user.id));
  if (!usersShortURLs.includes(req.params.shortURL)) {
    return res.status(401).send('401: Unauthorised. You do not have permission to edit this record');
  }
  // User owns this shortURL, proceed with edit POST
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});


// DELETE EXISTING URL
app.delete('/urls/:shortURL/delete', (req, res) => {
  // If user not logged in, return status 401
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send(`
      <h3>401: Unauthorised</h3>
      <p>You do not have permission to edit this record</p>`);
  }
  // If user does not 'own' this shortURL return 401
  const usersShortURLs = Object.keys(urlsForUser(urlDatabase, user.id));
  if (!usersShortURLs.includes(req.params.shortURL)) {
    return res.status(401).send('401: Unauthorised. You do not have permission to delete this record');
  }
  // User owns this shortURL, proceed with delete POST
  delete urlDatabase[req.params.shortURL];
  return res.redirect('/urls');
});


// VISIT TINYURL (TO BE REDIRECTED TO LONG-URL)
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  // Lookup longURL in DB using shortURL (in params)
  const urlObj = urlDatabase[shortURL];
  if (urlObj) {
    // Set visitor cookie if not already set, use shortURL to count clicks per shortURL
    if (!req.session[shortURL]) {
      urlObj.uniqueVisits++
      req.session[shortURL] = shortURL;
    }
    // Increment visitorCount, add this visit to timestamps, then redirect
    urlObj.visitorCount++
    urlObj.visits[generateRandomString(6)] = new Date()
    return res.redirect(urlObj.longURL);
  }
  res.status(404).send(`
    <h3>404: Page Not Found</h3>
    <p>ShortURL <strong>u/${shortURL}</strong> does not redirect anywhere.</p>`);
});


// CATCHALL ERROR HANDLER FOR NON-EXISTANT ROUTES
app.use(function(req, res, next) {
  return res.status(404).send(`<h3>404: Page Not Found</h3>`);
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});
