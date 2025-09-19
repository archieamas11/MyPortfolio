// Contact Form Handling
(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const endpoint = form.getAttribute('data-endpoint') || 'https://formspree.io/f/xandredl';

  const constraints = {
    name: { min: 2, max: 80 },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    subject: { min: 3, max: 120 },
    message: { min: 10, max: 3000 }
  };

  function setStatus(message, type = 'info') {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + type;
  }

  function validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    const rules = constraints[name];
    if (!rules) return null; // no specific rules

    if (!value) return 'This field is required.';
    if (rules.min && value.length < rules.min) return `Must be at least ${rules.min} characters.`;
    if (rules.max && value.length > rules.max) return `Must be at most ${rules.max} characters.`;
    if (rules.pattern && !rules.pattern.test(value)) return 'Invalid format.';
    return null;
  }

  function showFieldError(field, error) {
    removeFieldError(field);
    if (!error) return;
    const msg = document.createElement('div');
    msg.className = 'field-error';
    msg.textContent = error;
    msg.id = field.name + '-error';
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', msg.id);
    field.parentNode.appendChild(msg);
  }

  function removeFieldError(field) {
    field.removeAttribute('aria-invalid');
    const desc = field.getAttribute('aria-describedby');
    if (desc) {
      const existing = document.getElementById(desc);
      if (existing && existing.classList.contains('field-error')) existing.remove();
      field.removeAttribute('aria-describedby');
    }
  }

  function validateForm() {
    let valid = true;
    const elements = Array.from(form.elements).filter(el => ['INPUT','TEXTAREA'].includes(el.tagName));
    elements.forEach(el => {
      const err = validateField(el);
      showFieldError(el, err);
      if (err) valid = false;
    });
    return valid;
  }

  function serializeForm() {
    const data = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => { data[key] = value; });
    return data;
  }

  async function submitForm() {
    setStatus('Sending message...', 'pending');
    const payload = serializeForm();

    // Honeypot check
    if (payload.company) {
      setStatus('Submission blocked as spam.', 'error');
      return;
    }
    delete payload.company;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Server responded with ' + res.status);

      setStatus('Thank you! Your message has been sent successfully.', 'success');
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus('There was a problem sending your message. Please try again.', 'error');
      addRetry();
    }
  }

  function addRetry() {
    if (statusEl.querySelector('button')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'retry-btn';
    btn.textContent = 'Retry';
    btn.addEventListener('click', () => {
      submitForm();
    });
    statusEl.appendChild(document.createTextNode(' '));
    statusEl.appendChild(btn);
  }

  form.addEventListener('input', e => {
    const target = e.target;
    if (['INPUT','TEXTAREA'].includes(target.tagName)) {
      const err = validateField(target);
      showFieldError(target, err);
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    // Simple throttle to prevent double clicks
    if (form.dataset.submitting === 'true') return;

    const ok = validateForm();
    if (!ok) {
      setStatus('Please fix the errors in the form.', 'error');
      return;
    }
    form.dataset.submitting = 'true';
    submitForm().finally(() => {
      form.dataset.submitting = 'false';
    });
  });
})();
