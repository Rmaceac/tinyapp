const { response } = require("express");
const bcrypt = require('bcryptjs');

// checks if a user already exists in the "users" database
const isExistingUser = (database, email) => {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

const checkUser = (database, userInfo, req, res) => {
  const { email, password } = userInfo;
  for (const user in database) {
    const hashedPassword = database[user].password;
    if (database[user].email === email && bcrypt.compareSync(password, hashedPassword)) {
      return req.session["user_id"] = database[user].id;
    }
  } return res.status(403).send('403 - Your email and password do not match.');
};

// parameter "num" is the desired length of characters. used to generate shortURLs and Id's
const generateShortURL = (num) => {
  let result = "";
  const charsList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const numOfChars = charsList.length;
  for (let i = 0; i < num; i++) {
    result += charsList[Math.floor(Math.random() * numOfChars)];
  }
  return result;
};

module.exports = { isExistingUser, checkUser, generateShortURL };
