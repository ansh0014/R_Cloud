import { useEffect, useState, useRef } from 'react';
import MorphingParticleCanvas from './MorphingParticleCanvas';

interface FloatingStoryCanvasProps {
  currentStep: number; // -1 for Hero (Cube), 0..3 for Story steps
}

export default function FloatingStoryCanvas({ currentStep }: FloatingStoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lightProgress, setLightProgress] = useState(0);
  const lastProgressRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  const posRef = useRef({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
    initialized: false,
  });

  useEffect(() => {
    const updatePosition = () => {
      const heroSlot = document.getElementById('hero-sphere-slot');
      const storySlot = document.getElementById('story-sphere-slot');

      if (!heroSlot || !storySlot || !containerRef.current) {
        requestRef.current = requestAnimationFrame(updatePosition);
        return;
      }

      const heroRect = heroSlot.getBoundingClientRect();
      const storyRect = storySlot.getBoundingClientRect();

      const storySection = document.getElementById('how-it-works');
      const sectionTop = storySection ? storySection.getBoundingClientRect().top : storyRect.top;
      const sectionBottom = storySection ? storySection.getBoundingClientRect().bottom : 9999;

      const windowHeight = window.innerHeight;
      // Transition thresholds
      const transitionStart = windowHeight * 0.75;
      const transitionEnd = 100;

      let targetTop = 0;
      let targetLeft = 0;
      let targetWidth = 0;
      let targetHeight = 0;
      let targetOpacity = 1;
      let progressVal = 0;

      if (sectionTop > transitionStart) {
        // Firmly in Hero (Cube)
        targetTop = heroRect.top;
        targetLeft = heroRect.left;
        targetWidth = heroRect.width;
        targetHeight = heroRect.height;
        targetOpacity = heroRect.bottom < 0 ? 0 : 1;
        progressVal = 0;
      } else if (sectionTop > transitionEnd && heroRect.bottom > 0) {
        // Smoothly interpolating from Hero to Story slot
        const rawProgress = (transitionStart - sectionTop) / (transitionStart - transitionEnd);
        const progress = Math.min(1, Math.max(0, rawProgress));
        const ease = progress * progress * (3 - 2 * progress);
        progressVal = ease;

        targetTop = heroRect.top + (storyRect.top - heroRect.top) * ease;
        targetLeft = heroRect.left + (storyRect.left - heroRect.left) * ease;
        targetWidth = heroRect.width + (storyRect.width - heroRect.width) * ease;
        targetHeight = heroRect.height + (storyRect.height - heroRect.height) * ease;
        targetOpacity = 1;
      } else {
        // Firmly inside Story section - pinned to storySlot
        targetTop = storyRect.top;
        targetLeft = storyRect.left;
        targetWidth = storyRect.width;
        targetHeight = storyRect.height;

        // Smooth fade out when scrolling past the bottom of Story section
        if (sectionBottom < windowHeight * 0.5) {
          targetOpacity = Math.max(0, Math.min(1, (sectionBottom - 80) / (windowHeight * 0.35)));
        } else {
          targetOpacity = 1;
        }
        progressVal = 1;
      }

      // Smooth lerp interpolation for silky motion
      if (!posRef.current.initialized) {
        posRef.current = {
          top: targetTop,
          left: targetLeft,
          width: targetWidth,
          height: targetHeight,
          opacity: targetOpacity,
          initialized: true,
        };
      } else {
        const lerpFactor = 0.16;
        posRef.current.top += (targetTop - posRef.current.top) * lerpFactor;
        posRef.current.left += (targetLeft - posRef.current.left) * lerpFactor;
        posRef.current.width += (targetWidth - posRef.current.width) * lerpFactor;
        posRef.current.height += (targetHeight - posRef.current.height) * lerpFactor;
        posRef.current.opacity += (targetOpacity - posRef.current.opacity) * 0.2;
      }

      // Direct DOM update (no React re-render lag!)
      const el = containerRef.current;
      el.style.top = `${posRef.current.top}px`;
      el.style.left = `${posRef.current.left}px`;
      el.style.width = `${posRef.current.width}px`;
      el.style.height = `${posRef.current.height}px`;
      el.style.opacity = `${posRef.current.opacity}`;
      el.style.pointerEvents = 'none';

      // Update light progress only when stepping significantly to avoid re-renders
      if (Math.abs(progressVal - lastProgressRef.current) > 0.05 || progressVal === 0 || progressVal === 1) {
        lastProgressRef.current = progressVal;
        setLightProgress(progressVal);
      }

      requestRef.current = requestAnimationFrame(updatePosition);
    };

    requestRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 25,
        opacity: 0,
        pointerEvents: 'none',
        willChange: 'top, left, width, height',
      }}
    >
      <MorphingParticleCanvas
        currentStep={currentStep}
        lightProgress={currentStep >= 0 ? 1 : lightProgress}
      />
    </div>
  );
}
