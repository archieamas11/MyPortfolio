(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const endpoint = form.getAttribute("data-endpoint") || "/api/submit-form";

  const constraints = {
    name: { min: 2, max: 80 },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    subject: { min: 3, max: 120 },
    message: { min: 10, max: 3000 },
  };

  const RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 6 };
  const MIN_FORM_TIME_MS = 2500;
  const FETCH_TIMEOUT = 10000;

  function setStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status " + type;
  }

  function validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    const rules = constraints[name];
    if (!rules) return null;

    if (!value) return "This field is required.";
    if (rules.min && value.length < rules.min)
      return `Must be at least ${rules.min} characters.`;
    if (rules.max && value.length > rules.max)
      return `Must be at most ${rules.max} characters.`;
    if (rules.pattern && !rules.pattern.test(value)) return "Invalid format.";
    return null;
  }

  function sanitize(input) {
    if (typeof input !== "string") return "";
    input = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, "");
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function showFieldError(field, error) {
    removeFieldError(field);
    if (!error) return;
    const msg = document.createElement("div");
    msg.className = "field-error";
    msg.textContent = error;
    msg.id = field.name + "-error";
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", msg.id);
    field.parentNode.appendChild(msg);
  }

  function removeFieldError(field) {
    field.removeAttribute("aria-invalid");
    const desc = field.getAttribute("aria-describedby");
    if (desc) {
      const existing = document.getElementById(desc);
      if (existing && existing.classList.contains("field-error"))
        existing.remove();
      field.removeAttribute("aria-describedby");
    }
  }

  function validateForm() {
    let valid = true;
    const elements = Array.from(form.elements).filter((el) =>
      ["INPUT", "TEXTAREA"].includes(el.tagName)
    );
    elements.forEach((el) => {
      const err = validateField(el);
      showFieldError(el, err);
      if (err) valid = false;
    });
    return valid;
  }

  function serializeForm() {
    const data = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      if (typeof value === "string") value = sanitize(value.trim());
      data[key] = value;
    });
    return data;
  }

  async function submitForm() {
    setStatus("Sending message...", "pending");
    const payload = serializeForm();

    if (payload.company) {
      setStatus("Submission blocked as spam.", "error");
      return;
    }
    delete payload.company;

    const turnstileResponse = document.querySelector(
      '[name="cf-turnstile-response"]'
    );
    if (!turnstileResponse || !turnstileResponse.value) {
      setStatus("Please complete the security verification.", "error");
      return;
    }
    payload["cf-turnstile-response"] = turnstileResponse.value;

    const loadedAt = parseInt(form.dataset.loadedAt || "0", 10);
    if (loadedAt > 0 && Date.now() - loadedAt < MIN_FORM_TIME_MS) {
      setStatus(
        "Form submitted too quickly. Please take a moment and try again.",
        "error"
      );
      return;
    }

    try {
      const key = "contact_form_rates_v1";
      const raw = localStorage.getItem(key);
      const now = Date.now();
      let state = raw ? JSON.parse(raw) : { windowStart: now, count: 0 };
      if (now - state.windowStart > RATE_LIMIT.windowMs)
        state = { windowStart: now, count: 0 };
      if (state.count >= RATE_LIMIT.max) {
        setStatus(
          "You have reached the maximum number of submissions. Please try again later.",
          "error"
        );
        return;
      }
      state.count += 1;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn("Rate limit storage unavailable", e);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const result = await res.json();

      if (!res.ok) {
        console.error("Contact form server error", res.status, result);
        throw new Error(result.error || "Server error");
      }

      setStatus(
        result.message || "Thank you! Your message has been sent successfully.",
        "success"
      );
      form.reset();

      if (window.turnstile) {
        const turnstileWidget = document.querySelector(".cf-turnstile");
        if (turnstileWidget) {
          window.turnstile.reset(turnstileWidget);
        }
      }

      const elements = Array.from(form.elements).filter((el) =>
        ["INPUT", "TEXTAREA"].includes(el.tagName)
      );
      elements.forEach(removeFieldError);
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        setStatus(
          "Request timed out. Please check your connection and try again.",
          "error"
        );
      } else {
        console.error(err);
        const errorMessage =
          err.message ||
          "There was a problem sending your message. Please try again later.";
        setStatus(errorMessage, "error");
      }

      if (window.turnstile) {
        const turnstileWidget = document.querySelector(".cf-turnstile");
        if (turnstileWidget) {
          window.turnstile.reset(turnstileWidget);
        }
      }

      addRetry();
    }
  }

  try {
    form.dataset.loadedAt = Date.now().toString();
  } catch (e) {
    /* ignore */
  }

  function addRetry() {
    if (statusEl.querySelector("button")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "retry-btn";
    btn.textContent = "Retry";
    btn.addEventListener("click", () => {
      submitForm();
    });
    statusEl.appendChild(document.createTextNode(" "));
    statusEl.appendChild(btn);
  }

  form.addEventListener("input", (e) => {
    const target = e.target;
    if (["INPUT", "TEXTAREA"].includes(target.tagName)) {
      const err = validateField(target);
      showFieldError(target, err);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (form.dataset.submitting === "true") return;

    const ok = validateForm();
    if (!ok) {
      setStatus("Please fix the errors in the form.", "error");
      return;
    }
    form.dataset.submitting = "true";
    submitForm().finally(() => {
      form.dataset.submitting = "false";
    });
  });
})();
