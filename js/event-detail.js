/* =============================================
   WEB COMPONENT: <cc-event-detail>
   Paleta: Rojo · Negro · Blanco
   ============================================= */

class CCEventDetail extends HTMLElement {
  constructor() {
    super();
    this._onShowDetail = (e) => this._open(e.detail.id);
  }

  connectedCallback() {
    document.addEventListener('show-event-detail', this._onShowDetail);
    this.innerHTML = '';
  }

  disconnectedCallback() {
    document.removeEventListener('show-event-detail', this._onShowDetail);
  }

  _open(id) {
    const event = EventDB.getById(id);
    if (!event) return;
    const cat = CategoryDB.getById(event.categoryId);
    const inCart = CartDB.getAll().some(i => i.eventId === event.id);

    this.innerHTML = `
      <div class="modal-overlay detail-overlay">
        <div class="modal detail-modal">
          <div class="detail-img-wrap">
            <img src="${event.image}" alt="${event.name}" class="detail-hero"
              onerror="this.src='https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'"/>
            <div class="detail-img-overlay">
              ${cat ? `<span class="detail-cat-badge">${cat.name}</span>` : ''}
            </div>
          </div>
          <div class="detail-content">
            <div class="detail-top">
              <span class="detail-code">Cód. ${event.code}</span>
              <button class="modal-close detail-close">✕</button>
            </div>
            <h2 class="detail-title">${event.name}</h2>
            <div class="detail-meta">
              <div class="detail-meta-item">
                <span class="dmi-icon">📅</span>
                <div><strong>Fecha</strong><span>${formatDate(event.date)}</span></div>
              </div>
              <div class="detail-meta-item">
                <span class="dmi-icon">🕐</span>
                <div><strong>Hora</strong><span>${event.time}</span></div>
              </div>
              <div class="detail-meta-item">
                <span class="dmi-icon">📍</span>
                <div><strong>Ciudad</strong><span>${event.city}</span></div>
              </div>
              <div class="detail-meta-item">
                <span class="dmi-icon">🎭</span>
                <div><strong>Categoría</strong><span>${cat?.name || '—'}</span></div>
              </div>
            </div>
            <p class="detail-desc">${event.description}</p>
            <div class="detail-actions">
              <span class="detail-price">${formatPrice(event.price)}</span>
              <div class="detail-btns">
                <button class="btn btn-ghost detail-close">← Volver</button>
                <button class="btn ${inCart ? 'btn-ghost' : 'btn-primary'} detail-cart-btn" data-id="${event.id}">
                  ${inCart ? '✓ Ya en carrito' : '🎟 Agregar al carrito'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.querySelectorAll('.detail-close').forEach(b => b.addEventListener('click', () => this._close()));
    this.querySelector('.detail-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._close();
    });
    this.querySelector('.detail-cart-btn').addEventListener('click', () => {
      if (CartDB.getAll().some(i => i.eventId === event.id)) {
        showToast('Este evento ya está en tu carrito', 'warning');
        return;
      }
      CartDB.add(event.id);
      showToast(`"${event.name}" agregado al carrito 🎟`, 'success');
      document.dispatchEvent(new CustomEvent('cart-updated'));
      this._close();
    });
  }

  _close() { this.innerHTML = ''; }
}
customElements.define('cc-event-detail', CCEventDetail);

const detailStyle = document.createElement('style');
detailStyle.textContent = `
  .detail-modal { max-width: 640px; padding: 0; overflow: hidden; }
  .detail-img-wrap { position: relative; overflow: hidden; }
  .detail-hero { width: 100%; aspect-ratio: 16/7; object-fit: cover; display: block; }
  .detail-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 50%);
    display: flex; align-items: flex-end; padding: .9rem 1.1rem;
  }
  .detail-cat-badge {
    background: var(--accent); color: #fff;
    font-size: .72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; padding: .25rem .7rem; border-radius: 99px;
  }
  .detail-content { padding: 1.6rem 2rem 2rem; }
  .detail-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .7rem; }
  .detail-code { font-size: .72rem; color: var(--text-dim); font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
  .detail-title { font-family: var(--font-disp); font-size: 2rem; letter-spacing: .04em; margin-bottom: 1.1rem; line-height: 1.1; }
  .detail-meta { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-bottom: 1.2rem; }
  .detail-meta-item { display: flex; align-items: flex-start; gap: .6rem; }
  .dmi-icon { font-size: 1rem; margin-top: .1rem; }
  .detail-meta-item div { display: flex; flex-direction: column; }
  .detail-meta-item strong { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-dim); }
  .detail-meta-item span { font-size: .88rem; margin-top: .1rem; }
  .detail-desc { color: var(--text-dim); font-size: .92rem; line-height: 1.72; margin-bottom: 1.4rem; border-left: 3px solid var(--accent); padding-left: 1rem; }
  .detail-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .detail-price { font-family: var(--font-disp); font-size: 2rem; color: var(--accent); letter-spacing: .04em; }
  .detail-btns { display: flex; gap: .6rem; flex-wrap: wrap; }

  @media (max-width: 600px) {
    .detail-meta { grid-template-columns: 1fr; }
    .detail-content { padding: 1.2rem; }
    .detail-actions { flex-direction: column; align-items: stretch; }
    .detail-price { text-align: center; }
    .detail-btns { justify-content: stretch; }
    .detail-btns .btn { flex: 1; justify-content: center; }
  }
`;
document.head.appendChild(detailStyle);
