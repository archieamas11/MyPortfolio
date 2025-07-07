/**
 * Enhanced Project Video Handler
 * Handles auto-playing videos with intersection observer for better performance
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeProjectVideos();
});

function initializeProjectVideos() {
    const videos = document.querySelectorAll('.project-video');
    
    // Use WeakMap to store video states for better memory management
    const videoStates = new WeakMap();
    
    // Debounce function for performance
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // Intersection Observer with better performance settings
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const state = videoStates.get(video);
            
            if (entry.isIntersecting) {
                // Only try to play if video is ready and not already playing
                if (video.paused && video.readyState >= 2 && !state?.isPlaying) {
                    videoStates.set(video, { ...state, isPlaying: true });
                    video.play().catch(error => {
                        console.log('Auto-play failed:', error);
                        handleVideoError(video, state?.fallbackImage, state?.loadingSpinner);
                        videoStates.set(video, { ...state, isPlaying: false });
                    });
                }
            } else {
                // Pause video when out of view
                if (!video.paused && state?.isPlaying) {
                    video.pause();
                    videoStates.set(video, { ...state, isPlaying: false });
                }
            }
        });
    }, {
        threshold: 0.1, // Reduced threshold for better performance
        rootMargin: '50px' // Increased margin for smoother experience
    });

    // Set up each video with optimizations
    videos.forEach(video => {
        const loadingSpinner = video.parentElement.querySelector('.video-loading');
        const fallbackImage = video.parentElement.querySelector('.project-fallback-image');
        
        // Store references in WeakMap
        videoStates.set(video, {
            loadingSpinner,
            fallbackImage,
            isPlaying: false,
            hasLoaded: false
        });
        
        // Lazy load video source
        if (video.hasAttribute('data-src')) {
            video.src = video.getAttribute('data-src');
            video.removeAttribute('data-src');
        }
        
        // Optimized event handlers
        video.addEventListener('loadstart', () => {
            const state = videoStates.get(video);
            if (state?.loadingSpinner) {
                state.loadingSpinner.style.opacity = '1';
            }
        }, { once: true });
        
        video.addEventListener('canplay', () => {
            const state = videoStates.get(video);
            videoStates.set(video, { ...state, hasLoaded: true });
            
            if (state?.loadingSpinner) {
                state.loadingSpinner.style.opacity = '0';
            }
            
            // Check if video is in viewport using modern API
            if (video.checkVisibility?.() ?? isElementInViewport(video)) {
                video.play().catch(error => {
                    console.log('Auto-play failed:', error);
                    handleVideoError(video, state?.fallbackImage, state?.loadingSpinner);
                });
            }
        }, { once: true });
        
        video.addEventListener('error', () => {
            const state = videoStates.get(video);
            handleVideoError(video, state?.fallbackImage, state?.loadingSpinner);
        });
        
        // Optimized hover effects with RAF
        let hoverRAF;
        video.addEventListener('mouseenter', () => {
            if (hoverRAF) cancelAnimationFrame(hoverRAF);
            hoverRAF = requestAnimationFrame(() => {
                if (!video.paused) {
                    video.style.filter = 'brightness(1.1)';
                }
            });
        });
        
        video.addEventListener('mouseleave', () => {
            if (hoverRAF) cancelAnimationFrame(hoverRAF);
            hoverRAF = requestAnimationFrame(() => {
                video.style.filter = 'brightness(1)';
            });
        });
        
        // Start observing
        videoObserver.observe(video);
    });
}

// Optimized viewport check fallback
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function handleVideoError(video, fallbackImage, loadingSpinner) {
    // Use RAF for smooth transitions
    requestAnimationFrame(() => {
        video.style.display = 'none';
        if (loadingSpinner) loadingSpinner.style.opacity = '0';
        
        if (fallbackImage) {
            fallbackImage.style.display = 'block';
            fallbackImage.style.zIndex = '1';
        }
    });
}

// Optimized video loading with connection awareness
function optimizeVideoLoading() {
    const videos = document.querySelectorAll('.project-video');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    videos.forEach(video => {
        // Adaptive preloading based on connection
        if (connection && connection.effectiveType) {
            switch (connection.effectiveType) {
                case 'slow-2g':
                case '2g':
                    video.setAttribute('preload', 'none');
                    break;
                case '3g':
                    video.setAttribute('preload', 'metadata');
                    break;
                case '4g':
                default:
                    video.setAttribute('preload', 'auto');
            }
        } else {
            // Fallback based on screen size
            video.setAttribute('preload', window.innerWidth <= 768 ? 'none' : 'metadata');
        }
    });
}

// Debounced resize handler
const debouncedOptimize = debounce(optimizeVideoLoading, 250);
window.addEventListener('resize', debouncedOptimize);

// Initial optimization
optimizeVideoLoading();

// Enhanced accessibility with focus management
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const videos = document.querySelectorAll('.project-video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
    }
});

// Optimized reduced motion handling
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function handleReducedMotion() {
    const videos = document.querySelectorAll('.project-video');
    videos.forEach(video => {
        if (prefersReducedMotion.matches) {
            video.removeAttribute('autoplay');
            video.pause();
        }
    });
}

// Listen for changes in motion preference
prefersReducedMotion.addEventListener('change', handleReducedMotion);
handleReducedMotion();

// Memory cleanup on page unload
window.addEventListener('beforeunload', () => {
    const videos = document.querySelectorAll('.project-video');
    videos.forEach(video => {
        video.pause();
        video.src = '';
        video.load();
    });
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
