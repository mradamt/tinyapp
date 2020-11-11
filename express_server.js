const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const express = require('express');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const users = {
  "abc1": {
    id: "abc1",
    email: "email@email.com",
    password: "passwordle"
  },
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  const templateVars = { 
    username: req.cookies["username"], 
  };
  res.render('user_registration', templateVars);
})

app.post('/login', (req, res) =>{
  res.cookie('username', req.body.username)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"], 
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  // Add longURL from req.body to urlDatabase with key = new random string
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  /* Preferred behaviour: redirect to /urls after new url creation */
  // res.redirect(`/urls/${shortURL}`)
  res.redirect(`/urls/`)
})

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render('urls_new', templateVars);
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };  
  res.render('urls_show', templateVars);
})  

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect('/urls')
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  }
  res.send(`<h3>404: Page Not Found</h3><p>ShortURL <em>u/${req.params.shortURL}</em> does not exist.</p>`)
})

app.use(function(req, res, next) {
  return res.status(404).send(`<h3>404: Page Not Found</h3>`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8)
}