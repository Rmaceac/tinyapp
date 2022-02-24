const { response } = require("express");

// const checkRegistration = function(req, database, email) {
//   if (!req.body.email || !req.body.password) {
//     res.statusCode = 400;
//     return false;
//   }
  
//   for (const user of Object.entries(database))
//     if (user[email]) {
//       return false;
//     }
// };

const authenticateUser = (database, email) => {
  for (const user in database) {
    if (database[user].email === email) {
      return false;
    }
  }
  return true;
};





module.exports = { authenticateUser };
