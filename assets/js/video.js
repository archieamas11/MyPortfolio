document.querySelectorAll(".project-visual").forEach((container) => {
  const video = container.querySelector("video.full-image");
  let videoLoaded = false;

  container.addEventListener("mouseenter", () => {
    if (video && !videoLoaded) {
      video.src = video.dataset.src;
      videoLoaded = true;

      video.addEventListener("loadeddata", () => {
        video.currentTime = 0;
        video.play();
      });
    } else if (video && videoLoaded) {
      video.currentTime = 0;
      video.play();
    }
  });

  container.addEventListener("mouseleave", () => {
    if (video && videoLoaded) {
      video.pause();
      video.currentTime = 0;
    }
  });
});
