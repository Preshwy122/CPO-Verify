/*
  CPOVERIFY shared JavaScript
  Firebase Authentication + secure backend verification
*/

const firebaseConfig = {
  apiKey: "AIzaSyAS25JvO0dNVZmxw7rV9O-Pgcb_bdmj-A0",
  authDomain: "cpoverify.firebaseapp.com",
  projectId: "cpoverify",
  storageBucket: "cpoverify.firebasestorage.app",
  messagingSenderId: "981815301734",
  appId: "1:981815301734:web:1f5890fa643c2c3f37bfa7",
  measurementId: "G-MVC4EHLQ1Z"
};

const BACKEND_URL = "https://cpoverify-backend.onrender.com";

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();


// Check whether the signed-in user is an admin
async function checkAdmin(user) {
  const token = await user.getIdToken();

  const response = await fetch(
    BACKEND_URL + "/api/admin/check",
    {
      headers: {
        Authorization: "Bearer " + token
      }
    }
  );

  return response.ok;
}


// Redirect user to the correct page
async function redirectUser(user) {
  try {
    const isAdmin = await checkAdmin(user);

    window.location.href = isAdmin
      ? "admin.html"
      : "dashboard.html";

  } catch (error) {
    console.error("Redirect error:", error);

    window.location.href = "dashboard.html";
  }
}


// LOGIN WITH EMAIL AND PASSWORD
const loginForm = document.querySelector("#login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document
      .querySelector("#login-email")
      .value.trim();

    const password = document
      .querySelector("#login-password")
      .value;

    const button = loginForm.querySelector(
      'button[type="submit"]'
    );

    button.disabled = true;

    try {
      const result =
        await auth.signInWithEmailAndPassword(
          email,
          password
        );

      await redirectUser(result.user);

    } catch (error) {
      console.error("Login error:", error);

      alert(
        error.message ||
        "Login failed. Please check your details."
      );

    } finally {
      button.disabled = false;
    }
  });
}


// REGISTER WITH EMAIL AND PASSWORD
const registerForm = document.querySelector("#register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document
      .querySelector("#register-name")
      .value.trim();

    const email = document
      .querySelector("#register-email")
      .value.trim();

    const password = document
      .querySelector("#register-password")
      .value;

    const confirmPassword = document
      .querySelector("#register-confirm")
      .value;

    const button = registerForm.querySelector(
      'button[type="submit"]'
    );

    if (password !== confirmPassword) {
      alert("Your passwords do not match.");
      return;
    }

    button.disabled = true;

    try {
      const result =
        await auth.createUserWithEmailAndPassword(
          email,
          password
        );

      await result.user.updateProfile({
        displayName: name
      });

      alert("Account created successfully!");

      await redirectUser(result.user);

    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error.message ||
        "Registration failed. Please try again."
      );

    } finally {
      button.disabled = false;
    }
  });
}


// GOOGLE SIGN-IN
document
  .querySelectorAll("[data-google-demo]")
  .forEach(function(button) {

    button.addEventListener("click", async function() {

      button.disabled = true;

      try {
        const provider =
          new firebase.auth.GoogleAuthProvider();

        const result =
          await auth.signInWithPopup(provider);

        await redirectUser(result.user);

      } catch (error) {
        console.error("Google sign-in error:", error);

        alert(
          error.message ||
          "Google sign-in failed. Please try again."
        );

      } finally {
        button.disabled = false;
      }
    });
  });


// LOGOUT
document
  .querySelectorAll("[data-logout]")
  .forEach(function(button) {

    button.addEventListener("click", async function() {

      if (!confirm("Log out?")) return;

      try {
        await auth.signOut();

        window.location.href = "login.html";

      } catch (error) {
        console.error("Logout error:", error);

        alert("Unable to log out. Please try again.");
      }
    });
  });


// AUTOMATIC FOOTER YEAR
document
  .querySelectorAll("[data-year]")
  .forEach(function(element) {
    element.textContent =
      new Date().getFullYear();
  });
// ACCOUNT LOGS: SERVER FILTERS
const serverFilterButtons = document.querySelectorAll(
  "[data-filter]"
);

const serverSections = document.querySelectorAll(
  "[data-server-section]"
);

serverFilterButtons.forEach(function(button) {
  button.addEventListener("click", function() {

    const selectedServer = button.dataset.filter;

    // Update active tab
    serverFilterButtons.forEach(function(item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    // Show or hide server sections
    serverSections.forEach(function(section) {

      const server = section.dataset.serverSection;

      section.hidden =
        selectedServer !== "all" &&
        selectedServer !== server;

    });

  });
});


// LOAD SERVER 1 LISTINGS
async function loadServer1Listings() {

  const container = document.querySelector(
    "#server-1-listings"
  );

  if (!container) return;

  container.innerHTML =
    '<p class="muted">Loading listings...</p>';

  try {

    const response = await fetch(
      BACKEND_URL + "/api/provider/products"
    );

    if (!response.ok) {
      throw new Error(
        "Server 1 returned HTTP " + response.status
      );
    }

    const result = await response.json();

    const products = Array.isArray(result)
      ? result
      : result.products ||
        result.data ||
        [];

    if (!Array.isArray(products) || products.length === 0) {

      container.innerHTML =
        '<p class="muted">No listings available on Server 1.</p>';

      return;
    }

    container.innerHTML = "";

    products.forEach(function(product) {

      const card = document.createElement("article");

      card.className = "service-card";

      const title = document.createElement("h3");

      title.textContent =
        product.name ||
        product.title ||
        product.service ||
        "Available service";

      const description = document.createElement("p");

      description.className = "muted";

      description.textContent =
        product.description ||
        product.category ||
        "";

      card.appendChild(title);
      card.appendChild(description);

      container.appendChild(card);

    });

  } catch (error) {

    console.error("Server 1 loading error:", error);

    container.innerHTML =
      '<p class="muted">Unable to load Server 1 listings. Please try again later.</p>';

  }
}


// LOAD LISTINGS WHEN ACCOUNT LOGS PAGE OPENS
if (document.querySelector("#server-1-listings")) {
  loadServer1Listings();
        }
