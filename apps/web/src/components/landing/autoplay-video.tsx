"use client";

import { useEffect, useRef } from "react";

interface AutoplayVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Plays muted once the video is (almost) fully in view and pauses when it
 * scrolls away. Browsers only allow autoplay for muted video, so sound stays
 * off until the viewer unmutes via the controls. Nothing downloads until it
 * first becomes visible (`preload="none"`), and a manual pause is respected.
 */
export function AutoplayVideo({ src, poster, className }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let userPaused = false;
    let pausedByUs = false;

    const onPause = () => {
      if (pausedByUs) {
        pausedByUs = false;
        return;
      }
      if (!video.ended) userPaused = true;
    };
    video.addEventListener("pause", onPause);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.9) {
          if (!userPaused && video.paused) void video.play().catch(() => {});
        } else if (!video.paused) {
          pausedByUs = true;
          video.pause();
        }
      },
      { threshold: [0, 0.9] }
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      muted
      playsInline
      preload="none"
      poster={poster}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
