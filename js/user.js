"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************** User login/signup/login *******************************/

/** Handle login form submission. If login ok, sets up the user instance */
async function login(evt) {
     evt.preventDefault();

     // grab the username and password
     const username = $("#login-username").val();
     const password = $("#login-password").val();

     // User.login retrieves user info from API and returns User instance
     try{
          currentUser = await User.login(username, password);

          $loginForm.trigger("reset");

          hidePageComponents();
          saveUserCredentialsInLocalStorage();
          updateUIOnUserLogin();
          putStoriesOnPage();
          $(".nav-left").show();
     }catch(err){
          if(err.response.status == 401){
               alert('Username and/or password is incorrect');
          }
          console.error(err);
     }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */
async function signup(evt) {
     evt.preventDefault();

     const name = $("#signup-name").val();
     const username = $("#signup-username").val();
     const password = $("#signup-password").val();

     // User.signup retrieves user info from API and returns User instance
     try{
          currentUser = await User.signup(username, password, name);
          
          hidePageComponents();
          saveUserCredentialsInLocalStorage();
          updateUIOnUserLogin();
          putStoriesOnPage();
          $(".nav-left").show();

          $signupForm.trigger("reset");
     }catch(err){
          if(err.response.status == 409){
               alert("That username is already taken")
          }
          console.error(err)
     }
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 * Remove their credentials from localStorage and refresh page
*/
function logout(evt) {
     localStorage.clear();
     location.reload();
}

$navLogOut.on("click", logout);


/******* Storing/recalling previously-logged-in-user with localStorage *******/
async function checkForRememberedUser() {
     const token = localStorage.getItem("token");
     const username = localStorage.getItem("username");
     
     if (!token || !username) return false;

     // try to log in with these credentials (will be null if login failed)
     currentUser = await User.loginViaStoredCredentials(token, username);
     $(".nav-left").show();
}

/** Sync current user information to localStorage.
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {    
     if (currentUser) {
          localStorage.setItem("token", currentUser.loginToken);
          localStorage.setItem("username", currentUser.username);
     }
}


/** When a user signs up or registers set up the UI  */

function updateUIOnUserLogin() {
     $allStoriesList.show();
     updateNavOnLogin();
}

