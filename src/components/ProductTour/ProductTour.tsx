import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Home,
  Clock,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Rocket,
} from 'lucide-react';
import { useProductTour } from '../../hooks/useProductTour';
import type { TourStep } from './tourSteps';
import './ProductTour.css';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

type Placement = 'top' | 'right' | 'bottom' | 'left';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

function getElementRect(selector: string, padding = 8): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - padding,
    left: r.left - padding,
    width: r.width + padding * 2,
    height: r.height + padding * 2,
    right: r.right + padding,
    bottom: r.bottom + padding,
  };
}

function computePlacement(
  preferredPlacement: TourStep['placement'],
  targetRect: Rect,
  tooltipWidth: number,
  tooltipHeight: number
): Placement {
  if (preferredPlacement !== 'auto') {
    // Validate the preferred placement fits in viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    switch (preferredPlacement) {
      case 'bottom':
        if (targetRect.bottom + tooltipHeight + 20 < vh) return 'bottom';
        break;
      case 'top':
        if (targetRect.top - tooltipHeight - 20 > 0) return 'top';
        break;
      case 'right':
        if (targetRect.right + tooltipWidth + 20 < vw) return 'right';
        break;
      case 'left':
        if (targetRect.left - tooltipWidth - 20 > 0) return 'left';
        break;
    }
  }

  // Auto-detect best placement
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - targetRect.bottom;
  const spaceAbove = targetRect.top;
  const spaceRight = vw - targetRect.right;
  const spaceLeft = targetRect.left;

  const spaces: [Placement, number][] = [
    ['bottom', spaceBelow],
    ['top', spaceAbove],
    ['right', spaceRight],
    ['left', spaceLeft],
  ];

  spaces.sort((a, b) => b[1] - a[1]);
  return spaces[0][0];
}

function getTooltipPosition(
  placement: Placement,
  targetRect: Rect,
  tooltipWidth: number,
  tooltipHeight: number
): { top: number; left: number } {
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'top':
      top = targetRect.top - tooltipHeight - gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + gap;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - gap;
      break;
  }

  // Clamp within viewport
  left = Math.max(12, Math.min(left, vw - tooltipWidth - 12));
  top = Math.max(12, Math.min(top, vh - tooltipHeight - 12));

  return { top, left };
}

function getArrowPosition(
  placement: Placement,
  targetRect: Rect
): { top: number; left: number } {
  const gap = 6;
  switch (placement) {
    case 'bottom':
      return {
        top: targetRect.bottom + gap,
        left: targetRect.left + targetRect.width / 2 - 8,
      };
    case 'top':
      return {
        top: targetRect.top - 24 - gap,
        left: targetRect.left + targetRect.width / 2 - 8,
      };
    case 'right':
      return {
        top: targetRect.top + targetRect.height / 2 - 8,
        left: targetRect.right + gap,
      };
    case 'left':
      return {
        top: targetRect.top + targetRect.height / 2 - 8,
        left: targetRect.left - 24 - gap,
      };
  }
}

function scrollToElement(selector: string): Promise<void> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (!el) {
      resolve();
      return;
    }
    const rect = el.getBoundingClientRect();
    const isInView =
      rect.top >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth;

    if (isInView) {
      resolve();
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    setTimeout(resolve, 500);
  });
}

// ─────────────────────────────────────────────
// Confetti
// ─────────────────────────────────────────────

function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#7c3aed', '#a78bfa', '#c084fc', '#10b981', '#f59e0b', '#ec4899', '#f97316'];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: 'square' | 'circle' | 'strip';
  }

  const particles: Particle[] = [];
  const shapes: Particle['shape'][] = ['square', 'circle', 'strip'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 20,
      vy: -(Math.random() * 15 + 5),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }

  let frameId: number;
  const gravity = 0.35;
  const friction = 0.99;

  function animate() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, p.opacity - 0.005);

      if (p.opacity <= 0) continue;
      alive = true;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;

      switch (p.shape) {
        case 'square':
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          break;
        case 'circle':
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
          break;
        case 'strip':
          ctx!.fillRect(-p.size / 2, -p.size * 1.5, p.size, p.size * 3);
          break;
      }

      ctx!.restore();
    }

    if (alive) {
      frameId = requestAnimationFrame(animate);
    }
  }

  animate();

  return () => {
    cancelAnimationFrame(frameId);
  };
}

// ─────────────────────────────────────────────
// Arrow Component
// ─────────────────────────────────────────────

const TourArrow: React.FC<{ placement: Placement; targetRect: Rect }> = ({
  placement,
  targetRect,
}) => {
  const pos = getArrowPosition(placement, targetRect);

  const arrowIcons = {
    bottom: <ArrowDown size={18} />,
    top: <ArrowUp size={18} />,
    right: <ArrowRightIcon size={18} />,
    left: <ArrowLeftIcon size={18} />,
  };

  return (
    <motion.div
      className="tour-arrow"
      data-placement={placement}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, top: pos.top, left: pos.left }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ position: 'fixed', color: '#a78bfa' }}
    >
      {arrowIcons[placement]}
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Welcome Modal
// ─────────────────────────────────────────────

