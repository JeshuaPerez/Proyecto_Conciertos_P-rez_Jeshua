/* =============================================
   WEB COMPONENT: <cc-cart>
   Con contador de tickets por evento
   ============================================= */

class CCCart extends HTMLElement {
  constructor() {
    super();
    this._open = false;
    this._checkoutMode = false;
  }

  connectedCallback() {
    document.addEventListener('cart-updated', () => this._render());
    this._render();
  }

  _render() {
    const items = CartDB.getAll();
    const totalTickets = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => {
      const ev = EventDB.getById(i.eventId);
      return s + (ev ? ev.price * i.qty : 0);
    }, 0);

    this.innerHTML = `
      <!-- Cart toggle button -->
      <button class="cart-toggle-btn" id="cartToggleBtn" title="Carrito de compras">
        🛒
        ${totalTickets > 0 ? `<span class="cart-count">${totalTickets}</span>` : ''}
      </button>

      <!-- Cart modal -->
      ${this._open ? `
      <div class="modal-overlay cart-overlay" id="cartOverlay">
        <div class="modal cart-modal">
          <div class="modal-header">
            <h2 class="modal-title">🛒 Mi Carrito</h2>
            <button class="modal-close" id="closeCartBtn">✕</button>
          </div>

          ${!this._checkoutMode ? `
          <!-- Cart items -->
          <div class="cart-items">
            ${items.length === 0 ? `
              <div class="cart-empty">
                <p style="font-size:2.5rem">🎵</p>
                <p>Tu carrito está vacío</p>
                <small>Agrega eventos desde la lista principal</small>
              </div>
            ` : items.map(item => {
              const ev = EventDB.getById(item.eventId);
              if (!ev) return '';
              return `
                <div class="cart-item">
                  <img src="${ev.image}" alt="${ev.name}" class="cart-item-img"
                    onerror="this.src='https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=120&q=70'"/>
                  <div class="cart-item-info">
                    <p class="cart-item-name">${ev.name}</p>
                    <p class="cart-item-meta">${ev.city} · ${formatDate(ev.date)}</p>
                    <p class="cart-item-price">${formatPrice(ev.price)} <span style="color:var(--text-dim);font-size:.78rem">/ ticket</span></p>
                  </div>
                  <div class="cart-item-right">
                    <div class="qty-control">
                      <button class="qty-btn qty-minus" data-id="${ev.id}" title="Restar">−</button>
                      <span class="qty-value">${item.qty}</span>
                      <button class="qty-btn qty-plus" data-id="${ev.id}" title="Sumar">+</button>
                    </div>
                    <p class="cart-item-subtotal">${formatPrice(ev.price * item.qty)}</p>
                    <button class="cart-remove-btn btn btn-danger btn-sm btn-icon" data-id="${ev.id}" title="Eliminar">✕</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${items.length > 0 ? `
          <div class="cart-footer">
            <div class="cart-total">
              <span>${totalTickets} ticket${totalTickets !== 1 ? 's' : ''}</span>
              <strong>${formatPrice(total)}</strong>
            </div>
            <button class="btn btn-primary" id="checkoutBtn" style="width:100%">Comprar ahora →</button>
          </div>
          ` : ''}

          ` : `
          <!-- Checkout form -->
          <div class="checkout-form-wrap">
            <h3 class="checkout-subtitle">Datos del comprador</h3>
            <div class="checkout-form">
              <div class="form-group">
                <label>Número de identificación</label>
                <input class="input" id="chk-id" placeholder="Ej. 1234567890" required/>
              </div>
              <div class="form-group">
                <label>Nombre completo</label>
                <input class="input" id="chk-name" placeholder="Tu nombre" required/>
              </div>
              <div class="form-group">
                <label>Dirección</label>
                <input class="input" id="chk-address" placeholder="Tu dirección" required/>
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input class="input" id="chk-phone" type="tel" placeholder="Ej. 3001234567" required/>
              </div>
              <div class="form-group">
                <label>Correo electrónico</label>
                <input class="input" id="chk-email" type="email" placeholder="correo@ejemplo.com" required/>
              </div>
            </div>
            <div class="cart-footer">
              <div class="cart-total">
                <span>Total a pagar</span>
                <strong>${formatPrice(total)}</strong>
              </div>
              <div style="display:flex;gap:.6rem;flex-wrap:wrap">
                <button class="btn btn-ghost" id="backToCartBtn">← Volver</button>
                <button class="btn btn-primary" id="confirmBtn" style="flex:1">✓ Confirmar compra</button>
              </div>
            </div>
          </div>
          `}
        </div>
      </div>
      ` : ''}
    `;

    this.querySelector('#cartToggleBtn').addEventListener('click', () => {
      this._open = !this._open;
      this._checkoutMode = false;
      this._render();
    });

    if (this._open) {
      this.querySelector('#closeCartBtn')?.addEventListener('click', () => {
        this._open = false; this._checkoutMode = false; this._render();
      });

      this.querySelector('#cartOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) { this._open = false; this._checkoutMode = false; this._render(); }
      });

      this.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = CartDB.getAll().find(i => i.eventId === btn.dataset.id);
          if (item && item.qty > 1) {
            CartDB.updateQty(btn.dataset.id, item.qty - 1);
          } else {
            CartDB.remove(btn.dataset.id);
            showToast('Evento eliminado del carrito', 'info');
            document.dispatchEvent(new CustomEvent('cart-updated'));
          }
          this._render();
        });
      });

      this.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = CartDB.getAll().find(i => i.eventId === btn.dataset.id);
          if (item) {
            if (item.qty >= 20) { showToast('Máximo 20 tickets por evento', 'warning'); return; }
            CartDB.updateQty(btn.dataset.id, item.qty + 1);
            this._render();
          }
        });
      });

      this.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          CartDB.remove(btn.dataset.id);
          showToast('Evento eliminado del carrito', 'info');
          document.dispatchEvent(new CustomEvent('cart-updated'));
          this._render();
        });
      });

      this.querySelector('#checkoutBtn')?.addEventListener('click', () => {
        this._checkoutMode = true; this._render();
      });

      this.querySelector('#backToCartBtn')?.addEventListener('click', () => {
        this._checkoutMode = false; this._render();
      });

      this.querySelector('#confirmBtn')?.addEventListener('click', () => this._confirmPurchase(items, total));
    }
  }

  _confirmPurchase(items, total) {
    const id    = this.querySelector('#chk-id')?.value.trim();
    const name  = this.querySelector('#chk-name')?.value.trim();
    const addr  = this.querySelector('#chk-address')?.value.trim();
    const phone = this.querySelector('#chk-phone')?.value.trim();
    const email = this.querySelector('#chk-email')?.value.trim();

    if (!id || !name || !addr || !phone || !email) {
      showToast('Por favor completa todos los campos', 'error'); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) { showToast('Email inválido', 'error'); return; }

    const saleItems = items.map(i => {
      const ev = EventDB.getById(i.eventId);
      return { eventId: ev.id, name: ev.name, price: ev.price, qty: i.qty, subtotal: ev.price * i.qty, city: ev.city };
    });

    const sale = SaleDB.add({
      customer: { id, name, address: addr, phone, email },
      items: saleItems,
      total,
      city: saleItems[0]?.city || '—',
    });

    CartDB.clear();
    this._open = false;
    this._checkoutMode = false;
    document.dispatchEvent(new CustomEvent('cart-updated'));
    this._render();

    const totalTickets = items.reduce((s, i) => s + i.qty, 0);
    showToast(`🎉 ¡Compra confirmada! ${totalTickets} ticket${totalTickets !== 1 ? 's' : ''} — Boleta #${sale.id.slice(-5).toUpperCase()}`, 'success', 5000);
  }
}
customElements.define('cc-cart', CCCart);

