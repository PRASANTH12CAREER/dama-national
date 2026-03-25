/**
 * Catalog viewer: PDF.js + StPageFlip + GSAP open animation.
 * Lazy-renders PDF spreads into canvas halves.
 */
(function () {
  'use strict';

  var PDFJS_VERSION = '3.11.174';
  var CATALOGS = {
    gifts: {
      pdf: 'public/catalogs/2026-gifts.pdf',
      title: '2026 Gift Items Catalog',
    },
    print: {
      pdf: 'public/catalogs/2026-print.pdf',
      title: '2026 Printing Catalog',
    },
    branding: {
      pdf: 'public/catalogs/2026-banding.pdf',
      title: '2026 Branding Catalog',
    },
  };

  var viewer = null;
  var shell = null;
  var bookEl = null;
  var bookScaler = null;
  var loadingEl = null;
  var progressEl = null;
  var titleEl = null;
  var pageLabelEl = null;
  var downloadBtn = null;
  var zoomInBtn = null;
  var zoomOutBtn = null;
  var audioCtx = null;
  var pageFlip = null;
  var pdfDoc = null;
  var spreadCount = 0;
  var renderedSpreads = {};
  var currentPdfUrl = '';
  var currentZoom = 1;
  var halfRenderSize = { w: 360, h: 504 };

  function getPageFlipCtor() {
    if (window.St && window.St.PageFlip) return window.St.PageFlip;
    if (window.PageFlip) return window.PageFlip;
    return null;
  }

  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
  }

  function playPaperSound() {
    ensureAudio();
    if (!audioCtx) return;
    var t0 = audioCtx.currentTime;
    var dur = 0.07;
    var buf = audioCtx.createBuffer(1, Math.ceil(audioCtx.sampleRate * dur), audioCtx.sampleRate);
    var d = buf.getChannelData(0);
    var i;
    for (i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.12)) * 0.35;
    }
    var src = audioCtx.createBufferSource();
    src.buffer = buf;
    var bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    bp.Q.value = 0.9;
    src.connect(bp);
    bp.connect(audioCtx.destination);
    src.start(t0);
    src.stop(t0 + dur);
  }

  function lockBody(scrollLock) {
    document.body.style.overflow = scrollLock ? 'hidden' : '';
    document.documentElement.style.overflow = scrollLock ? 'hidden' : '';
  }

  function updatePageLabel(pageFlipPageIndex) {
    if (!pageLabelEl || !pdfDoc) return;
    var spreadIndex = Math.floor(pageFlipPageIndex / 2);
    var p1 = spreadIndex * 2 + 1;
    var p2 = p1 + 1;
    if (p2 > pdfDoc.numPages) {
      pageLabelEl.textContent = 'Page ' + p1;
    } else {
      pageLabelEl.textContent = 'Pages ' + p1 + '–' + p2;
    }
  }

  function setLoading(show, text) {
    if (!loadingEl) return;
    if (show) {
      loadingEl.removeAttribute('hidden');
      loadingEl.classList.remove('is-hidden');
      if (progressEl && text) progressEl.textContent = text;
    } else {
      loadingEl.classList.add('is-hidden');
      setTimeout(function () {
        loadingEl.setAttribute('hidden', '');
      }, 320);
    }
  }

  function clampSpreadSize() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var padX = vw < 640 ? 16 : 40;
    var chromeV = vw < 640 ? 128 : 168;
    var maxOpenBookPx = vw - padX;
    var maxPageHeight = Math.max(200, vh - chromeV);
    var aspect = 1.38;
    var pageW = Math.min(520, Math.floor(maxOpenBookPx / 2) - 6);
    var pageH = Math.floor(pageW * aspect);
    if (pageH > maxPageHeight) {
      pageH = Math.floor(maxPageHeight);
      pageW = Math.floor(pageH / aspect);
    }
    pageW = Math.max(110, pageW);
    pageH = Math.max(150, pageH);
    return { pageW: pageW, pageH: pageH };
  }

  function renderHalf(pageNum, canvas, halfW, halfH) {
    if (!pdfDoc || !canvas) return Promise.resolve();
    if (pageNum < 1 || pageNum > pdfDoc.numPages) {
      var ctx = canvas.getContext('2d');
      canvas.width = Math.max(40, halfW);
      canvas.height = Math.max(40, halfH);
      canvas.style.width = halfW + 'px';
      canvas.style.height = halfH + 'px';
      ctx.fillStyle = '#e4e0da';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return Promise.resolve();
    }
    return pdfDoc.getPage(pageNum).then(function (page) {
      var base = page.getViewport({ scale: 1 });
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var scale = (halfW * dpr) / base.width;
      var vp = page.getViewport({ scale: scale });
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = halfW + 'px';
      canvas.style.height = halfH + 'px';
      var ctx = canvas.getContext('2d');
      return page.render({ canvasContext: ctx, viewport: vp }).promise;
    });
  }

  function renderSpread(spreadIndex) {
    if (!pdfDoc || renderedSpreads[spreadIndex]) return Promise.resolve();
    var el = bookEl.querySelector('[data-spread-index="' + spreadIndex + '"]');
    if (!el) return Promise.resolve();
    var left = el.querySelector('.catalog-spread__half--left canvas');
    var right = el.querySelector('.catalog-spread__half--right canvas');
    var p1 = spreadIndex * 2 + 1;
    var p2 = p1 + 1;
    var hw = halfRenderSize.w;
    var hh = halfRenderSize.h;
    renderedSpreads[spreadIndex] = 'pending';
    return renderHalf(p1, left, hw, hh)
      .then(function () {
        return renderHalf(p2, right, hw, hh);
      })
      .then(function () {
        renderedSpreads[spreadIndex] = true;
      })
      .catch(function (err) {
        console.error('Render spread failed', spreadIndex, err);
        renderedSpreads[spreadIndex] = false;
      });
  }

  function prewarmSpreads(idx) {
    [idx - 1, idx, idx + 1, idx + 2].forEach(function (s) {
      if (s >= 0 && s < spreadCount) {
        renderSpread(s);
      }
    });
  }

  function ensureBookMount() {
    if (!bookScaler) return;
    var root = bookScaler.querySelector('.catalog-book-root');
    if (!root) {
      root = document.createElement('div');
      root.className = 'catalog-book-root';
      bookScaler.appendChild(root);
    }
    var el = document.getElementById('catalog-book');
    if (!el || !root.contains(el)) {
      root.innerHTML = '';
      el = document.createElement('div');
      el.id = 'catalog-book';
      el.className = 'catalog-viewer__book';
      root.appendChild(el);
    }
    bookEl = el;
  }

  function destroyFlipbook() {
    renderedSpreads = {};
    if (pageFlip) {
      try {
        pageFlip.destroy();
      } catch (e) {}
      pageFlip = null;
    }
    if (pdfDoc) {
      try {
        pdfDoc.destroy();
      } catch (e2) {}
      pdfDoc = null;
    }
    ensureBookMount();
    if (bookEl) {
      bookEl.innerHTML = '';
    }
  }

  function closeViewer() {
    if (!viewer || !viewer.classList.contains('is-open')) return;
    setLoading(false);
    destroyFlipbook();
    viewer.classList.remove('is-open');
    viewer.setAttribute('aria-hidden', 'true');
    lockBody(false);
    titleEl.textContent = 'Catalog';
    currentPdfUrl = '';
    currentZoom = 1;
    if (bookScaler) {
      bookScaler.style.transform = 'scale(1)';
    }
  }

  function initFlipbook(sizes) {
    var PageFlipCtor = getPageFlipCtor();
    if (!PageFlipCtor) {
      throw new Error('PageFlip library not loaded');
    }
    halfRenderSize = { w: sizes.pageW, h: sizes.pageH };
    pageFlip = new PageFlipCtor(bookEl, {
      width: sizes.pageW,
      height: sizes.pageH,
      size: 'stretch',
      minWidth: 120,
      maxWidth: 560,
      minHeight: 150,
      maxHeight: 780,
      maxShadowOpacity: 0.5,
      showCover: false,
      mobileScrollSupport: true,
      flippingTime: 720,
      usePortrait: false,
      startPage: 0,
    });
    var pages = bookEl.querySelectorAll('.page');
    pageFlip.loadFromHTML(pages);
    pageFlip.on('flip', function (e) {
      playPaperSound();
      var idx = typeof e.data === 'number' ? e.data : null;
      if (typeof idx !== 'number') idx = pageFlip.getCurrentPageIndex();
      var spreadIdx = Math.floor(idx / 2);
      updatePageLabel(idx);
      prewarmSpreads(spreadIdx);
    });
    pageFlip.on('changeState', function () {});
  }

  function openViewer(catKey, originEl) {
    var cfg = CATALOGS[catKey];
    if (!cfg || !viewer) return;
    if (typeof pdfjsLib === 'undefined') {
      console.error('pdf.js (pdfjsLib) is not loaded');
      window.alert('The PDF viewer could not start because the PDF engine did not load. Please refresh the page.');
      return;
    }
    if (!getPageFlipCtor()) {
      console.error('PageFlip is not loaded');
      window.alert('The flipbook could not start because a script did not load. Please refresh the page.');
      return;
    }
    destroyFlipbook();
    currentPdfUrl = cfg.pdf;
    titleEl.textContent = cfg.title;
    if (downloadBtn) downloadBtn.href = cfg.pdf;
    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    lockBody(true);
    setLoading(true, 'Loading catalog…');
    ensureBookMount();

    var sizes = clampSpreadSize();

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.worker.min.js';

    var loadingTask = pdfjsLib.getDocument({
      url: cfg.pdf,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/cmaps/',
      cMapPacked: true,
    });

    loadingTask.onProgress = function (p) {
      if (p.total > 0 && progressEl) {
        var pct = Math.round((100 * p.loaded) / p.total);
        progressEl.textContent = 'Loading PDF… ' + pct + '%';
      }
    };

    loadingTask.promise
      .then(function (pdf) {
        pdfDoc = pdf;
        spreadCount = Math.ceil(pdf.numPages / 2);
        if (spreadCount < 1) spreadCount = 1;
        bookEl.innerHTML = '';
        var i;
        var html = '';
        for (i = 0; i < spreadCount; i++) {
          html +=
            '<div class="page catalog-spread" data-spread-index="' +
            i +
            '">' +
            '<div class="catalog-spread__inner">' +
            '<div class="catalog-spread__half catalog-spread__half--left"><canvas></canvas></div>' +
            '<div class="catalog-spread__half catalog-spread__half--right"><canvas></canvas></div>' +
            '</div></div>';
        }
        bookEl.innerHTML = html;
        initFlipbook(sizes);
        setLoading(false);
        updatePageLabel(0);
        return renderSpread(0)
          .then(function () {
            return renderSpread(1);
          })
          .then(function () {
            return renderSpread(2);
          });
      })
      .then(function () {
        if (window.gsap && originEl && shell) {
          var sr = originEl.getBoundingClientRect();
          var tr = shell.getBoundingClientRect();
          var ox = sr.left + sr.width / 2 - (tr.left + tr.width / 2);
          var oy = sr.top + sr.height / 2 - (tr.top + tr.height / 2);
          var sx = Math.max(0.22, Math.min(0.55, sr.width / tr.width));
          window.gsap.fromTo(
            shell,
            { x: ox, y: oy, scale: sx, opacity: 0.92, transformOrigin: '50% 50%' },
            { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' }
          );
        }
      })
      .catch(function (err) {
        console.error(err);
        setLoading(true, 'Could not load catalog. Check path or PDF size.');
        progressEl.textContent = String(err.message || err);
      });
  }

  function onKeyDown(e) {
    if (!viewer || !viewer.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeViewer();
    }
    if (e.key === 'ArrowRight' && pageFlip) {
      pageFlip.flipNext();
    }
    if (e.key === 'ArrowLeft' && pageFlip) {
      pageFlip.flipPrev();
    }
  }

  function setZoom(delta) {
    currentZoom = Math.max(0.65, Math.min(1.85, currentZoom + delta));
    if (bookScaler) {
      bookScaler.style.transform = 'scale(' + currentZoom + ')';
    }
  }

  function init() {
    viewer = document.getElementById('catalog-viewer');
    if (!viewer) return;
    shell = viewer.querySelector('.catalog-viewer__shell');
    bookScaler = viewer.querySelector('.catalog-viewer__book-scaler');
    ensureBookMount();
    bookEl = document.getElementById('catalog-book');
    loadingEl = viewer.querySelector('.catalog-viewer__loading');
    progressEl = viewer.querySelector('.catalog-viewer__progress');
    titleEl = viewer.querySelector('#catalog-viewer-title');
    pageLabelEl = viewer.querySelector('#catalog-page-label');
    downloadBtn = viewer.querySelector('[data-catalog-download]');
    zoomInBtn = viewer.querySelector('[data-catalog-zoom-in]');
    zoomOutBtn = viewer.querySelector('[data-catalog-zoom-out]');
    var prevBtn = viewer.querySelector('[data-catalog-prev]');
    var nextBtn = viewer.querySelector('[data-catalog-next]');
    var closeBtn = viewer.querySelector('[data-catalog-close]');
    var fsBtn = viewer.querySelector('[data-catalog-fullscreen]');

    document.querySelectorAll('.catalog-card__frame--open').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var key = btn.getAttribute('data-catalog');
        ensureAudio();
        openViewer(key, btn);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeViewer);
    viewer.querySelector('.catalog-viewer__backdrop').addEventListener('click', closeViewer);
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (pageFlip) pageFlip.flipPrev();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (pageFlip) pageFlip.flipNext();
      });
    }
    if (zoomInBtn) zoomInBtn.addEventListener('click', function () { setZoom(0.12); });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', function () { setZoom(-0.12); });
    if (fsBtn) {
      fsBtn.addEventListener('click', function () {
        var el = shell;
        if (!document.fullscreenElement) {
          el.requestFullscreen && el.requestFullscreen();
        } else {
          document.exitFullscreen && document.exitFullscreen();
        }
      });
    }

    document.addEventListener('keydown', onKeyDown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
