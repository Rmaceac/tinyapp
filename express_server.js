const { application } = require('express');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
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
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// REDIRECTS THE USER TO THE LONG URL OF A SPECIFIC SHORTURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// CREATES A NEW SHORT URL FOR A PROVIDED LONGURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const newShortURL = generateShortURL();
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL;
  res.redirect("/urls");
});

// DISPLAYS THE REGISTER  NEW USER PAGE AND FORM
app.get("/register", (req, res) => {
  res.render("register");
});

//REGISTERS A NEW USER AND STORES THEIR INFORMATION IN THE DATABASE
// app.post("/register", (req, res) => {

// });

// DISPLAYS THE URL DATABASE IN JSON FORMAT ON THE BROWSER
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// LOGS A USER IN AND STORES USERNAME COOKIE
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// LOGS THE USER OUT AND CLEARS USERNAME COOKIE
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// DISPLAYS A SPECIFIC SHORT URL'S DETAILS
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    shortURL: req.params.shortURL,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// EDITS THE LONG URL FOR ITS ASSOCIATED SHORT URL IN THE DATABASE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// DELETES A URL FROM THE MAIN URL INDEX PAGE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// SERVER LISTENING ON PORT INDICATED ABOVE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}.`);
});