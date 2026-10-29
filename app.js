
/*
  CPOVERIFY shared JavaScript
  Firebase Authentication + Realtime Database + secure backend
*/

const firebaseConfig = {
  apiKey: "AIzaSyAS25JvO0dNVZmxw7rV9O-Opgcb_bdmj-A0",
  authDomain: "cpoverify.firebaseapp.com",
  databaseURL: "https://cpoverify-default-rtdb.firebaseio.com",
  projectId: "cpoverify",
  storageBucket: "cpoverify.firebasestorage.app",
  messagingSenderId: "981815301734",
  appId: "1:981815301734:web:1f5890fa643c2c3f37bfa7",
  measurementId: "G-MVC4EHLQ1Z"
};

const BACKEND_URL = "https://cpoverify-backend.onrender.com";

// Initialize Firebase once.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// Load the Realtime Database SDK when needed.
// This also supports registration pages that have not loaded it separately.
let databasePromise = null;

function ensureDatabase() {
  if (firebase.database) {
    return Promise.resolve(firebase.database());
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src =
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js";

      script.onload = () => {
        if (firebase.database) {
          resolve(firebase.database());
        } else {
          reject(new Error("Firebase Database SDK did not initialize."));
        }
      };

      script.onerror = () => {
        databasePromise = null;
        reject(new Error("Unable to load Firebase Database SDK."));
      };

      document.head.appendChild(script);
    });
  }

  return databasePromise;
}

function showProfileStatus(message, isError = false) {
  const status = document.querySelector("#profile-status");

  if (!status) return;

  status.textContent = message;
  status.style.color = isError ? "#c62828" : "#16803d";
}

// Save a profile at users/{uid}/profile.
// Never use an email address as the database key.
async function saveUserProfile(user, changes = {}) {
  if (!user) {
    throw new Error("Please sign in to save your profile.");
  }

  const db = await ensureDatabase();
  const profileRef = db.ref("users/" + user.uid + "/profile");
  const snapshot = await profileRef.once("value");
  const existing = snapshot.val() || {};

  const displayName =
    typeof changes.displayName === "string"
      ? changes.displayName.trim()
      : (user.displayName || existing.displayName || "");

  const profile = {
    uid: user.uid,
    displayName: displayName,
    email: user.email || existing.email || "",
    createdAt: existing.createdAt || Date.now(),
    updatedAt: Date.now()
  };

  await profileRef.set(profile);

  return profile;
}

// Load the signed-in user's profile from Realtime Database.
async function loadUserProfile(user) {
  if (!user) {
    throw new Error("Please sign in to view your profile.");
  }

  const db = await ensureDatabase();
  const snapshot = await db
    .ref("users/" + user.uid + "/profile")
    .once("value");

  const savedProfile = snapshot.val();

  if (savedProfile) {
    return {
      uid: user.uid,
      displayName: savedProfile.displayName || user.displayName || "",
      email: user.email || savedProfile.email || "",
      createdAt: savedProfile.createdAt || null,
      updatedAt: savedProfile.updatedAt || null
    };
  }

  // Create the first database profile if it doesn't exist yet.
  return saveUserProfile(user);
}

// Check whether the signed-in user is an admin.
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

// Redirect the user to the correct page.
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

    if (button) button.disabled = true;

    try {
      const result = await auth.signInWithEmailAndPassword(
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
      if (button) button.disabled = false;
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

    if (button) button.disabled = true;

    let createdUser = null;

    try {
      const result = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      createdUser = result.user;

      await createdUser.updateProfile({
        displayName: name
      });

      // A database failure must not hide the fact that
      // the Authentication account was created successfully.
      try {
        await saveUserProfile(createdUser, {
          displayName: name
        });
      } catch (databaseError) {
        console.error(
          "Profile database save error:",
          databaseError
        );

        alert(
          "Your account was created, but your database profile " +
          "could not be saved. Check the Realtime Database URL " +
          "and security rules."
        );
      }

      await redirectUser(createdUser);
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error.message ||
        "Registration failed. Please try again."
      );
    } finally {
      if (button) button.disabled = false;
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
        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);

        // Create or refresh the user's database profile.
        try {
          await saveUserProfile(result.user);
        } catch (databaseError) {
          console.error(
            "Google profile database save error:",
            databaseError
          );
        }

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
    element.textContent = new Date().getFullYear();
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

    serverFilterButtons.forEach(function(item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

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
  const container = document.querySelector("#server-1-listings");

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
      : result.products || result.data || [];

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

if (document.querySelector("#server-1-listings")) {
  loadServer1Listings();
}
