import api from "../api";

/**
 * Logs a user in
 * @param  {string}   username The username of the user
 * @param  {string}   password The password of the user
 * @param  {Function} callback Called after a user was logged in on the remote server
 */
function login(username, password, callback) {
   // If there is a token in the localStorage, the user already is
   // authenticated
   if (this.loggedIn()) {
      callback(true);
      return;
   }

   var data = {
      username: username,
      password: password
   };

   api
      .login(data)
      .then(function(response) {
         localStorage.token = response.token;
         callback(true);
      })
      .catch(function(error) {
         callback(false, error);
      });
}

/**
 * Logs the current user out
 */
function logout(callback) {
   localStorage.clear();
}

/**
 * Checks if anybody is logged in
 * @return {boolean} True if there is a logged in user, false if there isn't
 */
function loggedIn() {
   return !!localStorage.token;
}

/**
 * Registers a user in the system
 * @param  {string}   username The username of the user
 * @param  {string}   password The password of the user
 * @param  {Function} callback Called after a user was registered on the remote server
 */
function register(username, password, callback) {
   // Post a fake request
   api.post("/register", { username, password }, response => {
      // If the user was successfully registered, log them in
      if (response.registered === true) {
         this.login(username, password, callback);
      } else {
         // If there was a problem registering, show the error
         callback(false, response.error);
      }
   });
}

export default {
   login,
   register,
   loggedIn,
   logout
};
