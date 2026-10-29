
/*
  CPOVERIFY shared JavaScript.
  Firebase Google sign-in and backend authentication.
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

// Backend URL
const BACKEND_URL = "https://cpoverify-backend.onrender.com";

// Load Firebase compat SDK files
function loadFirebase() {
  return new Promise(function (resolve, reject) {
    if (window.firebase && firebase.apps.length) {
      resolve();
      return;
    }

    const scripts = [
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"
    ];

    function loadNext(index) {
      if (index >= scripts.length) {
        try {
          firebase.initializeApp(firebaseConfig);
          resolve();
        } catch (error) {
          reject(error);
        }
        return;
      }

      const script = document.createElement("script");
      script.src = scripts[index];

      script.onload = function () {
        loadNext(index + 1);
      };

      script.onerror = function () {
        reject(new Error("Unable to load Firebase SDK."));
      };

      document.head.appendChild(script);
    }

    loadNext(0);
  });
}

document.addEventListener("DOMContentLoaded", function () {

  // Automatic footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Demo login, registration, and password recovery forms
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const password = form.querySelector('[name="password"]');
      const confirmPassword = form.querySelector(
        '[name="confirm_password"]'
      );

      if (
        password &&
        confirmPassword &&
        password.value !== confirmPassword.value
      ) {
        alert("Your passwords do not match.");
        return;
      }

      alert(
        form.dataset.success ||
        "Demo only. Connect a secure backend to enable this action."
      );
    });
  });

  // Firebase Google sign-in and backend admin verification
  document.querySelectorAll("[data-google-demo]").forEach(function (button) {

    button.addEventListener("click", async function () {

      button.disabled = true;

      try {
        await loadFirebase();

        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        if (!user) {
          throw new Error("Unable to retrieve your account.");
        }

        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Verify the signed-in user with our backend
        const meResponse = await fetch(
          BACKEND_URL + "/api/me",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + idToken
            }
          }
        );

        if (!meResponse.ok) {
          throw new Error("Backend could not verify your login.");
        }

        // Ask backend whether this user is the admin
        const adminResponse = await fetch(
          BACKEND_URL + "/api/admin/check",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + idToken
            }
          }
        );

        if (adminResponse.ok) {
          window.location.href = "admin.html";
          return;
        }

        if (adminResponse.status === 403) {
          window.location.href = "dashboard.html";
          return;
        }

        throw new Error("Unable to verify admin access.");

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

  // WhatsApp wallet deposit link
  document.querySelectorAll("[data-deposit]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const whatsappNumber = "2340000000000";

      const message =
        "Hello, I would like to deposit into my CPOVERIFY wallet.";

      const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

      window.open(url, "_blank", "noopener");
    });
  });

  // Demo buttons for services that need a live provider
  document.querySelectorAll("[data-service-demo]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      alert(
        "This is a demo. Connect a legitimate service provider to display live prices and availability."
      );
    });
  });

  // Search countries on the Buy Numbers page
  const countrySearch = document.querySelector("#country-search");

  if (countrySearch) {
    countrySearch.addEventListener("input", function () {
      const query = countrySearch.value.toLowerCase().trim();

      document.querySelectorAll("[data-country]").forEach(function (card) {
        card.hidden = !card.dataset.country.includes(query);
      });
    });
  }

  // Search users on the admin Other Users page
  const userSearch = document.querySelector("#user-search");

  if (userSearch) {
    userSearch.addEventListener("input", function () {
      const query = userSearch.value.toLowerCase().trim();

      document.querySelectorAll("[data-user]").forEach(function (user) {
        user.hidden = !user.dataset.user.includes(query);
      });
    });
  }

  // Filter Account Logs
  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {

      document.querySelectorAll("[data-filter]").forEach(function (item) {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const filter = button.dataset.filter;

      document.querySelectorAll("[data-category]").forEach(function (card) {
        card.hidden =
          filter !== "all" &&
          card.dataset.category !== filter;
      });
    });
  });

  // Demo profile update
  const saveProfile = document.querySelector("[data-save-profile]");

  if (saveProfile) {
    saveProfile.addEventListener("click", function () {
      const emailField = document.querySelector("[data-email-field]");
      const emailDisplay = document.querySelector("[data-profile-email]");

      if (!emailField || !emailDisplay) return;

      const email = emailField.value.trim();

      if (!emailField.checkValidity() || !email) {
        alert("Please enter a valid email address.");
        return;
      }

      emailDisplay.textContent = email;

      alert(
        "Demo profile updated on this page only. Configure a backend to save account changes."
      );
    });
  }

  // Change password goes to the password recovery screen in this demo
  const changePassword = document.querySelector("[data-change-password]");

  if (changePassword) {
    changePassword.addEventListener("click", function () {
      window.location.href = "forgot-password.html";
    });
  }

  // Demo logout
  const logoutButton = document.querySelector("[data-logout]");

  if (logoutButton) {
    logoutButton.addEventListener("click", async function () {

      if (!confirm("Log out?")) return;

      try {
        await loadFirebase();
        await firebase.auth().signOut();
      } catch (error) {
        console.error("Sign-out error:", error);
      }

      window.location.href = "login.html";
    });
  }

});
