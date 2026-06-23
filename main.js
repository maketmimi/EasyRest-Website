/**
 * EasyRest Landing Page Interactions - RTL Arabic
 */

(function() {
  'use strict';

  // DOM Elements
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const revealElements = document.querySelectorAll('[data-reveal]');
  const hero = document.querySelector('.hero');

  // Carousel Elements
  const carouselTrack = document.querySelector('.carousel-track');
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  const carouselDots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  // State
  let lastScrollY = window.scrollY;
  let ticking = false;
  let currentSlide = 0;
  let autoplayInterval = null;

  /**
   * Initialize all functionality
   */
  function init() {
    setupStickyNav();
    setupMobileMenu();
    setupSmoothScroll();
    setupScrollReveal();
    setupParallaxEffect();
    setupCarousel();
  }

  /**
   * Sticky Navigation
   */
  function setupStickyNav() {
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  function handleNavScroll() {
    lastScrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNavbar();
        ticking = false;
      });
      ticking = true;
    }
  }

  function updateNavbar() {
    if (lastScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /**
   * Mobile Menu Toggle
   */
  function setupMobileMenu() {
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', toggleMobileMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  function toggleMobileMenu() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
  }

  function closeMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('active');
  }

  /**
   * Smooth Scrolling for anchor links
   */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        history.pushState(null, null, href);
      });
    });
  }

  /**
   * Scroll Reveal Animations
   */
  function setupScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  /**
   * Parallax Background Effect
   */
  function setupParallaxEffect() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;

      if (scrollY < heroHeight) {
        const offset = scrollY * 0.3;
        heroBg.style.transform = `translateY(${offset}px)`;
      }
    }, { passive: true });
  }

  /**
   * Carousel Functionality
   */
  function setupCarousel() {
    if (!carouselTrack || carouselSlides.length === 0) return;

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetAutoplay();
      });
    }

    // Dot navigation
    carouselDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetAutoplay();
      });
    });

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
      carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      // In RTL, swipe right goes to next, swipe left goes to prev
      if (diff > swipeThreshold) {
        goToSlide(currentSlide - 1);
        resetAutoplay();
      } else if (diff < -swipeThreshold) {
        goToSlide(currentSlide + 1);
        resetAutoplay();
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide + 1);
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide - 1);
        resetAutoplay();
      }
    });

    // Start autoplay
    startAutoplay();

    // Pause autoplay on hover
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);
    }
  }

  function goToSlide(index) {
    const totalSlides = carouselSlides.length;

    // Loop around
    if (index < 0) {
      index = totalSlides - 1;
    } else if (index >= totalSlides) {
      index = 0;
    }

    currentSlide = index;

    // Move track (RTL: translateX moves in opposite direction)
    const offset = index * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    // Update dots
    carouselDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function startAutoplay() {
    stopAutoplay();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    autoplayInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  /**
   * Active Nav Link Highlighting
   */
  function setupActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id], header[id]');

    if (!('IntersectionObserver' in window)) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          updateActiveNavLink(id);
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  function updateActiveNavLink(activeId) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Initialize everything when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      setupActiveNavHighlight();
    });
  } else {
    init();
    setupActiveNavHighlight();
  }

})();
