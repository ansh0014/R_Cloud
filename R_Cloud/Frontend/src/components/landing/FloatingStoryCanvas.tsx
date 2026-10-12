import { useEffect, useState, useRef } from 'react';
import MorphingParticleCanvas from './MorphingParticleCanvas';

interface FloatingStoryCanvasProps {
  currentStep: number; // -1 for Hero (Sphere), 0..3 for Story steps
}

export default function FloatingStoryCanvas({ currentStep }: FloatingStoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lightProgress, setLightProgress] = useState(0);
  const lastProgressRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const heroSlot = document.getElementById('hero-sphere-slot');
      const storySlot = document.getElementById('story-sphere-slot');
      const bentoSlot = document.getElementById('bento-sphere-slot');

      if (!heroSlot || !storySlot || !containerRef.current) {
        requestRef.current = requestAnimationFrame(updatePosition);
        return;
      }

      const heroRect = heroSlot.getBoundingClientRect();
      const storyRect = storySlot.getBoundingClientRect();
      const bentoRect = bentoSlot ? bentoSlot.getBoundingClientRect() : null;

      const storySection = document.getElementById('how-it-works');
      const bentoSection = document.getElementById('features');

      const sectionTop = storySection ? storySection.getBoundingClientRect().top : storyRect.top;
      const bentoTop = bentoSection ? bentoSection.getBoundingClientRect().top : 9999;
      const bentoBottom = bentoSection ? bentoSection.getBoundingClientRect().bottom : 9999;

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
        // Firmly in Hero
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
      } else if (bentoRect && bentoTop <= windowHeight * 0.75 && bentoTop > transitionEnd) {
        // Smoothly interpolating from Story slot to Bento slot
        const rawProgress = (windowHeight * 0.75 - bentoTop) / (windowHeight * 0.75 - transitionEnd);
        const progress = Math.min(1, Math.max(0, rawProgress));
        const ease = progress * progress * (3 - 2 * progress);
        progressVal = 1;

        targetTop = storyRect.top + (bentoRect.top - storyRect.top) * ease;
        targetLeft = storyRect.left + (bentoRect.left - storyRect.left) * ease;
        targetWidth = storyRect.width + (bentoRect.width - storyRect.width) * ease;
        targetHeight = storyRect.height + (bentoRect.height - storyRect.height) * ease;
        targetOpacity = 1;
      } else if (bentoRect && bentoTop <= transitionEnd) {
        // Firmly over Bento Features section (hovering over the bento grid as 3D Rectangle!)
        targetTop = bentoRect.top;
        targetLeft = bentoRect.left;
        targetWidth = bentoRect.width;
        targetHeight = bentoRect.height;

        // Smooth exit fade only when scrolling past the bottom of Bento Features
        if (bentoBottom < windowHeight * 0.6) {
          targetOpacity = Math.max(0, Math.min(1, (bentoBottom - 100) / (windowHeight * 0.4)));
        } else {
          targetOpacity = 1;
        }
        progressVal = 1;
      } else {
        // Firmly inside Story section - pinned to storySlot
        targetTop = storyRect.top;
        targetLeft = storyRect.left;
        targetWidth = storyRect.width;
        targetHeight = storyRect.height;
        targetOpacity = 1;
        progressVal = 1;
      }

      // Direct DOM update (no React re-render lag!)
      const el = containerRef.current;
      el.style.top = `${targetTop}px`;
      el.style.left = `${targetLeft}px`;
      el.style.width = `${targetWidth}px`;
      el.style.height = `${targetHeight}px`;
      el.style.opacity = `${targetOpacity}`;
      el.style.pointerEvents = targetOpacity > 0 ? 'auto' : 'none';

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
