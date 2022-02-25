const { response } = require("express");
const bcrypt = require('bcryptjs');

const isExistingUser = (database, email) => {
    
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

const checkUser = (database, userInfo, res) => {
  const { email, password } = userInfo;
  for (const user in database) {
    if (database[user].email === email && database[user].password === password) {
      return res.cookie("user_id", database[user].id);
    }
  } return res.status(403).send('403 - Your email and password do not match.');
};

// parameter "num" is the desired length of characters
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