const WelcomeModal: React.FC<{
  totalSteps: number;
  onStart: () => void;
  onSkip: () => void;
}> = ({ totalSteps, onStart, onSkip }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Card */}
      <motion.div
        className="tour-welcome-card"
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.1] }}
        role="dialog"
        aria-label="Welcome tour dialog"
        aria-modal="true"
      >
        {/* Floating orbs */}
        <div className="tour-orb tour-orb-1" />
        <div className="tour-orb tour-orb-2" />
        <div className="tour-orb tour-orb-3" />

        {/* Logo */}
        <motion.div
          className="tour-welcome-logo"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Home size={32} className="text-white" />
        </motion.div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'white',
                marginBottom: '8px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Welcome to Neo Scripting!
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                marginBottom: '4px',
              }}
            >
              Let us show you around! A quick guided tour will help you discover
              all the powerful features of your dashboard.
            </p>
          </motion.div>

          <motion.div
            className="tour-duration-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Clock size={14} />
            ~60 seconds · {totalSteps} steps
          </motion.div>

          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              className="tour-btn-primary"
              onClick={onStart}
              autoFocus
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '14px' }}
            >
              <Rocket size={18} />
              Start Tour
            </button>
            <button
              className="tour-btn-skip"
              onClick={onSkip}
              style={{ padding: '10px', fontSize: '13px' }}
            >
              Skip for Now
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Completion Screen
// ─────────────────────────────────────────────

const CompletionScreen: React.FC<{
  onDismiss: () => void;
}> = ({ onDismiss }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = launchConfetti(canvasRef.current);
      return cleanup;
    }
  }, []);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      />

      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="tour-confetti-canvas" />

      {/* Content */}
      <motion.div
        className="tour-completion-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.1] }}
      >
        <div className="tour-checkmark">
          <CheckCircle2 size={40} className="text-white" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: 'white',
              marginBottom: '12px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            🎉 You're all set!
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.55)',
              maxWidth: '420px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            You're now ready to explore everything Neo Scripting has to offer.
            Configure your briefs, manage your documents, and start writing!
          </p>
        </motion.div>

        <motion.button
          className="tour-btn-primary"
          onClick={onDismiss}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '14px' }}
        >
          Go to Dashboard
          <ArrowRightIcon size={16} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Spotlight Overlay (SVG mask approach)
// ─────────────────────────────────────────────

