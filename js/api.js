const API_ENDPOINTS = {
  users: "https://jsonplaceholder.typicode.com/users",
  posts: "https://jsonplaceholder.typicode.com/posts",
  randomUser: "https://randomuser.me/api/"
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function getUsers() {
  return fetchJson(API_ENDPOINTS.users);
}

async function getPosts() {
  return fetchJson(API_ENDPOINTS.posts);
}

async function getRandomUserImage() {
  const data = await fetchJson(API_ENDPOINTS.randomUser);
  return data.results[0].picture.large;
}
