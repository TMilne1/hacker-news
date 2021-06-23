"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
     try {
          storyList = await StoryList.getStories();
          $storiesLoadingMsg.remove();
          putStoriesOnPage();
     }
     catch (err) {
          console.error(err)
          alert("Sorry something went wrong!")
     }
}


//A render method to render HTML for an individual Story instance
function generateStoryMarkup(story) {
     const hostName = story.getHostName();
     return $(`
      <li id="${story.storyId}">
      ${currentUser ?
               currentUser.favorites.find(ele => ele.storyId == story.storyId) ?
                    '<i class="fas fa-star"></i>'
                    : '<i class="far fa-star"></i>'
               : ''
          } 
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
     
        ${currentUser ?
               currentUser.ownStories.find(ele => ele.storyId == story.storyId) ?
                    '<i class="far fa-trash-alt"></i>' : ''
               : ''
          }
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
     $allStoriesList.empty();

     // loop through all of our stories and generate HTML for them
     for (let story of storyList.stories) {
          const $story = generateStoryMarkup(story);
          $allStoriesList.append($story);
     };

     $allStoriesList.show();
}


function putFavoriteStoriesOnPage() {
     $favoritesStoriesList.empty();

     // loop through all of our stories and generate HTML for them
     for (let story of currentUser.favorites) {
          const $story = generateStoryMarkup(story);
          $favoritesStoriesList.append($story);
     };

     $favoritesStoriesList.show();
}

function putMyStoriesOnPage() {
     $myStoriesList.empty();

     // loop through all of our stories and generate HTML for them
     for (let story of currentUser.ownStories) {
          const $story = generateStoryMarkup(story);
          $myStoriesList.append($story);
     };

     $myStoriesList.show();
}

$("#submit-story").on("click", submitNewStory)

async function submitNewStory(evt) {
     evt.preventDefault();

     const title = $("#story-title").val();
     const author = $("#story-author").val();
     const url = $("#story-url").val();

     try {
          await storyList.addStory(currentUser, { title, author, url });
          hidePageComponents();
          putStoriesOnPage();
          $storiesForm.trigger("reset");
     }
     catch (err) {
          console.error("err");
          window.alert("uh oh, something went wrong with submitting your story!");
     }
}

function addOrRemoveFavorite(evt) {
     let element = $(this);
     let storyId = element.parent().attr('id');

     element.hasClass("far") ?
          currentUser.addOrDeleteStoryFromFavorites(storyId, "ADD") :
          currentUser.addOrDeleteStoryFromFavorites(storyId, "DELETE")
          ;

     element.toggleClass("far");
     element.toggleClass("fas");
}

$("body").on("click", ".fa-star", addOrRemoveFavorite);

async function deleteStoryIcon(evt) {
     let element = $(this);
     let storyId = element.parent().attr('id');

     try {
          await storyList.deleteStory(currentUser, storyId);
          currentUser.ownStories = currentUser.ownStories.filter(element => {
               return element.storyId != storyId;
          });
          element.parent().remove();
     } catch (err) {
          alert("Story was not deleted");
          console.error("ERROR: ", err);
     }


}


$("body").on("click", ".fa-trash-alt", deleteStoryIcon);
