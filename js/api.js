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

async function getRandomUserImages(count) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 1;
  const data = await fetchJson(`${API_ENDPOINTS.randomUser}?results=${safeCount}&inc=picture&noinfo`);
  return data.results.map((result) => result.picture.large);
}
