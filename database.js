// let urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "randomUser"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "randomUser"
  }
};

const users = {

  "randomUser": {
    id: "randomUser",
    email: "someone@example.com",
    password: "pass"
  }

};

module.exports = { urlDatabase, users };