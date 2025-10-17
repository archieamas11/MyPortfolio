let logo = document.getElementById("logo");
let title = document.getElementById("title");
let nav = document.getElementById("nav");
let sidebar = document.getElementById("sidebar");
let totop = document.getElementById("totop");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("beforeunload", function () {
  window.scrollTo(0, 0);
});

// Force scroll to top on page load
// window.addEventListener('load', function () {
//   setTimeout(function () {
//     window.scrollTo(0, 0);
//   }, 10);
// });

document.addEventListener("DOMContentLoaded", function () {
  window.scrollTo(0, 0);

  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");

      if (targetId === "#hero") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Adjust this value as needed
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    });
  });
});

let lastScrollTop = 0;
window.addEventListener(
  "scroll",
  function () {
    let currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > lastScrollTop) {
      nav.classList.add("mini");
    } else {
      nav.classList.remove("mini");
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  },
  false
);

let items = document.querySelectorAll(".item");
let i = 0;

function animate() {
  if (i < items.length) {
    items[i].style.opacity = 1;
    items[i].style.transform = "translateY(0)";
    i++;
    setTimeout(animate, 150);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  animate();
});

try {
  let about = document.getElementById("about-me");
  let projects = document.getElementById("projects");
  let contact = document.getElementById("contact");

  let home_nav = document.getElementById("home-nav");
  let about_nav = document.getElementById("about-nav");
  let projects_nav = document.getElementById("projects-nav");
  let contact_nav = document.getElementById("contact-nav");

  window.addEventListener("scroll", function () {
    let scroll = window.scrollY;
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
  });
} catch (e) {
  console.log(e);
}

window.addEventListener("scroll", function () {
  for (let i = 0; i < items.length; i++) {
    let position = items[i].getBoundingClientRect();
    if (position.top > window.innerHeight - 10 || position.bottom < 20) {
      items[i].style.scale = "0.85";
    } else {
      items[i].style.scale = "1";
    }
  }
});

window.addEventListener("scroll", function () {
  let scroll = window.scrollY;
  if (scroll > 10) {
    logo.classList.add("scrolled");
  } else {
    logo.classList.remove("scrolled");
  }
});
