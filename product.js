/**
 * Product detail page – load product by ID, related products, sticky cart
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const products = Array.isArray(PRODUCTS) ? PRODUCTS : [];

  const product = products.find(p => p.id === id);
  const productDetail = document.getElementById('product-detail');
  const relatedSection = document.getElementById('related-products');
  const addToCartBtn = document.getElementById('add-to-cart');
  const stickyAddBtn = document.getElementById('sticky-add-cart');

  function renderStars(rating) {
    const r = Math.min(5, Math.max(0, parseFloat(rating) || 0));
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="fas fa-star ${i <= Math.floor(r) ? 'filled' : ''}"></i>`;
    }
    return html;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = String(s);
    return div.innerHTML;
  }

  function showProduct(p) {
    document.title = escapeHtml(p.name) + ' | Al Majd Advantages';
    document.getElementById('breadcrumb-product').textContent = escapeHtml(p.name);
    document.getElementById('product-image').src = p.image;
    document.getElementById('product-image').alt = escapeHtml(p.name);
    document.getElementById('product-category').textContent = escapeHtml(p.category);
    document.getElementById('product-title').textContent = p.name;
    document.getElementById('product-rating').innerHTML = renderStars(p.rating);
    document.getElementById('product-description').textContent = p.description || '';
  }

  function getRelated(currentId, category, limit) {
    const sameCat = products.filter(p => p.id !== currentId && p.category === category);
    const other = products.filter(p => p.id !== currentId && p.category !== category);
    return [...sameCat, ...other].slice(0, limit);
  }

  function renderRelated(p) {
    const related = getRelated(p.id, p.category, 4);
    if (related.length === 0) {
      relatedSection.style.display = 'none';
      return;
    }
    relatedSection.style.display = 'block';
    const grid = document.getElementById('related-grid');
    if (!grid) return;

    grid.innerHTML = related.map(r => {
      const stars = renderStars(r.rating);
      const desc = (r.description || '').slice(0, 60) + (r.description && r.description.length > 60 ? '…' : '');
      return `
        <article class="product-card">
          <a href="product.html?id=${r.id}" class="product-card-link">
            <div class="product-card-image">
              <img src="${escapeHtml(r.image)}" alt="${escapeHtml(r.name)}" loading="lazy" decoding="async" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e7e5e4%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%2378716c%22 font-size=%2212%22%3ENo image%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="product-card-body">
              <h3 class="product-card-title">${escapeHtml(r.name)}</h3>
              <div class="product-card-rating">${stars}</div>
              <p class="product-card-desc">${escapeHtml(desc)}</p>
            </div>
          </a>
        </article>
      `;
    }).join('');
  }

  function addToCartHandler() {
    if (!product) return;
    addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added';
    addToCartBtn.disabled = true;
    addToCartBtn.classList.add('added');
    if (stickyAddBtn) {
      stickyAddBtn.innerHTML = '<i class="fas fa-check"></i> Added';
      stickyAddBtn.disabled = true;
    }
  }

  function init() {
    if (!product) {
      if (productDetail) {
        productDetail.innerHTML = '<p class="products-empty">Product not found. <a href="shop.html">Back to shop</a></p>';
      }
      if (relatedSection) relatedSection.style.display = 'none';
      return;
    }

    showProduct(product);
    renderRelated(product);

    if (addToCartBtn) addToCartBtn.addEventListener('click', addToCartHandler);
    if (stickyAddBtn) stickyAddBtn.addEventListener('click', addToCartHandler);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
