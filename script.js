/**
 * Chachly / Dama National - Corporate Gifts, Branding & Advertising
 * Interactive: mobile menu, scroll reveal, product filter, hero parallax, contact form
 */

(function () {
  'use strict';

  // ----- Footer year -----
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ----- Hero parallax & micro-interactions on scroll (homepage) -----
  var hero = document.getElementById('hero');
  var heroContent = hero ? hero.querySelector('.hero-content') : null;
  var heroShapes = hero ? hero.querySelector('.hero-shapes') : null;

  function onScroll() {
    if (!hero || !heroContent) return;
    var rect = hero.getBoundingClientRect();
    var center = rect.top + rect.height / 2;
    var viewportCenter = window.innerHeight / 2;
    var offset = (center - viewportCenter) * 0.08;
    heroContent.style.transform = 'translateY(' + Math.round(offset) + 'px)';
    if (heroShapes) {
      var shapesOffset = (center - viewportCenter) * 0.04;
      heroShapes.style.transform = 'translateY(' + Math.round(shapesOffset) + 'px)';
    }
  }

  if (hero && heroContent) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ----- Mouse parallax on hero shapes (desktop, when hero present) -----
  if (hero && heroShapes && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 14;
      var y = (e.clientY / window.innerHeight - 0.5) * 14;
      heroShapes.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
    });
    hero.addEventListener('mouseleave', function () {
      heroShapes.style.transform = '';
    });
  }

  // ----- Mobile menu -----
  var menuToggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('is-open');
      document.body.style.overflow = expanded ? '' : 'hidden';
    });

    // Close menu when clicking a nav link (for anchor or same-page links)
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 768px)').matches) {
          menuToggle.setAttribute('aria-expanded', 'false');
          nav.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        menuToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  // ----- Scroll reveal -----
  var revealEls = document.querySelectorAll('.reveal');
  var revealObserver = null;

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
      }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ----- Product filter tabs (homepage only) -----
  var filterTabs = document.querySelectorAll('.filter-tab');
  var productCards = document.querySelectorAll('.products-grid .product-card[data-category]');

  if (filterTabs.length && productCards.length) {
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');

        filterTabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
        });

        productCards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          var show = filter === 'all' || category === filter;
          card.classList.toggle('hide', !show);
        });
      });
    });
  }

  // ----- Contact form (prevent default, show message) -----
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = this.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : 'Send Message';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }
      // Simulate send (static site: no backend)
      setTimeout(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Message Sent!';
        }
        var message = document.createElement('p');
        message.className = 'form-success';
        message.style.cssText = 'color: #FF7A00; font-weight: 600; margin-top: 1rem;';
        message.textContent = 'Thank you. We will get back to you soon.';
        contactForm.appendChild(message);
        setTimeout(function () {
          if (btn) btn.textContent = originalText;
        }, 2000);
      }, 800);
    });
  }
})();
