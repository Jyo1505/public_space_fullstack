const API_BASE = "https://public-space-fullstack-1.onrender.com";
window.addEventListener("load", () => {
  fetch(`${API_BASE}/health`)
    .then(() => console.log("Backend awake"))
    .catch(() => console.log("Backend still waking"));
});
// Tabs
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
});

// const API_BASE = "/api/auth";

// REGISTER
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const msgEl = document.getElementById("register-message");

  msgEl.textContent = "Registering...";

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    console.log("Register response:", data);

    msgEl.textContent = data.message || "Registered";

    if (res.ok) {
      // switch to login tab on success
      tabLogin.click();
    }
  } catch (err) {
    console.error(err);
    msgEl.textContent = "Error connecting to server";
  }
});

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const msgEl = document.getElementById("login-message");

  msgEl.textContent = "Logging in...";

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    msgEl.textContent = data.message || "Logged in";

    if (res.ok && data.token) {
      // ✅ save token
      localStorage.setItem("token", data.token);

      // ✅ redirect to feed
      window.location.href = "/feed.html";
    }
  } catch (err) {
    console.error(err);
    msgEl.textContent = "Error connecting to server";
  }
});

(function () {
  // Elements
  const form = document.getElementById("register-form");
  const nameEl = document.getElementById("name");
  const usernameEl = document.getElementById("username");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const confEl = document.getElementById("confirmPassword");
  const termsEl = document.getElementById("terms");
  const registerBtn = document.getElementById("register-btn");
  const messageEl = document.getElementById("form-message");
  const strengthFill = document.getElementById("strength-fill");

  // error helper
  const err = (id, txt="") => document.getElementById(id).textContent = txt;

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  const allowedDomains = ["gmail.com","yahoo.com","outlook.com","hotmail.com","icloud.com"];
  function getDomain(email) {
    const p = (email || "").split("@");
    return p.length > 1 ? p[1].toLowerCase() : "";
  }

  // Username validation
  const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;

  // Password scoring
  function passwordScore(pwd) {
    let s = 0;
    if (!pwd) return s;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  }

  function updateStrengthUI() {
    const pwd = passEl.value || "";
    const s = passwordScore(pwd);
    strengthFill.style.width = (s / 5) * 100 + "%";
  }

  function validateAll() {
    let ok = true;

    // Name
    if (!nameEl.value.trim()) {
      err("err-name","Name is required.");
      ok = false;
    } else err("err-name","");

    // Username (optional but must follow rules if entered)
    if (usernameEl.value.trim()) {
      if (!usernamePattern.test(usernameEl.value.trim())) {
        err("err-username","Username must be 3–30 chars, letters/numbers/-/_ only.");
        ok = false;
      } else err("err-username","");
    } else err("err-username","");

    // Email
    const email = emailEl.value.trim();
    if (!email) {
      err("err-email","Email is required.");
      ok = false;
    } else if (!emailPattern.test(email)) {
      err("err-email","Enter a valid email.");
      ok = false;
    } else {
      const domain = getDomain(email);
      if (!allowedDomains.includes(domain)) {
        err("err-email",`Uncommon domain (${domain}). Recommended: ${allowedDomains.join(", ")}`);
      } else err("err-email","");
    }

    // Password
    const pwd = passEl.value;
    const score = passwordScore(pwd);
    if (!pwd) {
      err("err-password","Password is required.");
      ok = false;
    } else if (pwd.length < 8) {
      err("err-password","Password must be at least 8 characters.");
      ok = false;
    } else if (score < 3) {
      err("err-password","Use stronger password: upper, lower, digit, symbol.");
      ok = false;
    } else err("err-password","");

    // Confirm password
    if (confEl.value !== passEl.value) {
      err("err-confirm","Passwords do not match.");
      ok = false;
    } else err("err-confirm","");

    // Terms
    if (!termsEl.checked) {
      err("err-terms","You must accept register as per provide information .");
      ok = false;
    } else err("err-terms","");

    registerBtn.disabled = !ok;
    return ok;
  }

  // Listeners
  [nameEl, usernameEl, emailEl, passEl, confEl, termsEl].forEach(el => {
    el.addEventListener("input", () => {
      updateStrengthUI();
      validateAll();
    });
  });

  updateStrengthUI();
  validateAll();

  // Submit handler
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!validateAll()) return;
    messageEl.textContent = "";

    const payload = {
      name: nameEl.value.trim(),
      username: usernameEl.value.trim() || null,
      email: emailEl.value.trim(),
      password: passEl.value,
    };

    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        messageEl.textContent = data.message || "Registration failed.";
        registerBtn.disabled = false;
        registerBtn.textContent = "Register";
        return;
      }

      messageEl.textContent = data.message || "Registered successfully! Redirecting...";
      setTimeout(() => (window.location.href = "/"), 1200);

    } catch (err) {
      console.error("Register error", err);
      messageEl.textContent = "Network error.";
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  });


})();

document.querySelectorAll(".toggle-pass").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    if (!input) return;

    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    icon.textContent = isHidden ? "🙈" : "👁";
  });
});