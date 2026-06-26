const userContainer = document.getElementById("userContainer");
const postsContainer = document.getElementById("postsContainer");
const userCountEl = document.getElementById("userCount");
const postCountEl = document.getElementById("postCount");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");

let allUsers = [];

function createUserCard(user) {
  return `
    <article class="user-card">
      <img src="${user.image}" alt="${user.name}" />
      <p><strong>${user.name}</strong></p>
      <p>${user.email}</p>
      <p>City: ${user.city}</p>
      <p>Company: ${user.company}</p>
    </article>
  `;
}

function renderUsers(users) {
  if (!userContainer) {
    return;
  }

  userContainer.innerHTML = users.map(createUserCard).join("");
}

function renderPosts(posts) {
  if (!postsContainer) {
    return;
  }

  const limitedPosts = posts.slice(0, 8);
  postsContainer.innerHTML = limitedPosts
    .map(
      (post) => `
        <article class="post-item">
          <h3>${post.title}</h3>
          <p>${post.body}</p>
        </article>
      `
    )
    .join("");
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

    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        let imageUrl = "https://via.placeholder.com/100";
        try {
          imageUrl = await getRandomUserImage();
        } catch (error) {
          imageUrl = "https://via.placeholder.com/100";
        }

        return {
          name: user.name,
          email: user.email,
          city: user.address.city,
          company: user.company.name,
          image: imageUrl
        };
      })
    );

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
