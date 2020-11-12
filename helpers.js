/**********
 * Helper functions for 'express_server.js'
 **********/

/* Generate random alphanumeric string of length 'length' */
const generateRandomString = (length) => {
  return Math.random().toString(36).substring(2, length + 2);
};

/* Allow DB lookup by key (e.g. email or id) and return user obj if user[key] matches given confirmValue */
const lookupUserByKey = (database, key, confirmValue) => {
  for (const user of Object.values(database)) {
    if (user[key] === confirmValue) {
      return user;
    }
  }
  return;
};

/* Filter given urlDatabase and return only urls with id matching given 'id' */
const urlsForUser = (urlDatabase, id) => {
  const userUrls = {};
  for (const [shortURL, urlObj] of Object.entries(urlDatabase)) {
    if (urlObj.user_id === id) {
      userUrls[shortURL] = urlObj;
    }
  }
  return userUrls;
};


module.exports = {
  generateRandomString,
  lookupUserByKey,
  urlsForUser,
};