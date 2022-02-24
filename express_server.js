const { application } = require('express');
const express = require('express');
const res = require('express/lib/response');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();

const { isExistingUser, checkUser, generateShortURL } = require('./helpers');
const { urlDatabase, users } = require('./database');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
app.set("view engine", "ejs");

const PORT = 8080;

// ORIGINAL TEST HOME PAGE
app.get("/", (req, res) => {
  res.send("Hello");
});

// LOADS MAIN URL DISPLAY PAGE
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    "user_id": req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

// REDIRECTS THE USER TO THE LONG URL OF A SPECIFIC SHORTURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;

  const templateVars = {
    "user_id": userID
  };
  // to redirect clients who are not logged in
  if (!userID) {
    return res.redirect("/login");
  }

  return res.render("urls_new", templateVars);
});

// CREATES A NEW SHORT URL FOR A PROVIDED LONGURL
app.post("/urls/new", (req, res) => {
  const newShortURL = generateShortURL(6);
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL;
  res.redirect("/urls");
});

// DISPLAYS THE REGISTER  NEW USER PAGE AND FORM
app.get("/register", (req, res) => {
  res.render("register");
});

//REGISTERS A NEW USER AND STORES THEIR INFORMATION IN THE DATABASE
app.post("/register", (req, res) => {
  
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('400 - Please fill out all fields');
  } else if (isExistingUser(users, req.body.email, req.body.password)) {
    return res.status(400).send('400 - That email is already registered');
  }

  const userID = generateShortURL();
  users[userID] = { id: userID, email: req.body.email, password: req.body.password};
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// DISPLAYS THE URL DATABASE IN JSON FORMAT ON THE BROWSER
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// DISPLAY LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});

// LOGS A USER IN AND STORES USERNAME COOKIE
app.post("/login", (req, res) => {
  
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('400 - Please fill out all fields.');
  } else if (!isExistingUser(users, req.body.email)) {
    return res.status(403).send('403 - That email is not yet registered.');
  }

  checkUser(users, req.body, res);
  res.redirect("/urls");
});

// LOGS THE USER OUT AND CLEARS USERNAME COOKIE
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// DISPLAYS A SPECIFIC SHORT URL'S DETAILS
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    shortURL: req.params.shortURL,
    "user_id": req.cookies["user_id"]
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