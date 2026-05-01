/**
 * Chachly / Al Majd Advantages Trad & Cont - Corporate Gifts, Branding & Advertising
 * Interactive: mobile menu, scroll reveal, product filter, hero parallax, contact form
 */

(function () {
  'use strict';

  // ----- Theme toggle (light/dark) -----
  var THEME_KEY = 'al-majd-theme';
  var themeToggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    var theme = getPreferredTheme();
    setTheme(theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  initTheme();

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
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.08
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

  // ----- Contact form (FormSubmit AJAX → inbox). Needs http(s), not file://. Same subject threads in Gmail → unique subject each send -----
  var CONTACT_FORM_AJAX = 'https://formsubmit.co/ajax/info@almajdatc.com';
  var CONTACT_SUBJECT_BASE = 'Email from AL Majd Advantages Trad & Cont website';
  var CONTACT_MAIL_TO = 'info@almajdatc.com';

  var CONTACT_NEEDS_SERVER_MSG =
    'This form does not work when the page is opened as a file (file:///…). Use your live website or a local server (e.g. Live Server / npx serve), then open http://localhost. Or email ' +
    CONTACT_MAIL_TO +
    '.';

  function formSubmitSuccess(data) {
    return data.success === true || data.success === 'true';
  }

  function clearContactFormFeedback(form) {
    var ok = form.querySelector('.form-success');
    if (ok) ok.remove();
    var err = form.querySelector('.form-error');
    if (err) err.remove();
  }

  function showContactFormError(form, message) {
    clearContactFormFeedback(form);
    var errEl = document.createElement('p');
    errEl.className = 'form-error';
    errEl.style.cssText = 'color: #b91c1c; font-weight: 600; margin-top: 1rem;';
    errEl.textContent = message;
    form.appendChild(errEl);
  }

  function humanizeSubmitError(raw) {
    if (!raw || typeof raw !== 'string') return raw;
    if (/web server|html files/i.test(raw)) return CONTACT_NEEDS_SERVER_MSG;
    return raw;
  }

  /** Stops Gmail/clients stacking every notice in one thread (looks like “same mail at the bottom”). */
  function contactEmailSubject(senderName) {
    var stamp = new Date();
    var y = stamp.getFullYear();
    var mo = String(stamp.getMonth() + 1).padStart(2, '0');
    var d = String(stamp.getDate()).padStart(2, '0');
    var h = String(stamp.getHours()).padStart(2, '0');
    var mi = String(stamp.getMinutes()).padStart(2, '0');
    var s = String(stamp.getSeconds()).padStart(2, '0');
    var safeName = (senderName || 'Website').replace(/\s+/g, ' ').slice(0, 80);
    return CONTACT_SUBJECT_BASE + ' — ' + safeName + ' · ' + y + '-' + mo + '-' + d + ' ' + h + ':' + mi + ':' + s;
  }

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var honey = contactForm.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      if (window.location.protocol === 'file:') {
        showContactFormError(contactForm, CONTACT_NEEDS_SERVER_MSG);
        return;
      }

      var fd = new FormData(contactForm);
      var name = (fd.get('name') || '').toString().trim();
      var email = (fd.get('email') || '').toString().trim();
      var msg = (fd.get('message') || '').toString().trim();

      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : 'Send Message';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      clearContactFormFeedback(contactForm);

      var params = new URLSearchParams();
      params.set('name', name);
      params.set('email', email);
      params.set('message', msg);
      params.set('_subject', contactEmailSubject(name));
      params.set('_replyto', email);

      fetch(CONTACT_FORM_AJAX, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: params.toString()
      })
        .then(function (res) {
          return res.text().then(function (text) {
            var data = {};
            try {
              data = JSON.parse(text);
            } catch (ignore) {}
            if (!res.ok) {
              throw new Error(data.message || text || 'Request failed');
            }
            if (!formSubmitSuccess(data)) {
              throw new Error(
                data.message ||
                  'Submission was not accepted. Check spam folder or email us at ' +
                    CONTACT_MAIL_TO +
                    '.'
              );
            }
            return data;
          });
        })
        .then(function () {
          contactForm.reset();
          clearContactFormFeedback(contactForm);
          var note = document.createElement('p');
          note.className = 'form-success';
          note.style.cssText = 'color: #C41E3A; font-weight: 600; margin-top: 1rem;';
          note.textContent = 'Thank you. Your message was sent; we will reply soon.';
          contactForm.appendChild(note);
        })
        .catch(function (err) {
          var msg =
            err && err.message
              ? humanizeSubmitError(err.message)
              : 'Could not send right now. Please try again or email us at ' + CONTACT_MAIL_TO + '.';
          showContactFormError(contactForm, msg);
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
          }
        });
    });
  }
})();
