
const availableScents = [
  { id: 'agrume', name: 'Agrumes', color: '#E8D4C8' },
  { id: 'lavande', name: 'Lavande', color: '#D4C5E8' },
  { id: 'bois', name: 'Bois de santal', color: '#C4B5A0' },
  { id: 'menthe', name: 'Menthe', color: '#C8E8D4' },
  { id: 'jasmin', name: 'Jasmin', color: '#E8D4D8' },
  { id: 'musc', name: 'Musc', color: '#D8C5B0' },
  { id: 'bergamote', name: 'Bergamote', color: '#E8DCC4' },
  { id: 'rose', name: 'Rose', color: '#E8D4D9' },
  { id: 'patchouli', name: 'Patchouli', color: '#C9B5A0' },
  { id: 'vanille', name: 'Vanille', color: '#E8DCC8' },
  { id: 'ambre', name: 'Ambre', color: '#D8CCC4' },
  { id: 'musque', name: 'Musqué', color: '#D4C8C0' }
];

const volumes = [
  { id: 'vol-30', name: '30ml', basePrice: 49, size: '30ml' },
  { id: 'vol-50', name: '50ml', basePrice: 69, size: '50ml' },
  { id: 'vol-100', name: '100ml', basePrice: 99, size: '100ml' },
  { id: 'vol-250', name: '250ml', basePrice: 149, size: '250ml' }
];

const perfumeBases = [
  { 
    id: 'base-1', 
    name: 'Votre composition', 
    image: 'aurea.png',
    description: 'Une base élégante et intemporelle',
    defaultScents: ['lavande', 'bois', 'menthe']
  },
  { 
    id: 'base-2', 
    name: 'Essence Florale',
    image: 'essenceflorale.png',
    description: 'Un mélange frais et floral',
    defaultScents: ['jasmin', 'rose', 'bergamote']
  },
  { 
    id: 'base-3',
    name: 'Bois Mystique',
    image: 'boismyrtille.png',
    description: 'Des notes profondes et boisées',
    defaultScents: ['bois', 'patchouli', 'ambre']
  },
  {
    id: 'base-4',
    name: 'Citrus Fresh',
    image: 'citrusfresh.png',
    description: 'Un parfum vivifiant aux agrumes',
    defaultScents: ['agrume', 'bergamote', 'menthe']
  },
  {
    id: 'base-5',
    name: 'Vanilla Dream',
    image: 'vanilladream.png',
    description: 'Une douceur sucrée et enveloppante',
    defaultScents: ['vanille', 'ambre', 'musc']
  },
];

