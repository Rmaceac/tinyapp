const { application } = require('express');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateShortURL = () => {
  let result = "";
  const charsList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const numOfChars = charsList.length;
  for (let i = 0; i < 6; i++) {
    result += charsList[Math.floor(Math.random() * numOfChars)];
  }
  return result;
};


app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortURL = generateShortURL();
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    shortURL: req.params.shortURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  // console.log("USERNAME:", username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}.`);
});