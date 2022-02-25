const { application } = require('express');
const express = require('express');
const res = require('express/lib/response');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();

const {
  isExistingUser,
  checkUser,
  generateShortURL,
  getUserByEmail
} = require('./helpers');

const { urlDatabase, users } = require('./database');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  // secret keys should obviously/normally NOT be stored in a git repo.
  keys: ["super secret key"]
}));
app.use(morgan('dev'));
app.set("view engine", "ejs");

const PORT = 8080;

// SERVER LISTENING ON PORT 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}.`);
});

// ORIGINAL TEST HOME PAGE
app.get("/", (req, res) => {
  res.send("Welcome to the Home Page");
});

// LOADS MAIN URL DISPLAY PAGE
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  
  // email will only be defined if a user is logged in
  let email = userID ? users[userID].email : null;

  // for filtering which URLs are visible based on which user is logged in
  const filteredURLs = {};
  for (let key in urlDatabase) {
    const url = urlDatabase[key];
    if (userID === url.userID) {
      filteredURLs[key] = url;
    }
  }
  // passing variables to the header partial and error page
  const templateVars = {
    urls: filteredURLs,
    "user_id": userID,
    email,
    msg: "You must log in to view this page."
  };
  
  // if no one is logged in when requesting this page, redirect to error page.
  if (!userID) {
    res.render("error", templateVars);
    return;
  }

  res.render("urls_index", templateVars);
});

// REDIRECTS THE USER TO THE LONG URL OF A SPECIFIC SHORTURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  
  // email will only be defined if a user is logged in
  let email = userID ? users[userID].email : null;

  const templateVars = {
    "user_id": userID,
    msg: "That URL does not exist.",
    email
  };

  if (!urlDatabase[shortURL]) {
    res.render("error", templateVars);
    return;
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  
  if (!userID) {
    res.redirect("/login");
    return;
  }

  // email will only be defined if a user is logged in
  let email = userID ? users[userID].email : null;

  const templateVars = {
    "user_id": userID,
    email
  };

  return res.render("urls_new", templateVars);
});

// CREATES A NEW SHORT URL FOR A PROVIDED LONGURL
app.post("/urls/new", (req, res) => {
  const newShortURL = generateShortURL(6);
  const newLongURL = req.body.longURL;
  const userID = req.session.user_id;

  //redirect users who are not logged in
  if (!users[userID]) {
    res.status(500).send("Error! Cannot POST /urls/new");
    return;
  }

  urlDatabase[newShortURL] = { longURL: newLongURL, userID: userID };

  res.redirect("/urls");
});

// DISPLAYS THE REGISTER  NEW USER PAGE AND FORM
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { "user_id": userID };
  res.render("register", templateVars);
});

//REGISTERS A NEW USER AND STORES THEIR INFORMATION IN THE DATABASE
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const templateVars = { "user_id": req.session["user_id"] };

  if (!email || !password) {
    templateVars.msg = "400 - Please fill out both fields.";
    res.render("error", templateVars);
  } else if (isExistingUser(users, email)) {
    templateVars.msg = "409 - That email is already registered.";
    res.render("error", templateVars);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  // using generateShortURL function to generate random user IDs
  const newUserID = generateShortURL(8);
  users[newUserID] = { id: newUserID, email: req.body.email, password: hashedPassword};

  req.session["user_id"] = users[newUserID];
  res.redirect("/urls");
});

// DISPLAYS THE URL DATABASE IN JSON FORMAT ON THE BROWSER
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// DISPLAY LOGIN PAGE
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { "user_id": userID };
  res.render("login", templateVars);
});

// LOGS A USER IN AND STORES USERNAME COOKIE
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('400 - Please fill out all fields.');
  } else if (!isExistingUser(users, email)) {
    return res.status(403).send('403 - That email is not yet registered.');
  }

  checkUser(users, req.body, req, res);
  res.redirect("/urls");
});

// LOGS THE USER OUT AND CLEARS USERNAME COOKIE
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// DISPLAYS A SPECIFIC SHORT URL'S DETAILS
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.render("error", { "user_id": userID, msg: "Error: That URL does not exist."});
  }

  // email will only be defined if a user is logged in
  let email = userID ? users[userID].email : null;

  const templateVars = {
    longURL: urlDatabase[shortURL].longURL,
    shortURL: shortURL,
    "user_id": userID,
    email,
    msg: "That URL isn't yours!"
  };
  
  // send error if non-user or wrong user tries to access
  // another user's URL
  if (userID !== urlDatabase[shortURL].userID) {
    res.render("error", templateVars);
    return;
  }
  res.render("urls_show", templateVars);
});

// EDITS THE LONG URL FOR ITS ASSOCIATED SHORT URL IN THE DATABASE
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  if (!userID) {
    res.status(401).send("401 - Unauthorized request. That URL Isn't yours.");
    return;
  }
  res.redirect("/urls");
});

// DELETES A URL FROM THE MAIN URL INDEX PAGE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];
  console.log("ShortURL:", shortURL);

  if (!userID) {
    res.status(400).send(`Error: Cannot POST ${shortURL}/delete`);
    return;
  }

  if (userID !== urlDatabase[shortURL].userID) {
    res.render("error");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});