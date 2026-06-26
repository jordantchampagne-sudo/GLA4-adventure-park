const userContainer = document.getElementById("userContainer");
const postsContainer = document.getElementById("postsContainer");
const userCountEl = document.getElementById("userCount");
const postCountEl = document.getElementById("postCount");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");
const postSearchInput = document.getElementById("postSearchInput");

let allUsers = [];
let allPosts = [];
let featuredUserIndex = 0;
let featuredPostIndex = 0;
let modal = null;
const visibleFeaturedCount = 3;

function createFallbackAvatar(name) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" rx="16" fill="#1f4d3f"/><text x="50%" y="56%" font-size="34" font-family="Arial, sans-serif" fill="white" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createDisplayEmailFromName(name) {
  // Derived email keeps card data visually consistent for display.
  const localPart = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");

  return `${localPart || "visitor"}@adventurepark.guests`;
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function buildModal() {
  if (modal) {
    return modal;
  }

  modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <button class="modal-close" type="button" aria-label="Close details">×</button>
      <div class="modal-body"></div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  modal.querySelector(".modal-close").addEventListener("click", closeModal);
  document.body.appendChild(modal);
  return modal;
}

function closeModal() {
  if (modal) {
    modal.classList.remove("is-open");
  }
}

function openModal(type, item) {
  const modalElement = buildModal();
  const body = modalElement.querySelector(".modal-body");

  if (type === "user") {
    body.innerHTML = `
      <div class="modal-hero">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <h3>${item.name}</h3>
          <p>${item.email}</p>
        </div>
      </div>
      <p><strong>City:</strong> ${item.city}</p>
      <p><strong>Company:</strong> ${item.company}</p>
      <p>This visitor card is part of the rotating spotlight so the page feels more alive and easier to browse.</p>
    `;
  } else {
    const firstParagraph = item.body || "The park has another strange story to share.";
    const secondParagraph = item.body && item.body.length > 100
      ? "Guests keep comparing notes around the grounds, and the mystery seems to deepen the longer the story is discussed."
      : "The rumor is spreading through the park, and visitors are eager to see whether the mystery grows by evening.";

    body.innerHTML = `
      <h3>${item.title}</h3>
      <p>${firstParagraph}</p>
      <p>${secondParagraph}</p>
      <p class="modal-note">This post opens in a popup so guests can read the full story without losing their place on the page.</p>
    `;
  }

  modalElement.classList.add("is-open");
}

function createUserCardElement(user) {
  const card = document.createElement("article");
  card.className = "user-card";
  card.tabIndex = 0;
  card.addEventListener("click", () => openModal("user", user));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal("user", user);
    }
  });

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

function getFeaturedUsers(source) {
  if (!source.length) {
    return [];
  }

  const size = source.length;
  const start = featuredUserIndex % size;
  const items = [];

  for (let offset = 0; offset < visibleFeaturedCount; offset += 1) {
    items.push(source[(start + offset) % size]);
  }

  return items;
}

function getFeaturedPosts(source) {
  if (!source.length) {
    return [];
  }

  const size = source.length;
  const start = featuredPostIndex % size;
  const items = [];

  for (let offset = 0; offset < visibleFeaturedCount; offset += 1) {
    items.push(source[(start + offset) % size]);
  }

  return items;
}

function renderUsers(usersOverride) {
  if (!userContainer) {
    return;
  }

  clearElement(userContainer);

  const source = usersOverride || getFilteredUsers();

  if (source.length === 0) {
    const empty = document.createElement("p");
    empty.className = "loading";
    empty.textContent = "No visitors match your search.";
    userContainer.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  getFeaturedUsers(source).forEach((user) => {
    fragment.appendChild(createUserCardElement(user));
  });

  userContainer.appendChild(fragment);
}

function renderPosts(postsOverride) {
  if (!postsContainer) {
    return;
  }

  clearElement(postsContainer);

  const source = postsOverride || getFilteredPosts();

  if (source.length === 0) {
    const empty = document.createElement("p");
    empty.className = "loading";
    empty.textContent = "No posts match your search.";
    postsContainer.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  getFeaturedPosts(source).forEach((post) => {
    const article = document.createElement("article");
    article.className = "post-item";
    article.tabIndex = 0;
    article.addEventListener("click", () => openModal("post", post));
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal("post", post);
      }
    });

    const title = document.createElement("h3");
    title.textContent = post.title;

    const body = document.createElement("p");
    body.textContent = post.body;

    article.append(title, body);
    fragment.appendChild(article);
  });

  postsContainer.appendChild(fragment);
}

function getFilteredUsers() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  if (!query) {
    return allUsers;
  }

  return allUsers.filter((user) => {
    const haystack = `${user.name} ${user.city} ${user.company}`.toLowerCase();
    return haystack.includes(query);
  });
}

function getFilteredPosts() {
  const query = (postSearchInput?.value || "").trim().toLowerCase();
  if (!query) {
    return allPosts;
  }

  return allPosts.filter((post) => {
    const haystack = `${post.title} ${post.body}`.toLowerCase();
    return haystack.includes(query);
  });
}

function filterUsersByName(searchValue) {
  featuredUserIndex = 0;
  renderUsers(getFilteredUsers());
}

function filterPosts(searchValue) {
  featuredPostIndex = 0;
  renderPosts(getFilteredPosts());
}

function startRotation() {
  window.clearInterval(window.adventureRotationTimer);
  window.adventureRotationTimer = window.setInterval(() => {
    if (allUsers.length) {
      featuredUserIndex = (featuredUserIndex + 1) % allUsers.length;
      renderUsers(getFilteredUsers());
    }

    if (allPosts.length) {
      featuredPostIndex = (featuredPostIndex + 1) % allPosts.length;
      renderPosts(getFilteredPosts());
    }
  }, 30000);
}

async function loadData() {
  if (!userContainer || !postsContainer) {
    return;
  }

  try {
    loadingMessage.textContent = "Loading visitors and posts...";
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
      // Use a name-based display email so cards feel internally consistent.
      email: createDisplayEmailFromName(user.name),
      city: user.address.city,
      company: user.company.name,
      image: randomImages[index] || createFallbackAvatar(user.name)
    }));

    allUsers = enhancedUsers;
    allPosts = posts;
    renderUsers(allUsers);
    renderPosts(allPosts);
    startRotation();

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

if (postSearchInput) {
  postSearchInput.addEventListener("input", (event) => {
    filterPosts(event.target.value);
  });
}

loadData();
