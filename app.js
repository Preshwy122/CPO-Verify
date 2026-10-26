
/*
  CPOVERIFY shared JavaScript.

  Demo only:
  Connect a secure backend before enabling real accounts,
  authentication, wallet credits, and live purchases.
*/

document.addEventListener("DOMContentLoaded", function () {

  // Automatic footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Demo login, registration, and password recovery forms
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Basic confirmation-password check on registration
      const password = form.querySelector(
        '[name="password"]'
      );
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

  // Google sign-in placeholder
  document.querySelectorAll("[data-google-demo]").forEach(function (button) {
    button.addEventListener("click", function () {
      alert(
        "Google sign-in requires OAuth configuration and a secure authentication provider."
      );
    });
  });

  // WhatsApp wallet deposit link
  document.querySelectorAll("[data-deposit]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      // Replace with your official WhatsApp number.
      // Use country code only, without +, spaces, or dashes.
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
    logoutButton.addEventListener("click", function () {
      if (confirm("Log out of the demo?")) {
        window.location.href = "login.html";
      }
    });
  }

});
