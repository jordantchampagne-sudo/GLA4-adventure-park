const userContainer = document.getElementById("userContainer");
const postsContainer = document.getElementById("postsContainer");
const userCountEl = document.getElementById("userCount");
const postCountEl = document.getElementById("postCount");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");

let allUsers = [];

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createUserCardElement(user) {
  const card = document.createElement("article");
  card.className = "user-card";

  const image = document.createElement("img");
  image.src = user.image;
  image.alt = user.name;

  const name = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = user.name;
  name.appendChild(strong);

  const email = document.createElement("p");
  email.textContent = user.email;

  const city = document.createElement("p");
  city.textContent = `City: ${user.city}`;

  const company = document.createElement("p");
  company.textContent = `Company: ${user.company}`;

  card.append(image, name, email, city, company);
  return card;
}

function renderUsers(users) {
  if (!userContainer) {
    return;
  }

  clearElement(userContainer);

  if (users.length === 0) {
    const empty = document.createElement("p");
    empty.className = "loading";
    empty.textContent = "No users match your search.";
    userContainer.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    fragment.appendChild(createUserCardElement(user));
  });

  userContainer.appendChild(fragment);
}

function renderPosts(posts) {
  if (!postsContainer) {
    return;
  }

  const limitedPosts = posts.slice(0, 8);
  clearElement(postsContainer);

  const fragment = document.createDocumentFragment();

  limitedPosts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post-item";

    const title = document.createElement("h3");
    title.textContent = post.title;

    const body = document.createElement("p");
    body.textContent = post.body;

    article.append(title, body);
    fragment.appendChild(article);
  });

  postsContainer.appendChild(fragment);
}

function filterUsersByName(searchValue) {
  const query = searchValue.trim().toLowerCase();
  const filtered = allUsers.filter((user) => user.name.toLowerCase().includes(query));
  renderUsers(filtered);
}

async function loadData() {
  if (!userContainer || !postsContainer) {
    return;
  }

  try {
    loadingMessage.textContent = "Loading users and posts...";
    errorMessage.textContent = "";

    const [users, posts] = await Promise.all([getUsers(), getPosts()]);

    let randomImages = [];
    try {
      randomImages = await getRandomUserImages(users.length);
    } catch (error) {
      randomImages = [];
    }

    const enhancedUsers = users.map((user, index) => ({
      name: user.name,
      email: user.email,
      city: user.address.city,
      company: user.company.name,
      image: randomImages[index] || "https://via.placeholder.com/100"
    }));

    allUsers = enhancedUsers;
    renderUsers(allUsers);
    renderPosts(posts);

    userCountEl.textContent = String(allUsers.length);
    postCountEl.textContent = String(posts.length);
    loadingMessage.textContent = "";
  } catch (error) {
    loadingMessage.textContent = "";
    errorMessage.textContent = "Could not load data. Please try again later.";
  }
}

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    filterUsersByName(event.target.value);
  });
}

loadData();
