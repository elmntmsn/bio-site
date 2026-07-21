// Scroll reveal for section elements
const revealElements = document.querySelectorAll('.section-title, .about-grid');
revealElements.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
revealElements.forEach((el) => observer.observe(el));

// Scroll Overlay
const scrollOverlay = document.createElement('div');
scrollOverlay.classList.add('scroll-overlay');
document.body.appendChild(scrollOverlay);

// ── Scroll-driven logo animation ──
const contactSection = document.querySelector('#contact');
const heroLogo = document.querySelector('.hero-logo');
const splitLeft = document.querySelector('.split-left');
const typingText = document.querySelector('.typing-text');

if (contactSection && heroLogo && splitLeft) {
  let isFixed = false;
  let startCX = 0;
  let startCY = 0;
  let cssW = 0;
  let cssH = 0;
  let endScale = 2.2;
  let originalParent = null;
  let originalSibling = null;

  window.addEventListener('scroll', () => {
    const heroSection = document.querySelector('.hero');
    if (!heroSection || !heroSection.classList.contains('is-absorbed')) return;

    if (window.innerWidth <= 768) {
      if (window.scrollY > 0 && typingText) {
        typingText.classList.add('animate-typing');
      }
      return;
    }

    if (window.scrollY > 0) {
      if (!isFixed) {
        // Capture the logo's current visual center (still in normal flow)
        const logoRect = heroLogo.getBoundingClientRect();
        startCX = logoRect.left + logoRect.width / 2;
        startCY = logoRect.top + logoRect.height / 2;

        // getBoundingClientRect returns the SCALED dimensions.
        // The logo is at CSS scale(2.2), so divide to get the real CSS size.
        cssW = logoRect.width / 2.2;
        cssH = logoRect.height / 2.2;

        // Calculate end scale so the logo matches the right-side content height
        const splitRightEl = document.querySelector('.split-right');
        if (splitRightEl) {
          const rightHeight = splitRightEl.offsetHeight;
          endScale = Math.max(rightHeight / cssW, 2.5);
        } else {
          endScale = Math.min(window.innerHeight * 0.45 / cssW, 5);
        }

        // ── KEY FIX ──
        // .hero-title has "animation: fadeUp … forwards" which leaves
        // a computed transform: translateY(0). Even though that's visually
        // identical to "none", CSS treats it as a non-none transform —
        // creating a containing block that traps position:fixed descendants.
        // Moving the logo to <body> escapes that containing block so
        // position:fixed works relative to the viewport.
        originalParent  = heroLogo.parentElement;
        originalSibling = heroLogo.nextElementSibling;
        document.body.appendChild(heroLogo);

        heroLogo.style.width    = cssW + 'px';
        heroLogo.style.height   = cssH + 'px';
        heroLogo.style.position = 'fixed';
        heroLogo.style.left     = '0';
        heroLogo.style.top      = '0';
        heroLogo.style.margin   = '0';
        heroLogo.style.zIndex   = '10';
        isFixed = true;
      }

      // ── Progress 0 → 1 ──
      const rect = contactSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const progress = Math.min(Math.max((vh - rect.top) / (vh * 1.2), 0), 1);

      // Fade background to black
      scrollOverlay.style.opacity = progress;

      // ── Target: center of .split-left horizontally, center of text vertically ──
      const padH   = 40;
      const innerW = vw - padH * 2;
      const leftW  = (1.2 / 2.2) * innerW;
      const targetX = padH + leftW / 2;
      
      const splitRightEl = document.querySelector('.split-right');
      const rightRect = splitRightEl ? splitRightEl.getBoundingClientRect() : null;
      const targetY = rightRect ? (rightRect.top + rightRect.height / 2) : vh / 2;

      // Interpolate position
      const cx = startCX + (targetX - startCX) * progress;
      const cy = startCY + (targetY - startCY) * progress;

      // Scale: 2.2 → endScale (grows to match the right-side text height)
      const scale = 2.2 + (endScale - 2.2) * progress;

      // Place the logo so its visual center sits at (cx, cy)
      const tx = cx - cssW / 2;
      const ty = cy - cssH / 2;

      heroLogo.style.transition = 'none';
      heroLogo.style.transform  = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;

      // Trigger typing animation
      if (progress > 0.45 && typingText) {
        typingText.classList.add('animate-typing');
      }
    } else {
      // ── Reset when scrolled back to top ──
      if (isFixed && originalParent) {
        if (originalSibling) {
          originalParent.insertBefore(heroLogo, originalSibling);
        } else {
          originalParent.appendChild(heroLogo);
        }
      }
      isFixed = false;
      heroLogo.style.position   = '';
      heroLogo.style.left       = '';
      heroLogo.style.top        = '';
      heroLogo.style.margin     = '';
      heroLogo.style.width      = '';
      heroLogo.style.height     = '';
      heroLogo.style.zIndex     = '';
      heroLogo.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      heroLogo.style.transform  = 'scale(2.2)';
      scrollOverlay.style.opacity = 0;
    }
  });
}

// ── Text Rotator ──
const heroWords = ['elmnts', 'elmnts.msn', 'elementhub.msn', 'elmnts'];
const rotator   = document.querySelector('.hero-title-rotator');
const currentEl = document.querySelector('.hero-title-current');
const nextEl    = document.querySelector('.hero-title-next');

if (rotator && currentEl && nextEl) {
  let index = 0;
  const holdDuration = 1200;
  const animDuration = 400;

  const measure = document.createElement('span');
  measure.style.cssText =
    'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none';
  measure.style.font = getComputedStyle(currentEl).font;
  document.body.appendChild(measure);

  function setRotatorWidth(word) {
    measure.textContent = word;
    rotator.style.width = `${measure.offsetWidth}px`;
  }

  function cycleWord() {
    if (index >= heroWords.length - 1) return;

    const nextIndex = index + 1;
    const nextWord  = heroWords[nextIndex];
    nextEl.textContent = nextWord;
    setRotatorWidth(nextWord);
    rotator.classList.add('is-animating');

    setTimeout(() => {
      currentEl.textContent = nextWord;
      nextEl.textContent    = '';
      rotator.classList.remove('is-animating');
      index = nextIndex;

      if (index < heroWords.length - 1) {
        setTimeout(cycleWord, holdDuration);
      } else {
        setTimeout(() => {
          const heroSection = document.querySelector('.hero');
          if (heroSection) {
            heroSection.classList.add('is-absorbed');
          }
        }, 1000);
      }
    }, animDuration);
  }

  setRotatorWidth(heroWords[0]);
  setTimeout(cycleWord, holdDuration);
}