const SpotlightOverlay: React.FC<{
  targetRect: Rect | null;
  onClick: () => void;
}> = ({ targetRect, onClick }) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return (
    <div className="tour-overlay" onClick={onClick}>
      <svg className="tour-overlay-svg" viewBox={`0 0 ${vw} ${vh}`}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            {targetRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: targetRect.left,
                  y: targetRect.top,
                  width: targetRect.width,
                  height: targetRect.height,
                }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={vw}
          height={vh}
          fill="rgba(0,0,0,0.72)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────
// Tooltip Card
// ─────────────────────────────────────────────

const TourTooltip: React.FC<{
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  targetRect: Rect;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ step, stepIndex, totalSteps, progress, targetRect, onNext, onPrev, onSkip, isFirst, isLast }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 380, height: 280 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Measure tooltip after render
    const timer = setTimeout(() => {
      if (tooltipRef.current) {
        const r = tooltipRef.current.getBoundingClientRect();
        setTooltipSize({ width: r.width, height: r.height });
      }
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [step.id]);

  const placement = computePlacement(step.placement, targetRect, tooltipSize.width, tooltipSize.height);
  const pos = getTooltipPosition(placement, targetRect, tooltipSize.width, tooltipSize.height);

  const Icon = step.icon;

  return (
    <>
      {/* Arrow */}
      <TourArrow placement={placement} targetRect={targetRect} />

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        className="tour-tooltip"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: mounted ? 1 : 0,
          scale: 1,
          top: pos.top,
          left: pos.left,
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.45,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ position: 'fixed' }}
        role="dialog"
        aria-label={`Tour step ${stepIndex + 1}: ${step.title}`}
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tour-tooltip-card">
          {/* Step badge */}
          <div className="tour-step-badge">
            <Sparkles size={12} />
            Step {stepIndex + 1} of {totalSteps}
          </div>

          {/* Icon */}
          {Icon && (
            <motion.div
              className="tour-icon-circle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            >
              <Icon size={22} />
            </motion.div>
          )}

          {/* Title */}
          <motion.h3
            key={step.id + '-title'}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '8px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {step.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            key={step.id + '-desc'}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
              marginBottom: '4px',
            }}
          >
            {step.description}
          </motion.p>

          {/* Progress bar */}
          <div className="tour-progress-track">
            <motion.div
              className="tour-progress-fill"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '18px',
              gap: '8px',
            }}
          >
            <button className="tour-btn-skip" onClick={onSkip}>
              Skip Tutorial
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!isFirst && (
                <button
                  className="tour-btn-secondary"
                  onClick={onPrev}
                  aria-label="Previous step"
                >
                  <ChevronLeft size={16} />
                  {step.customButtonText?.prev || 'Back'}
                </button>
              )}
              <button
                className="tour-btn-primary"
                onClick={onNext}
                autoFocus
                aria-label={isLast ? 'Finish tour' : 'Next step'}
              >
                {isLast
                  ? step.customButtonText?.next || 'Finish 🎉'
                  : step.customButtonText?.next || 'Next'}
                {!isLast && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ─────────────────────────────────────────────
// Main ProductTour Component
// ─────────────────────────────────────────────

const ProductTour: React.FC = () => {
  const tour = useProductTour();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const recalcTimerRef = useRef<number | null>(null);

  // Dynamic class highlight to bring element above overlay
  useEffect(() => {
    if (tour.phase !== 'touring' || !tour.currentStep) return;

    const selector = tour.currentStep.target;
    let targetEl: HTMLElement | null = null;

    const highlight = () => {
      targetEl = document.querySelector(selector) as HTMLElement;
      if (targetEl) {
        targetEl.classList.add('tour-highlighted');
      }
    };

    highlight();

    // Check again if element mounts/renders later
    const obs = new MutationObserver(() => {
      if (!targetEl) highlight();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      if (targetEl) {
        targetEl.classList.remove('tour-highlighted');
      } else {
        document.querySelectorAll('.tour-highlighted').forEach((el) => {
          el.classList.remove('tour-highlighted');
        });
      }
    };
  }, [tour.phase, tour.currentStepIndex, tour.currentStep?.target]);

  // Recalculate target rect on step change + window resize
  const recalcRect = useCallback(() => {
    if (tour.phase !== 'touring' || !tour.currentStep) {
      setTargetRect(null);
      return;
    }

    const padding = tour.currentStep.spotlightPadding ?? 8;
    const rect = getElementRect(tour.currentStep.target, padding);
    setTargetRect(rect);
  }, [tour.phase, tour.currentStep]);

  // Scroll to element and calculate rect when step changes
  useEffect(() => {
    if (tour.phase !== 'touring' || !tour.currentStep) return;

    const step = tour.currentStep;

    // Try to find the element; if not found, use MutationObserver to wait
    const tryLocate = async () => {
      await scrollToElement(step.target);
      // Small delay for scroll to settle
      setTimeout(recalcRect, 100);
    };

    const el = document.querySelector(step.target);
    if (el) {
      tryLocate();
    } else {
      // Element might not be rendered yet — watch for it
      observerRef.current = new MutationObserver(() => {
        const found = document.querySelector(step.target);
        if (found) {
          observerRef.current?.disconnect();
          tryLocate();
        }
      });
      observerRef.current.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tour.phase, tour.currentStep, recalcRect]);

  // Recalc on resize/scroll
  useEffect(() => {
    if (tour.phase !== 'touring') return;

    const handleResize = () => {
      if (recalcTimerRef.current) cancelAnimationFrame(recalcTimerRef.current);
      recalcTimerRef.current = requestAnimationFrame(recalcRect);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (recalcTimerRef.current) cancelAnimationFrame(recalcTimerRef.current);
    };
  }, [tour.phase, recalcRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!tour.isTourActive) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          tour.skipTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (tour.phase === 'touring') {
            e.preventDefault();
            tour.nextStep();
          }
          break;
        case 'ArrowLeft':
          if (tour.phase === 'touring') {
            e.preventDefault();
            tour.prevStep();
          }
          break;
        case 'Tab':
          // Keep focus within tooltip
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tour]);

  // Don't render if idle
  if (tour.phase === 'idle') return null;

  return (
    <AnimatePresence mode="wait">
      {/* Welcome Modal */}
      {tour.phase === 'welcome' && (
        <WelcomeModal
          key="welcome"
          totalSteps={tour.totalSteps}
          onStart={tour.beginTouring}
          onSkip={tour.skipTour}
        />
      )}

      {/* Active Tour */}
      {tour.phase === 'touring' && tour.currentStep && (
        <React.Fragment key="touring">
          {/* Spotlight overlay */}
          <SpotlightOverlay
            targetRect={targetRect}
            onClick={() => {}} // Clicking outside does nothing
          />

          {/* Spotlight glow border */}
          {targetRect && (
            <motion.div
              className="tour-spotlight-border"
              initial={false}
              animate={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
              }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Tooltip */}
          {targetRect && (
            <TourTooltip
              step={tour.currentStep}
              stepIndex={tour.currentStepIndex}
              totalSteps={tour.totalSteps}
              progress={tour.progress}
              targetRect={targetRect}
              onNext={tour.nextStep}
              onPrev={tour.prevStep}
              onSkip={tour.skipTour}
              isFirst={tour.currentStepIndex === 0}
              isLast={tour.currentStepIndex === tour.totalSteps - 1}
            />
          )}
        </React.Fragment>
      )}

      {/* Completion Screen */}
      {tour.phase === 'completing' && (
        <CompletionScreen key="completing" onDismiss={tour.dismissCompletion} />
      )}
    </AnimatePresence>
  );
};

export default ProductTour;
