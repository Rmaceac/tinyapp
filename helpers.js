const { response } = require("express");

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



module.exports = { isExistingUser, checkUser };
