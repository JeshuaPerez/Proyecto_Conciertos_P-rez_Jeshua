/* =============================================
   WEB COMPONENT: <cc-event-card>
   ============================================= */

class CCEventCard extends HTMLElement {
  static get observedAttributes() { return ['event-id']; }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const id = this.getAttribute('event-id');
    if (!id) return;
    const event = EventDB.getById(id);
    if (!event) return;
    const cat = CategoryDB.getById(event.categoryId);
    const inCart = CartDB.getAll().some(i => i.eventId === event.id);
    const dateObj = new Date(event.date + 'T00:00:00');

    this.innerHTML = `
      <article class="event-card" data-id="${event.id}">
        <div class="card-img-wrap">
          <img src="${event.image}" alt="${event.name}" class="card-img" loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80'"/>
          <div class="card-overlay">
            <button class="btn btn-sm add-to-cart-btn ${inCart ? 'in-cart' : 'btn-primary'}" data-id="${event.id}">
              ${inCart ? '✓ En carrito' : '+ Carrito'}
            </button>
          </div>
          ${cat ? `<span class="card-badge">${cat.name}</span>` : ''}
          <div class="card-date-chip">
            <span class="chip-day">${dateObj.getDate()}</span>
            <span class="chip-month">${dateObj.toLocaleDateString('es-GT', { month: 'short' }).toUpperCase()}</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${event.name}</h3>
          <div class="card-meta">
            <span class="meta-item">🕐 ${event.time}</span>
            <span class="meta-item">📍 ${event.city}</span>
          </div>
          <div class="card-footer">
            <span class="card-price">${formatPrice(event.price)}</span>
            <button class="btn btn-ghost btn-sm detail-btn" data-id="${event.id}">Ver detalle</button>
          </div>
        </div>
      </article>
    `;

    this.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (CartDB.getAll().some(i => i.eventId === event.id)) {
        showToast('Este evento ya está en tu carrito', 'warning');
        return;
      }
      CartDB.add(event.id);
      showToast(`"${event.name}" agregado al carrito 🎟`, 'success');
      document.dispatchEvent(new CustomEvent('cart-updated'));
      this._render(); // update button state
    });

    this.querySelector('.detail-btn').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('show-event-detail', { detail: { id: event.id } }));
    });
  }
}
customElements.define('cc-event-card', CCEventCard);

const cardStyle = document.createElement('style');
cardStyle.textContent = `
  cc-event-card {
    display: block;
    opacity: 0;
    transform: translateY(18px);
    transition: opacity .45s ease, transform .45s ease;
  }
  cc-event-card.card-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .event-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition);
    cursor: pointer;
    will-change: transform;
  }
  .event-card:hover {
    border-color: var(--accent);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(224,16,16,.2);
  }
  .card-img-wrap {
    position: relative; overflow: hidden;
    aspect-ratio: 16/9;
    background: var(--bg3);
  }
  .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; display: block; }
  .event-card:hover .card-img { transform: scale(1.05); }

  .card-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,.5);
    display: flex; align-items: flex-end; justify-content: flex-end;
    padding: .9rem;
    opacity: 0; transition: var(--transition);
  }
  .event-card:hover .card-overlay { opacity: 1; }

  /* Estado "en carrito" */
  .add-to-cart-btn.in-cart {
    background: rgba(255,255,255,.15) !important;
    color: #fff !important;
    border: 1.5px solid rgba(255,255,255,.4) !important;
    cursor: default;
  }

  .card-badge {
    position: absolute; top: .7rem; left: .7rem;
    background: var(--accent);
    color: #fff;
    font-size: .68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .08em;
    padding: .2rem .65rem; border-radius: 99px;
  }

  /* Chip de fecha */
  .card-date-chip {
    position: absolute; top: .6rem; right: .6rem;
    background: rgba(10,10,10,.85);
    border: 1px solid var(--border);
    border-radius: 8px;
    display: flex; flex-direction: column; align-items: center;
    padding: .3rem .55rem;
    backdrop-filter: blur(6px);
    line-height: 1;
  }
  .chip-day { font-family: var(--font-disp); font-size: 1.2rem; color: var(--accent); }
  .chip-month { font-size: .58rem; font-weight: 700; letter-spacing: .1em; color: var(--text-dim); text-transform: uppercase; }

  .card-body { padding: 1.1rem; }
  .card-title {
    font-family: var(--font-disp);
    font-size: 1.25rem; letter-spacing: .04em; line-height: 1.2;
    margin-bottom: .6rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .card-meta { display: flex; flex-direction: column; gap: .22rem; margin-bottom: .9rem; }
  .meta-item { font-size: .8rem; color: var(--text-dim); }
  .card-footer { display: flex; align-items: center; justify-content: space-between; }
  .card-price { font-family: var(--font-disp); font-size: 1.3rem; color: var(--accent); letter-spacing: .04em; }
`;
document.head.appendChild(cardStyle);
