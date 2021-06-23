const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************* Story: a single story in the system  *****************/
class Story {
     constructor({ storyId, title, author, url, username, createdAt }) {
          this.storyId = storyId;
          this.title = title;
          this.author = author;
          this.url = url;
          this.username = username;
          this.createdAt = createdAt;
     }

     /** Parses hostname out of URL and returns it. */
     getHostName() {
          let tempUrl = new URL(this.url);
          return tempUrl.hostname;
     }
}

/*****List of Story instances: used by UI to show story lists in DOM.**********/
class StoryList {
     constructor(stories) {
          this.stories = stories;
     }

     //Generate a new StoryList
     static async getStories() {
          // query the /stories endpoint (no auth required)
          const response = await axios({
               url: `${BASE_URL}/stories`,
               method: "GET",
          });

          // turn plain old story objects from API into instances of Story class
          const stories = response.data.stories.map(story => new Story(story));

          // build an instance of our own class using the new array of stories
          return new StoryList(stories);
     }

     //Adds story data to API
     async addStory(currentUser, { title, author, url }) {
          try {
               const storyResponse = await axios({
                    method: "POST",
                    url: `${BASE_URL}/stories`,
                    data: { token: currentUser.loginToken, story: { title, author, url } }
               });

               const newStory = new Story(storyResponse.data.story);

               // push adds to bottom of list- prefer newest stories on top
               this.stories.unshift(newStory);
               currentUser.ownStories.unshift(newStory);

               return newStory;
          } catch (err) {
               alert("story was not added");
               console.error("ERROR: ", err);
          }
     }

     async deleteStory(currentUser, storyId) {
          let response;

          response = await axios.delete(
               `${BASE_URL}/stories/${storyId}`,
               { data: { token: currentUser.loginToken } }
          )
          this.stories = this.stories.filter(element => { return element.storyId != storyId });

          return response;
     }

}


/***** User: a user in the system (only used to represent the current user) ***/
class User {
     constructor({
          username,
          name,
          createdAt,
          favorites = [],
          ownStories = []
     },
          token) {
          this.username = username;
          this.name = name;
          this.createdAt = createdAt;

          // instantiate Story instances for the user's favorites and ownStories
          this.favorites = favorites.map(s => new Story(s));
          this.ownStories = ownStories.map(s => new Story(s));

          // store the login token on the user so it's easy to find for API calls.
          this.loginToken = token;
     }

     //Register new user in API
     static async signup(username, password, name) {
          const response = await axios({
               url: `${BASE_URL}/signup`,
               method: "POST",
               data: { user: { username, password, name } },
          });

          let { user } = response.data

          return new User(
               {
                    username: user.username,
                    name: user.name,
                    createdAt: user.createdAt,
                    favorites: user.favorites,
                    ownStories: user.stories
               },
               response.data.token
          );
     }

     //Login in user with API
     static async login(username, password) {
          const response = await axios({
               url: `${BASE_URL}/login`,
               method: "POST",
               data: { user: { username, password } },
          });

          let { user } = response.data;

          return new User(
               {
                    username: user.username,
                    name: user.name,
                    createdAt: user.createdAt,
                    favorites: user.favorites,
                    ownStories: user.stories
               },
               response.data.token
          );
     }

     /** When we already have credentials (token & username) for a user,
      *we can log them in automatically. 
      */
     static async loginViaStoredCredentials(token, username) {
          try {
               const response = await axios({
                    url: `${BASE_URL}/users/${username}`,
                    method: "GET",
                    params: { token },
               });

               let { user } = response.data;

               return new User(
                    {
                         username: user.username,
                         name: user.name,
                         createdAt: user.createdAt,
                         favorites: user.favorites,
                         ownStories: user.stories
                    },
                    token
               );
          } catch (err) {
               console.error("loginViaStoredCredentials failed", err);
               return null;
          }
     }


     async addOrDeleteStoryFromFavorites(storyId, action) {
          let response;

          if (action == "ADD") {
               response = await axios.post(`${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
                    { token: currentUser.loginToken });

               this.favorites.push(storyList.stories.find((story) => { return story.storyId == storyId }));
          }
          else {
               response = await axios.delete(`${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
                    { data: { token: currentUser.loginToken } })

               this.favorites = this.favorites.filter(story => { return story.storyId != storyId });
          }

          return response;
     }

}
