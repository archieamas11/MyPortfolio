// Skills Animation Handler
document.addEventListener('DOMContentLoaded', function() {
    const skillsGrid = document.querySelector('.skills-grid');
    const skillItems = document.querySelectorAll('.skill-item');
    
    // Add index for staggered animation
    skillItems.forEach((item, index) => {
        item.style.setProperty('--index', index);
    });
    
    // Intersection Observer for progress bar animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillsGrid = entry.target;
                setTimeout(() => {
                    skillsGrid.classList.add('loaded');
                }, 300);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    
    if (skillsGrid) {
        observer.observe(skillsGrid);
    }
    
    // Add hover sound effect (optional - requires audio files)
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Optional: Add subtle hover sound
            // const audio = new Audio('path/to/hover-sound.mp3');
            // audio.volume = 0.1;
            // audio.play().catch(() => {}); // Ignore if autoplay is blocked
        });
    });
    
    // Skill item click handler for potential future features
    skillItems.forEach(item => {
        item.addEventListener('click', () => {
            const skillName = item.querySelector('h6').textContent;
            console.log(`Clicked on ${skillName} skill`);
            // Future: Show detailed skill information modal
        });
    });
});

// Progress bar value update animation
function updateSkillProgress() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const progress = bar.style.getPropertyValue('--progress');
        if (progress) {
            // Animate from 0 to target value
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = progress;
            }, 100);
        }
    });
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateSkillProgress };
}