// ─────────────────────────────────────────────
// CART STYLES — Rojo · Negro · Blanco
// ─────────────────────────────────────────────
const cartStyle = document.createElement('style');
cartStyle.textContent = `
  cc-cart { position: fixed; bottom: 2rem; right: 2rem; z-index: 500; }

  .cart-toggle-btn {
    width: 58px; height: 58px;
    border-radius: 50%;
    background: var(--accent); color: #fff;
    border: none; font-size: 1.4rem;
    cursor: pointer;
    box-shadow: 0 6px 24px rgba(224,16,16,.45);
    position: relative; transition: var(--transition);
    display: flex; align-items: center; justify-content: center;
  }
  .cart-toggle-btn:hover {
    transform: scale(1.1);
    background: var(--accent2);
    box-shadow: 0 8px 28px rgba(224,16,16,.6);
  }
  @keyframes countPop {
    0%   { transform: scale(0) rotate(-12deg); }
    70%  { transform: scale(1.25) rotate(3deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  .cart-count {
    position: absolute; top: -4px; right: -4px;
    background: #fff; color: var(--accent);
    width: 22px; height: 22px; border-radius: 50%;
    font-size: .72rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--accent);
    animation: countPop .35s cubic-bezier(.34,1.56,.64,1);
  }

  .cart-modal { max-width: 460px; width: 100%; display: flex; flex-direction: column; max-height: 88vh; }
  .cart-items { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: .8rem; max-height: 50vh; padding-right: .2rem; }
  .cart-empty { text-align: center; padding: 2.5rem 1rem; color: var(--text-dim); display: flex; flex-direction: column; gap: .4rem; align-items: center; }

  .cart-item { display: flex; align-items: center; gap: .85rem; padding: .75rem; background: var(--bg3); border-radius: var(--radius); border: 1px solid var(--border); transition: var(--transition); }
  .cart-item:hover { border-color: var(--accent); }
  .cart-item-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: var(--bg2); }
  .cart-item-info { flex: 1; min-width: 0; }
  .cart-item-name { font-size: .88rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cart-item-meta { font-size: .74rem; color: var(--text-dim); margin: .2rem 0; }
  .cart-item-price { font-family: var(--font-disp); font-size: .95rem; color: var(--accent); }

  .cart-item-right { display: flex; flex-direction: column; align-items: center; gap: .35rem; flex-shrink: 0; }

  .qty-control {
    display: flex; align-items: center;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 8px; overflow: hidden;
  }
  .qty-btn {
    width: 28px; height: 28px;
    background: none; border: none;
    color: var(--text); font-size: 1.1rem; font-weight: 700;
    cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; justify-content: center;
  }
  .qty-btn:hover { background: var(--accent); color: #fff; }
  .qty-value {
    min-width: 28px; text-align: center;
    font-size: .88rem; font-weight: 700; color: var(--text);
    border-left: 1px solid var(--border); border-right: 1px solid var(--border);
    padding: 0 .2rem; line-height: 28px;
  }
  .cart-item-subtotal { font-family: var(--font-disp); font-size: .9rem; color: var(--accent); white-space: nowrap; }

  .cart-footer { padding-top: 1.2rem; border-top: 1px solid var(--border); margin-top: 1.2rem; display: flex; flex-direction: column; gap: .8rem; }
  .cart-total { display: flex; justify-content: space-between; align-items: center; }
  .cart-total span { color: var(--text-dim); font-size: .88rem; }
  .cart-total strong { font-family: var(--font-disp); font-size: 1.5rem; color: var(--accent); }

  .checkout-subtitle { font-family: var(--font-disp); font-size: 1.3rem; letter-spacing: .04em; margin-bottom: 1rem; }
  .checkout-form { display: flex; flex-direction: column; gap: .9rem; max-height: 44vh; overflow-y: auto; padding-right: .2rem; margin-bottom: .5rem; }
`;
document.head.appendChild(cartStyle);
