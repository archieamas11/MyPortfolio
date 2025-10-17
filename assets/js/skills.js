document.addEventListener("DOMContentLoaded", function () {
  const skillsGrid = document.querySelector(".skills-grid");
  const skillItems = document.querySelectorAll(".skill-item");
  skillItems.forEach((item, index) => {
    item.style.setProperty("--index", index);
  });
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const skillsGrid = entry.target;
          requestAnimationFrame(() => {
            skillsGrid.classList.add("loaded");
          });
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.3,
    }
  );
  if (skillsGrid) {
    observer.observe(skillsGrid);
    window.addEventListener("beforeunload", () => {
      observer.unobserve(skillsGrid);
      observer.disconnect();
    });
  }
  skillItems.forEach((item) => {
    item.addEventListener("click", () => {
      const skillName = item.querySelector("h6").textContent;
      console.log(`Clicked on ${skillName} skill`);
      // TODO: Show detailed skill information modal
    });
  });
});

function updateSkillProgress() {
  const progressBars = document.querySelectorAll(".progress-bar");
  progressBars.forEach((bar) => {
    const progress = bar.style.getPropertyValue("--progress");
    if (progress) {
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        bar.style.width = progress;
      });
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { updateSkillProgress };
}
