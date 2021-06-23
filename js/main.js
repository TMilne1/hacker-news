"use strict";

const $body = $("body");
const $storiesLoadingMsg = $("#stories-loading-msg");

//Story OLs
const $allStoriesList = $("#all-stories-list");
const $favoritesStoriesList = $("#favorites-stories-list");
const $myStoriesList = $("#my-stories-list");

//Forms
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $storiesForm = $("#stories-form");

//Navigation links
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $navSubmit = $("#nav-submit");
const $navFavorite = $("#nav-favorite");
const $navMyStories = $("#nav-my-stories");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
*/
function hidePageComponents() {
     const components = [
          $allStoriesList,
          $loginForm,
          $signupForm,
          $storiesForm,
          $favoritesStoriesList,
          $myStoriesList,
     ];
     components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */
async function start() {
     // "Remember logged-in user" and log in, if credentials in localStorage
     await checkForRememberedUser();
     await getAndShowStoriesOnStart();

     // if we have a logged-in user update ui with their info
     if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app
$(start);
