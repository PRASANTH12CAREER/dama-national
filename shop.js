/**
 * Shop page – filters, sorting, search, product grid
 */
(function () {
  'use strict';

  const grid = document.getElementById('products-grid');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const productCount = document.getElementById('product-count');
  const productsEmpty = document.getElementById('products-empty');
  const filtersToggle = document.getElementById('filters-toggle');
  const filtersClose = document.getElementById('filters-close');
  const shopFilters = document.getElementById('shop-filters');
  const filtersOverlay = document.getElementById('filters-overlay');
  const clearFiltersBtn = document.getElementById('clear-filters');

  let state = {
    products: [],
    filtered: [],
    filters: { category: [], priceMin: null, priceMax: null, rating: null },
    sort: 'popular',
    search: ''
  };

  function getCategories() {
    const set = new Set();
    (state.products || PRODUCTS).forEach(p => set.add(p.category));
    return Array.from(set).sort();
  }

  function renderCategoryFilters() {
    const container = document.getElementById('filter-category');
    if (!container) return;
    const cats = getCategories();
    container.innerHTML = cats.map(cat => `
      <label class="filter-option">
        <input type="checkbox" data-category="${escapeHtml(cat)}">
        <span>${escapeHtml(cat)}</span>
      </label>
    `).join('');
    container.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => applyFiltersFromUI());
    });
  }

  function renderRatingFilters() {
    const container = document.getElementById('filter-rating');
    if (!container) return;
    [4.5, 4, 3.5, 3].forEach(r => {
      const label = document.createElement('label');
      label.className = 'filter-option';
      label.innerHTML = `
        <input type="radio" name="rating" data-rating="${r}">
        <span>${r}+ stars</span>
      `;
      container.appendChild(label);
    });
    container.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => applyFiltersFromUI());
    });
  }

  function applyFiltersFromUI() {
    const catCheckboxes = document.querySelectorAll('#filter-category input:checked');
    state.filters.category = Array.from(catCheckboxes).map(cb => cb.dataset.category);
    const ratingRadio = document.querySelector('input[name="rating"]:checked');
    state.filters.rating = ratingRadio ? parseFloat(ratingRadio.dataset.rating) : null;
    const min = document.getElementById('price-min');
    const max = document.getElementById('price-max');
    state.filters.priceMin = min && min.value ? parseFloat(min.value) : null;
    state.filters.priceMax = max && max.value ? parseFloat(max.value) : null;
    filterAndSort();
  }

  function filterAndSort() {
    let list = (state.products.length ? state.products : PRODUCTS).slice();

    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    if (state.filters.category.length) {
      list = list.filter(p => state.filters.category.includes(p.category));
    }
    if (state.filters.priceMin != null && !isNaN(state.filters.priceMin)) {
      list = list.filter(p => p.price >= state.filters.priceMin);
    }
    if (state.filters.priceMax != null && !isNaN(state.filters.priceMax)) {
      list = list.filter(p => p.price <= state.filters.priceMax);
    }
    if (state.filters.rating != null) {
      list = list.filter(p => (p.rating || 0) >= state.filters.rating);
    }

    switch (state.sort) {
      case 'price-asc':
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    state.filtered = list;
    renderProducts();
  }

  function renderProducts() {
    if (!grid) return;
    productCount.textContent = `${state.filtered.length} product${state.filtered.length !== 1 ? 's' : ''}`;
    productsEmpty.hidden = state.filtered.length > 0;

    grid.innerHTML = state.filtered.map(p => {
      const stars = renderStars(p.rating);
      const desc = (p.description || '').slice(0, 80) + (p.description && p.description.length > 80 ? '…' : '');
      return `
        <article class="product-card">
          <a href="product.html?id=${p.id}" class="product-card-link">
            <div class="product-card-image">
              <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e7e5e4%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%2378716c%22 font-size=%2212%22%3ENo image%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-card-body">
              <h3 class="product-card-title">${escapeHtml(p.name)}</h3>
              <div class="product-card-rating">${stars}</div>
              <p class="product-card-price">${formatPrice(p.price)}</p>
              <p class="product-card-desc">${escapeHtml(desc)}</p>
            </div>
          </a>
        </article>
      `;
    }).join('');
  }

  function renderStars(rating) {
    const r = Math.min(5, Math.max(0, parseFloat(rating) || 0));
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="fas fa-star ${i <= Math.floor(r) ? 'filled' : ''}"></i>`;
    }
    return html;
  }

  function formatPrice(n) {
    return 'OMR ' + (parseFloat(n) || 0).toFixed(2);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = String(s);
    return div.innerHTML;
  }

  function openFilters() {
    shopFilters.classList.add('open');
    filtersOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFilters() {
    shopFilters.classList.remove('open');
    filtersOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function clearFilters() {
    state.filters = { category: [], priceMin: null, priceMax: null, rating: null };
    document.querySelectorAll('#filter-category input').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
    const min = document.getElementById('price-min');
    const max = document.getElementById('price-max');
    if (min) min.value = '';
    if (max) max.value = '';
    filterAndSort();
  }

  function init() {
    state.products = Array.isArray(PRODUCTS) ? PRODUCTS : [];
    renderCategoryFilters();
    renderRatingFilters();
    filterAndSort();

    if (searchInput) {
      let t;
      searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          state.search = searchInput.value.trim();
          filterAndSort();
        }, 200);
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        filterAndSort();
      });
    }

    if (filtersToggle) filtersToggle.addEventListener('click', openFilters);
    if (filtersClose) filtersClose.addEventListener('click', closeFilters);
    if (filtersOverlay) filtersOverlay.addEventListener('click', closeFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

    const minInp = document.getElementById('price-min');
    const maxInp = document.getElementById('price-max');
    if (minInp) minInp.addEventListener('change', applyFiltersFromUI);
    if (maxInp) maxInp.addEventListener('change', applyFiltersFromUI);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
