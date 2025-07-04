/**
 * Enhanced Project Video Handler
 * Handles auto-playing videos with intersection observer for better performance
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeProjectVideos();
});

function initializeProjectVideos() {
    const videos = document.querySelectorAll('.project-video');
    
    // Intersection Observer for performance optimization
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const loadingSpinner = video.parentElement.querySelector('.video-loading');
            const fallbackImage = video.parentElement.querySelector('.project-fallback-image');
            
            if (entry.isIntersecting) {
                // Start loading and playing video when it comes into view
                if (video.paused && video.readyState >= 2) {
                    video.play().catch(error => {
                        console.log('Auto-play failed:', error);
                        // Show fallback image if autoplay fails
                        handleVideoError(video, fallbackImage, loadingSpinner);
                    });
                }
            } else {
                // Pause video when out of view to save resources
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        threshold: 0.3, // Trigger when 30% of video is visible
        rootMargin: '50px' // Start loading 50px before entering viewport
    });

    // Set up each video
    videos.forEach(video => {
        const loadingSpinner = video.parentElement.querySelector('.video-loading');
        const fallbackImage = video.parentElement.querySelector('.project-fallback-image');
        
        // Mark video as loading initially
        video.setAttribute('data-loading', 'true');
        
        // Video event handlers
        video.addEventListener('loadstart', () => {
            if (loadingSpinner) loadingSpinner.style.opacity = '1';
        });
        
        video.addEventListener('canplay', () => {
            video.removeAttribute('data-loading');
            if (loadingSpinner) loadingSpinner.style.opacity = '0';
            
            // Try to play if in viewport
            const rect = video.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isInViewport) {
                video.play().catch(error => {
                    console.log('Auto-play failed:', error);
                    handleVideoError(video, fallbackImage, loadingSpinner);
                });
            }
        });
        
        video.addEventListener('error', () => {
            console.log('Video failed to load');
            handleVideoError(video, fallbackImage, loadingSpinner);
        });
        
        // Add hover effects
        video.addEventListener('mouseenter', () => {
            if (!video.paused) {
                video.style.filter = 'brightness(1.1)';
            }
        });
        
        video.addEventListener('mouseleave', () => {
            video.style.filter = 'brightness(1)';
        });
        
        // Start observing the video
        videoObserver.observe(video);
    });
}

function handleVideoError(video, fallbackImage, loadingSpinner) {
    // Hide video and loading spinner
    video.style.display = 'none';
    if (loadingSpinner) loadingSpinner.style.opacity = '0';
    
    // Show fallback image
    if (fallbackImage) {
        fallbackImage.style.display = 'block';
        fallbackImage.style.zIndex = '1';
    }
}

// Handle video loading optimization
function optimizeVideoLoading() {
    const videos = document.querySelectorAll('.project-video');
    
    videos.forEach(video => {
        // Set video quality based on screen size
        if (window.innerWidth <= 768) {
            // For mobile, we might want to use lower quality videos
            video.setAttribute('preload', 'none');
        } else {
            video.setAttribute('preload', 'metadata');
        }
    });
}

// Call optimization on resize
window.addEventListener('resize', optimizeVideoLoading);

// Initial optimization
optimizeVideoLoading();

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Pause all videos when ESC is pressed
        const videos = document.querySelectorAll('.project-video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
    }
});

// Reduce motion preference
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const videos = document.querySelectorAll('.project-video');
    videos.forEach(video => {
        video.removeAttribute('autoplay');
        video.pause();
    });
}
