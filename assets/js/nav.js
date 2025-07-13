// Cache DOM references once
const logo = document.getElementById("logo");
const title = document.getElementById("title");
const nav = document.getElementById("nav");
const totop = document.getElementById("totop");
const sidebar = document.getElementById("sidebar");

// Disable browser's scroll restoration and ensure page starts at top
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Ensure page starts at the top on refresh
window.addEventListener('beforeunload', function () {
  window.scrollTo(0, 0);
});

// Force scroll to top on page load
window.addEventListener('load', function () {
  setTimeout(function () {
    window.scrollTo(0, 0);
  }, 10);
});

// Also ensure it starts at top when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  window.scrollTo(0, 0);

  // Handle smooth scrolling for navigation links with offset
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');

      if (targetId === '#hero') {
        // For home link, scroll to the very top
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        // For other sections, scroll with offset
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Adjust this value as needed
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});

// Throttle utility
function throttle(fn, wait) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// Shrinks the nav bar when the user scrolls down and show it when the user scrolls up (throttled)
let lastScrollTop = 0;
const handleNavScroll = throttle(function () {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop) {
    nav.classList.add("mini");
    // sidebar.classList.add('mini-sidebar');
  } else {
    nav.classList.remove("mini");
    // sidebar.classList.remove('mini-sidebar');
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, 50);
window.addEventListener("scroll", handleNavScroll, { passive: true });

// Animate each item one by one when the page is loaded using requestAnimationFrame
let items;
function animateItems() {
  let i = 0;
  function step() {
    if (i < items.length) {
      items[i].style.opacity = 1;
      items[i].style.transform = "translateY(0)";
      i++;
      setTimeout(() => requestAnimationFrame(step), 100); // Faster, smoother
    }
  }
  requestAnimationFrame(step);
}
document.addEventListener("DOMContentLoaded", function () {
  items = document.querySelectorAll(".item");
  animateItems();
});

// Change the active nav to the current scroll position based on sections (throttled)
let hero, about, projects, contact;
let home_nav, about_nav, projects_nav, contact_nav;
document.addEventListener("DOMContentLoaded", function () {
  hero = document.getElementById("hero");
  about = document.getElementById("about-me");
  projects = document.getElementById("projects");
  contact = document.getElementById("contact");
  home_nav = document.getElementById("home-nav");
  about_nav = document.getElementById("about-nav");
  projects_nav = document.getElementById("projects-nav");
  contact_nav = document.getElementById("contact-nav");
});
const handleActiveNav = throttle(function () {
  if (!about || !projects || !contact || !home_nav) return;
  const scroll = window.scrollY;
  if (scroll < about.offsetTop - 400) {
    home_nav.classList.add("active");
    about_nav.classList.remove("active");
    projects_nav.classList.remove("active");
    contact_nav.classList.remove("active");
  } else if (scroll < projects.offsetTop - 400) {
    home_nav.classList.remove("active");
    about_nav.classList.add("active");
    projects_nav.classList.remove("active");
    contact_nav.classList.remove("active");
  } else if (scroll < contact.offsetTop - 400) {
    home_nav.classList.remove("active");
    about_nav.classList.remove("active");
    projects_nav.classList.add("active");
    contact_nav.classList.remove("active");
  } else {
    home_nav.classList.remove("active");
    about_nav.classList.remove("active");
    projects_nav.classList.remove("active");
    contact_nav.classList.add("active");
  }
}, 50);
window.addEventListener("scroll", handleActiveNav, { passive: true });

// Depth effect for items when they go outside the screen (throttled)
const handleDepthEffect = throttle(function () {
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    const position = items[i].getBoundingClientRect();
    if (position.top > window.innerHeight - 10 || position.bottom < 20) {
      items[i].style.scale = "0.85";
    } else {
      items[i].style.scale = "1";
    }
  }
}, 50);
window.addEventListener("scroll", handleDepthEffect, { passive: true });

// Logo effect on scroll (throttled)
const handleLogoScroll = throttle(function () {
  const scroll = window.scrollY;
  if (scroll > 20) {
    logo.classList.add("scrolled");
  } else {
    logo.classList.remove("scrolled");
  }
}, 50);
window.addEventListener("scroll", handleLogoScroll, { passive: true });
window.addEventListener('beforeunload', function () {
  window.removeEventListener("scroll", handleNavScroll);
  window.removeEventListener("scroll", handleDepthEffect);
  window.removeEventListener("scroll", handleLogoScroll);
  window.removeEventListener("scroll", handleActiveNav);
});
