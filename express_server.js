const bodyParser = require("body-parser");

const express = require('express');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.set('view engine', 'ejs');

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };  
  res.render('urls_show', templateVars);
})  

app.post('/urls', (req, res) => {
  // Add longURL from req.body to urlDatabase with key = new random string
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`, )
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8)
}