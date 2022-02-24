const { application } = require('express');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const { authenticateUser } = require('./helpers');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const PORT = 8080;

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

  "randomUser": {
    id: "randomUser",
    email: "someone@example.com",
    password: "fdsaJu7"
  }

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

// CREATES A NEW SHORT URL FOR A PROVIDED LONGURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    "user_id": req.cookies["user_id"]
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
app.post("/register", (req, res) => {

  if (!authenticateUser(users, req.body.email, req.body.password)) {
    return res.status(400).send('400 - Bad request');
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
  const userID = req.body.username;
  console.log(req.body.username);
  res.cookie("user_id", userID);
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