// Skills Animation Handler
document.addEventListener('DOMContentLoaded', function() {
    const skillsGrid = document.querySelector('.skills-grid');
    const skillItems = document.querySelectorAll('.skill-item');
    // Add index for staggered animation
    skillItems.forEach((item, index) => {
        item.style.setProperty('--index', index);
    });
    // Intersection Observer for progress bar animation
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillsGrid = entry.target;
                // Use requestAnimationFrame for smoother animation
                requestAnimationFrame(() => {
                    skillsGrid.classList.add('loaded');
                });
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    if (skillsGrid) {
        observer.observe(skillsGrid);
        // Cleanup observer on unload
        window.addEventListener('beforeunload', () => {
            observer.unobserve(skillsGrid);
            observer.disconnect();
        });
    }
    // Skill item click handler for potential future features
    skillItems.forEach(item => {
        item.addEventListener('click', () => {
            const skillName = item.querySelector('h6').textContent;
            console.log(`Clicked on ${skillName} skill`);
            // Future: Show detailed skill information modal
        });
    });
});

// Progress bar value update animation (use requestAnimationFrame)
function updateSkillProgress() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const progress = bar.style.getPropertyValue('--progress');
        if (progress) {
            bar.style.width = '0%';
            requestAnimationFrame(() => {
                bar.style.width = progress;
            });
        }
    });
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateSkillProgress };
}