const CART_KEY = 'layeressence_cart';

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getToastIcon(type)}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close" aria-label="Fermer">×</button>
  `;
  
  container.appendChild(toast);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  });
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function getToastIcon(type) {
  const icons = {
    'success': '✓',
    'error': '✕',
    'warning': '⚠',
    'info': 'ℹ'
  };
  return icons[type] || icons['info'];
}

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(baseId, volumeId, selectedScents, qty = 1) {
  const cart = getCart();
  const cartItem = {
    id: `${baseId}-${volumeId}-${selectedScents.join(',')}`,
    baseId,
    volumeId,
    selectedScents,
    qty
  };
  
  const existing = cart.find(i => i.id === cartItem.id);
  if (existing) existing.qty += qty;
  else cart.push(cartItem);
  
  saveCart(cart);
}

function removeFromCart(itemId) {
  const cart = getCart().filter(i => i.id !== itemId);
  saveCart(cart);
  renderCartPage();
}

function updateQty(itemId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
  renderCartPage();
}

function clearCart() {
  saveCart([]);
  renderCartPage();
}

function calculatePrice(baseId, volumeId, selectedScents) {
  const volume = volumes.find(v => v.id === volumeId);
  if (!volume) return 0;
  
  let price = volume.basePrice;

  const extraScents = Math.max(0, selectedScents.length - 1);
  price += extraScents * 8;
  
  return price;
}

function formatPrice(value) {
  return `${value.toFixed(2)}€`;
}

function updateCartCount() {
  const countEl = document.querySelector('.cart-count');
  if (!countEl) return;
  const totalQty = getCart().reduce((sum, i) => sum + i.qty, 0);
  countEl.textContent = totalQty;
}


function renderCatalog() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  
  const html = perfumeBases.map(base => `
    <article class="perfume-builder" data-base-id="${base.id}">
      <div class="builder-header">
        <img class="builder-image" src="${base.image}" alt="${base.name}">
        <div class="builder-info">
          <h3>${base.name}</h3>
          <p class="builder-desc">${base.description}</p>
        </div>
      </div>
      
      <div class="builder-content">
        <div class="builder-section">
          <label class="section-title">Choisissez un volume:</label>
          <div class="volume-selector">
            ${volumes.map(vol => `
              <button class="vol-option" data-volume-id="${vol.id}" data-base-id="${base.id}">
                <span class="vol-size">${vol.size}</span>
                <span class="vol-price">${formatPrice(vol.basePrice)}</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="builder-section">
          <label class="section-title">Personnalisez vos odeurs:</label>
          <p class="scents-hint">Sélectionnez jusqu'à 3 odeurs</p>
          <div class="scents-selector" data-base-id="${base.id}">
            ${availableScents.map(scent => {
              const isDefault = base.defaultScents.includes(scent.id);
              return `
                <label class="scent-option">
                  <input type="checkbox" value="${scent.id}" ${isDefault ? 'checked' : ''} class="scent-checkbox">
                  <span class="scent-label" style="background-color: ${scent.color};">
                    ${scent.name}
                  </span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Affichage du prix et bouton -->
        <div class="builder-footer">
          <div class="price-display">
            Prix: <strong class="current-price" data-base-id="${base.id}">${formatPrice(volumes[0].basePrice)}</strong>
          </div>
          <button class="btn btn-primary add-to-cart-btn" data-base-id="${base.id}">
            Ajouter au panier
          </button>
        </div>
      </div>
    </article>
  `).join('');
  
  grid.innerHTML = html;
  attachBuilderEvents();
}

function attachBuilderEvents() {

  document.querySelectorAll('.vol-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const baseId = e.currentTarget.getAttribute('data-base-id');
      const volumeId = e.currentTarget.getAttribute('data-volume-id');

      document.querySelectorAll(`.vol-option[data-base-id="${baseId}"]`).forEach(b => {
        b.classList.remove('active');
      });
      e.currentTarget.classList.add('active');
      
      updatePriceDisplay(baseId);
    });
  });
  

  document.querySelectorAll('.scent-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const selector = e.target.closest('.scents-selector');
      const baseId = selector.getAttribute('data-base-id');
      const checked = selector.querySelectorAll('.scent-checkbox:checked').length;
      
      if (checked > 3) {
        e.target.checked = false;
        showToast('Maximum 3 odeurs autorisées', 'warning');
      } else {
        updatePriceDisplay(baseId);
      }
    });
  });
  

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const baseId = e.currentTarget.getAttribute('data-base-id');
      const article = e.currentTarget.closest('.perfume-builder');
      
      const selectedVol = article.querySelector('.vol-option.active');
      if (!selectedVol) {
        showToast('Veuillez sélectionner un volume', 'warning');
        return;
      }
      
      const volumeId = selectedVol.getAttribute('data-volume-id');
      const selectedScents = Array.from(article.querySelectorAll('.scent-checkbox:checked')).map(cb => cb.value);
      
      if (selectedScents.length === 0) {
        showToast('Veuillez sélectionner au moins une odeur', 'warning');
        return;
      }
      
      addToCart(baseId, volumeId, selectedScents, 1);

      e.currentTarget.textContent = '✓ Ajouté !';
      e.currentTarget.classList.add('btn-success');
      setTimeout(() => {
        e.currentTarget.textContent = 'Ajouter au panier';
        e.currentTarget.classList.remove('btn-success');
      }, 2000);
      
      showToast('Parfum ajouté au panier!', 'success');
    });
  });
}

function updatePriceDisplay(baseId) {
  const article = document.querySelector(`[data-base-id="${baseId}"]`);
  const selectedVol = article.querySelector('.vol-option.active');
  const selectedScents = article.querySelectorAll('.scent-checkbox:checked').length;
  
  if (!selectedVol) return;
  
  const volumeId = selectedVol.getAttribute('data-volume-id');
  const scentsArray = Array.from(article.querySelectorAll('.scent-checkbox:checked')).map(cb => cb.value);
  
  const price = calculatePrice(baseId, volumeId, scentsArray);
  const priceEl = article.querySelector('.current-price');
  if (priceEl) priceEl.textContent = formatPrice(price);
}


function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-cart">Votre panier est vide.</p>`;
  } else {
    const rows = cart.map(item => {
      const base = perfumeBases.find(b => b.id === item.baseId);
      const volume = volumes.find(v => v.id === item.volumeId);
      const scents = item.selectedScents.map(id => availableScents.find(s => s.id === id)?.name).join(', ');
      const price = calculatePrice(item.baseId, item.volumeId, item.selectedScents);
      const lineTotal = price * item.qty;
      
      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-image-wrapper">
            <img class="cart-item-image" src="${base.image}" alt="${base.name}">
          </div>
          <div class="cart-item-content">
            <div class="cart-item-header">
              <h4>${base.name}</h4>
              <span class="cart-item-volume">${volume.size}</span>
            </div>
            <p class="cart-item-scents"><strong>Odeurs:</strong> ${scents}</p>
            <div class="cart-item-footer">
              <div class="cart-item-qty">
                <label for="qty-${item.id}">Qtité</label>
                <input type="number" id="qty-${item.id}" min="1" value="${item.qty}" class="qty-input">
              </div>
              <div class="cart-item-price">
                <p class="unit-price">${formatPrice(price)}/unité</p>
                <p class="subtotal">Total: <strong>${formatPrice(lineTotal)}</strong></p>
              </div>
              <button class="btn btn-danger remove-btn" data-remove="${item.id}">×</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    container.innerHTML = rows;
  }

  const total = cart.reduce((sum, i) => {
    const price = calculatePrice(i.baseId, i.volumeId, i.selectedScents);
    return sum + (price * i.qty);
  }, 0);
  
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = formatPrice(total);

  container.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const item = e.target.closest('.cart-item');
      const id = item.getAttribute('data-id');
      updateQty(id, parseInt(e.target.value, 10) || 1);
    });
  });

  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.cart-item');
      const id = item.getAttribute('data-id');
      removeFromCart(id);
    });
  });
}

function bindCartActions() {
    const clearBtn = document.getElementById('clear-cart');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        if (getCart().length === 0) {
            showToast('Votre panier est déjà vide', 'info');
            return;
        }
        clearBtn.innerHTML = '<span class="btn-loader">⟳</span>';
        setTimeout(() => {
            clearCart();
            showToast('Panier vidé', 'success');
        }, 300);
    });

    const checkoutBtn = document.getElementById('checkout');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            showToast('Votre panier est vide', 'warning');
            return;
        }
        checkoutBtn.innerHTML = '<span class="btn-loader">⟳</span>';
        setTimeout(() => {
            showToast('Merci pour votre commande ! Redirection...', 'success');
            setTimeout(() => {
                clearCart();
                checkoutBtn.innerHTML = 'Procéder à la commande';
                window.location.href = 'index.html';
            }, 2000);
        }, 300);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCatalog();
    renderCartPage();
    bindCartActions();

});



