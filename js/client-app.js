/* =============================================
   WEB COMPONENT: <cc-client-app>
   Main public-facing application
   ============================================= */

class CCClientApp extends HTMLElement {
  constructor() {
    super();
    this._search = '';
    this._city = '';
    this._category = '';
    this._sort = 'date'; // 'date' | 'price-asc' | 'price-desc'
  }

  connectedCallback() {
    document.addEventListener('cart-updated', () => this._updateCartCount());
    this._render();
  }

  _getFiltered() {
    let events = EventDB.getAll();
    const q = this._search.toLowerCase();
    if (q) events = events.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    if (this._city) events = events.filter(e => e.city === this._city);
    if (this._category) events = events.filter(e => e.categoryId === this._category);

    // Sorting
    if (this._sort === 'price-asc')  events = [...events].sort((a,b) => a.price - b.price);
    if (this._sort === 'price-desc') events = [...events].sort((a,b) => b.price - a.price);
    if (this._sort === 'date')       events = [...events].sort((a,b) => new Date(a.date) - new Date(b.date));
    if (this._sort === 'name')       events = [...events].sort((a,b) => a.name.localeCompare(b.name));

    return events;
  }

  _getFeatured() {
    // Próximos 3 eventos ordenados por fecha
    return EventDB.getAll()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }

  _render() {
    const categories = CategoryDB.getAll();
    const filtered = this._getFiltered();
    const featured = this._getFeatured();
    const cities = ['Ciudad de Guatemala', 'Quetzaltenango (Xela)', 'Antigua Guatemala', 'Mazatenango', 'Cobán', 'Fórum Majadas'];
    const totalEvents = EventDB.getAll().length;

    this.innerHTML = `

  <!-- HEADER -->
  <header class="client-header" id="filtersSection">
    <div class="header-inner">
      <a href="index.html" class="header-logo">
        <span class="logo-cc">CONCIERTOS</span>
        <span class="logo-cc-sub">CONECTADOS</span>
      </a>
    <div class="header-filters">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input class="input search-input" id="searchInput" placeholder="Buscar evento..." value="${this._search}"/>
      </div>
      <select class="select filter-select" id="cityFilter">
        <option value="">Todas las ciudades</option>
        ${cities.map(c => `<option value="${c}" ${this._city === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <select class="select filter-select" id="catFilter">
        <option value="">Todas las categorías</option>
        ${categories.map(c => `<option value="${c.id}" ${this._category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <select class="select filter-select" id="sortFilter">
        <option value="date" ${this._sort === 'date' ? 'selected' : ''}>📅 Más próximos</option>
        <option value="price-asc" ${this._sort === 'price-asc' ? 'selected' : ''}>💰 Menor precio</option>
        <option value="price-desc" ${this._sort === 'price-desc' ? 'selected' : ''}>💎 Mayor precio</option>
        <option value="name" ${this._sort === 'name' ? 'selected' : ''}>🔤 Nombre A-Z</option>
      </select>
      ${(this._search || this._city || this._category) ? `<button class="btn btn-ghost btn-sm" id="clearFilters">✕ Limpiar</button>` : ''}
      </div>
        <nav class="header-nav">
          <a href="index.html" class="nav-link active">Eventos</a>
          <a href="admin.html" class="nav-link nav-admin">Admin ↗</a>
        </nav>
     </div>
     <div class="header-glow"></div>
  </header>


      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-noise"></div>
        <div class="hero-content">
          <span class="hero-eyebrow"><span class="hero-dot"></span> ${totalEvents} eventos disponibles</span>
          <h3 class="hero-title">VIVE LOS MEJORES CONCIERTOS<br><em>DEL AÑO</em><br>BAJO EL CIELO DE GUATE</h3>
          <p class="hero-sub">Descubre, elige y compra tus entradas en segundos.</p>
        </div>
        <div class="hero-scroll-hint">
          <span>↓</span>
        </div>
      </section>

      <!-- FEATURED EVENTS -->
      ${featured.length > 0 ? `
      <section class="featured-section">
        <div class="featured-inner">
          <div class="featured-header">
            <h2 class="featured-title"><span class="title-line"></span>PRÓXIMOS EVENTOS</h2>
          </div>
          <div class="featured-grid">
            ${featured.map((e, i) => `
              <div class="featured-card ${i === 0 ? 'featured-card--hero' : ''}" data-id="${e.id}">
                <div class="fc-img-wrap">
                  <img src="${e.image}" alt="${e.name}" class="fc-img" loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'"/>
                  <div class="fc-overlay">
                    <span class="fc-badge">${CategoryDB.getById(e.categoryId)?.name || ''}</span>
                    <div class="fc-price">${formatPrice(e.price)}</div>
                  </div>
                </div>
                <div class="fc-info">
                  <h3 class="fc-title">${e.name}</h3>
                  <div class="fc-meta">
                    <span>📅 ${formatDate(e.date)}</span>
                    <span>📍 ${e.city}</span>
                  </div>
                  <div class="fc-actions">
                    <button class="btn btn-primary btn-sm fc-cart-btn" data-id="${e.id}">+ Carrito</button>
                    <button class="btn btn-ghost btn-sm fc-detail-btn" data-id="${e.id}">Ver más</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}
      
      <!-- EVENTS -->
      <main class="events-section">
        <div class="events-header">
          <h2 class="section-title">${filtered.length === 0 ? 'Sin resultados' : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}</h2>
        </div>

        ${filtered.length === 0 ? `
          <div class="no-results">
            <p style="font-size:3rem">🔎</p>
            <p>No encontramos eventos con esos filtros.</p>
            <button class="btn btn-ghost btn-sm" id="clearFilters2">Limpiar filtros</button>
          </div>
        ` : `
          <div class="events-grid">
            ${filtered.map(e => `<cc-event-card event-id="${e.id}"></cc-event-card>`).join('')}
          </div>
        `}
      </main>

      <!-- NEWSLETTER SECTION -->
      <section class="newsletter-section">
        <div class="newsletter-inner">
          <div class="newsletter-text">
            <h2 class="newsletter-title">¿NO TE PIERDAS<br><em>NINGÚN EVENTO</em></h2>
            <p class="newsletter-sub">Suscríbete y recibe notificaciones de los mejores conciertos en tu ciudad.</p>
          </div>
          <form class="newsletter-form" id="newsletterForm">
            <input class="input newsletter-input" id="newsletterEmail" type="email" placeholder="tu@correo.com" required/>
            <button type="submit" class="btn btn-primary">Suscribirme</button>
          </form>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="client-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <span class="footer-logo">CONCIERTOS CONECTADOS</span>
            <span class="footer-tagline">Tu plataforma de música en vivo</span>
          </div>
          <nav class="footer-links">
            <a href="index.html">Eventos</a>
            <a href="admin.html">Admin</a>
          </nav>
          <span class="footer-copy">© ${new Date().getFullYear()} — Todos los derechos reservados</span>
          <button onclick = "Window.location.href = 'buzon.html'">Sugerencias</button>
        </div>
      </footer>

      <!-- Components -->
      <cc-cart></cc-cart>
      <cc-event-detail></cc-event-detail>
    `;

    this._attachFilters();
    this._attachFeaturedEvents();

    // Hero CTA scroll to filters
    this.querySelector('#heroCtaBtn')?.addEventListener('click', () => {
      this.querySelector('#filtersSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Newsletter submit
    this.querySelector('#newsletterForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = this.querySelector('#newsletterEmail')?.value.trim();
      if (email) {
        showToast(`¡Suscripción confirmada para ${email}! 🎵`, 'success', 4000);
        this.querySelector('#newsletterEmail').value = '';
      }
    });
  }

  _attachFeaturedEvents() {
    this.querySelectorAll('.fc-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ev = EventDB.getById(btn.dataset.id);
        if (!ev) return;
        const added = CartDB.add(ev.id);
        if (added) {
          showToast(`"${ev.name}" agregado al carrito 🎟`, 'success');
          document.dispatchEvent(new CustomEvent('cart-updated'));
        } else {
          showToast('Este evento ya está en tu carrito', 'warning');
        }
      });
    });

    this.querySelectorAll('.fc-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('show-event-detail', { detail: { id: btn.dataset.id } }));
      });
    });
  }

  _renderGrid() {
    const filtered = this._getFiltered();
    const section = this.querySelector('.events-section');
    if (!section) return;

    section.innerHTML = `
      <div class="events-header">
        <h2 class="section-title">${filtered.length === 0 ? 'Sin resultados' : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}</h2>
      </div>
      ${filtered.length === 0 ? `
        <div class="no-results">
          <p style="font-size:3rem">🔎</p>
          <p>No encontramos eventos con esos filtros.</p>
          <button class="btn btn-ghost btn-sm" id="clearFilters2">Limpiar filtros</button>
        </div>
      ` : `
        <div class="events-grid">
          ${filtered.map(e => `<cc-event-card event-id="${e.id}"></cc-event-card>`).join('')}
        </div>
      `}
    `;

    section.querySelector('#clearFilters2')?.addEventListener('click', () => {
      this._search = ''; this._city = ''; this._category = '';
      this._render();
    });
  }

  _attachFilters() {
    const search    = this.querySelector('#searchInput');
    const cityF     = this.querySelector('#cityFilter');
    const catF      = this.querySelector('#catFilter');
    const sortF     = this.querySelector('#sortFilter');
    const clearBtn  = this.querySelector('#clearFilters');
    const clearBtn2 = this.querySelector('#clearFilters2');

    search?.addEventListener('input', (e) => {
      this._search = e.target.value;
      this._renderGrid();
    });

    cityF?.addEventListener('change', (e) => { this._city = e.target.value; this._render(); });
    catF?.addEventListener('change',  (e) => { this._category = e.target.value; this._render(); });
    sortF?.addEventListener('change', (e) => { this._sort = e.target.value; this._renderGrid(); });
    clearBtn?.addEventListener('click',  () => { this._search = ''; this._city = ''; this._category = ''; this._render(); });
    clearBtn2?.addEventListener('click', () => { this._search = ''; this._city = ''; this._category = ''; this._render(); });
  }

  _updateCartCount() {
    // Cart component handles its own re-render
  }
}
customElements.define('cc-client-app', CCClientApp);

// ─────────────────────────────────────────────
// CLIENT STYLES — Rojo · Negro · Blanco
// ─────────────────────────────────────────────
const clientStyle = document.createElement('style');
clientStyle.textContent = `
  /* ---- Header ---- */
    .client-header {
    position: sticky; top: 0; z-index: 200;
    background: rgba(10,10,10,.95);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
  }
  .header-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 2rem; height: 64px;
    display: flex; align-items: center; gap: 1.5rem;
  }
  .header-logo {
    text-decoration: none; display: flex; flex-direction: column;
    line-height: 1; flex-shrink: 0;
  }
  .logo-cc { font-family: var(--font-disp); font-size: 1.3rem; letter-spacing: .08em; color: var(--accent); }
  .logo-cc-sub { font-size: .6rem; letter-spacing: .18em; color: var(--text-dim); text-transform: uppercase; }
  .header-filters {
    flex: 1; display: flex; align-items: center; gap: .6rem; min-width: 0;
  }
  .header-filters .search-wrap {
    position: relative; flex: 5; min-width: 100px; max-width: 220px;
  }
  .header-filters .search-icon {
    position: absolute; left: .85rem; top: 50%;
    transform: translateY(-50%); pointer-events: none; font-size: .85rem;
  }
  .header-filters .search-input { padding-left: 2.2rem; height: 36px; font-size: .85rem; }
  .header-filters .filter-select {
    height: 36px; font-size: .85rem;
    width: 175px; flex-shrink: 0; padding: 0 .6rem;
  }
  .header-filters .btn-sm { height: 36px; flex-shrink: 0; }
  .header-nav { display: flex; gap: 1.2rem; align-items: center; flex-shrink: 0; }
  .nav-link { text-decoration: none; color: var(--text-dim); font-size: .88rem; font-weight: 500; transition: var(--transition); }
  .nav-link:hover, .nav-link.active { color: var(--text); }
  .nav-admin { color: var(--accent); font-weight: 700; }
  .nav-admin:hover { color: var(--accent2); }
  .header-glow {
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: .4;
  }

  /* ---- Hero ---- */
  .hero {
    position: relative; overflow: hidden;
    padding: 6rem 2rem 5rem;
    text-align: center;
    min-height: 85vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 50% 0%, rgba(224,16,16,.14) 0%, transparent 65%),
      radial-gradient(ellipse 50% 35% at 20% 80%, rgba(224,16,16,.07) 0%, transparent 65%);
    pointer-events: none;
  }
  /* Textura noise sutil */
  .hero-noise {
    position: absolute; inset: 0; pointer-events: none; opacity: .03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }
  .hero-content { position: relative; max-width: 740px; margin: 0 auto; z-index: 1; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: .5rem;
    font-size: .82rem; letter-spacing: .16em; text-transform: uppercase;
    color: var(--text-dim); margin-bottom: 1.4rem;
    background: rgba(255,255,255,.04); border: 1px solid var(--border);
    padding: .3rem .9rem; border-radius: 99px;
  }
  .hero-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .5; transform: scale(.8); }
  }
  .hero-title {
    font-family: var(--font-disp);
    font-size: clamp(3.5rem, 11vw, 6.5rem);
    letter-spacing: .04em; line-height: .92;
    margin-bottom: 1.3rem;
    color: #fff;
  }
  .hero-title em { font-style: normal; color: var(--accent); }
  .hero-sub { color: var(--text-dim); font-size: 1.05rem; max-width: 420px; margin: 0 auto 2rem; }
  .hero-actions { display: flex; gap: .8rem; justify-content: center; flex-wrap: wrap; }
  .hero-cta { padding: .8rem 2rem; font-size: 1rem; }

  .hero-scroll-hint {
    position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
    color: var(--text-faint); font-size: 1.2rem;
    animation: bounce 2.5s ease-in-out infinite;
  }
  @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }

  /* ---- Featured Section ---- */
  .featured-section {
    background: var(--bg2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 3rem 0;
  }
  .featured-inner { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }
  .featured-header { margin-bottom: 1.8rem; }
  .featured-title {
    font-family: var(--font-disp);
    font-size: 1.8rem; letter-spacing: .08em;
    display: flex; align-items: center; gap: 1rem;
    color: var(--text);
  }
  .title-line {
    display: inline-block; width: 32px; height: 3px;
    background: var(--accent); border-radius: 2px; flex-shrink: 0;
  }
  .featured-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 1.2rem;
  }
  .featured-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: var(--transition);
    display: flex; flex-direction: column;
  }
  .featured-card:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,.5);
  }
  .featured-card--hero { grid-row: span 1; }
  .fc-img-wrap { position: relative; overflow: hidden; }
  .featured-card--hero .fc-img-wrap { aspect-ratio: 16/10; }
  .fc-img-wrap { aspect-ratio: 16/9; }
  .fc-img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
  .featured-card:hover .fc-img { transform: scale(1.05); }
  .fc-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.8) 0%, transparent 55%);
    display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start;
    padding: .9rem;
    gap: .3rem;
  }
  .fc-badge {
    background: var(--accent); color: #fff;
    font-size: .68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; padding: .18rem .55rem; border-radius: 99px;
  }
  .fc-price {
    font-family: var(--font-disp);
    font-size: 1.3rem;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,.5);
  }
  .fc-info { padding: .9rem 1rem 1rem; display: flex; flex-direction: column; gap: .5rem; flex: 1; }
  .fc-title { font-family: var(--font-disp); font-size: 1.1rem; letter-spacing: .03em; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fc-meta { display: flex; flex-direction: column; gap: .18rem; }
  .fc-meta span { font-size: .74rem; color: var(--text-dim); }
  .fc-actions { display: flex; gap: .5rem; margin-top: auto; padding-top: .4rem; }

 

  /* ---- Events section ---- */
  .events-section { max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }
  .events-header { margin-bottom: 1.5rem; }
  .section-title { font-family: var(--font-disp); font-size: 1.4rem; letter-spacing: .04em; color: var(--text-dim); }
  .no-results { text-align: center; padding: 4rem 1rem; color: var(--text-dim); display: flex; flex-direction: column; gap: .6rem; align-items: center; }

  /* ---- Newsletter ---- */
  .newsletter-section {
    background: var(--accent);
    padding: 4rem 2rem;
    position: relative; overflow: hidden;
  }
  .newsletter-section::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .newsletter-inner {
    max-width: 1000px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    gap: 2rem; flex-wrap: wrap;
    position: relative;
  }
  .newsletter-text { flex: 1; min-width: 260px; }
  .newsletter-title {
    font-family: var(--font-disp);
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    letter-spacing: .04em; line-height: .95;
    color: #fff; margin-bottom: .7rem;
  }
  .newsletter-title em { font-style: normal; color: rgba(255,255,255,.75); }
  .newsletter-sub { font-size: .9rem; color: rgba(255,255,255,.75); max-width: 340px; }
  .newsletter-form { display: flex; gap: .7rem; flex: 1; min-width: 280px; max-width: 440px; }
  .newsletter-input {
    background: rgba(255,255,255,.15); border-color: rgba(255,255,255,.25);
    color: #fff; flex: 1;
  }
  .newsletter-input::placeholder { color: rgba(255,255,255,.5); }
  .newsletter-input:focus { background: rgba(255,255,255,.2); border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.15); }
  .newsletter-form .btn-primary {
    background: #fff; color: var(--accent); font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
  }
  .newsletter-form .btn-primary:hover { background: #f0f0f0; box-shadow: none; }

  /* ---- Footer ---- */
  .client-footer {
    background: var(--bg2); border-top: 1px solid var(--border);
    padding: 2rem 0;
  }
  .footer-inner {
    max-width: 1280px; margin: 0 auto; padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  }
  .footer-brand { display: flex; flex-direction: column; gap: .15rem; }
  .footer-logo { font-family: var(--font-disp); font-size: 1.1rem; letter-spacing: .1em; color: var(--accent); }
  .footer-tagline { font-size: .73rem; color: var(--text-faint); }
  .footer-links { display: flex; gap: 1.5rem; }
  .footer-links a { color: var(--text-dim); text-decoration: none; font-size: .85rem; transition: var(--transition); }
  .footer-links a:hover { color: var(--accent); }
  .footer-copy { font-size: .78rem; color: var(--text-faint); }

@media (max-width: 900px) {
    .featured-grid { grid-template-columns: 1fr 1fr; }
    .featured-card--hero { grid-column: span 2; }
    .header-filters .filter-select { width: 120px; font-size: .8rem; }
    .header-filters .search-wrap { max-width: 160px; }
  }
  @media (max-width: 700px) {
    .header-inner { height: auto; flex-wrap: wrap; padding: .6rem 1rem; gap: .5rem; }
    .header-logo { flex: 1; }
    .header-nav { order: 2; }
    .header-filters {
      order: 3; width: 100%;
      flex-wrap: wrap; gap: .4rem;
      padding-bottom: .5rem;
    }
    .header-filters .search-wrap { max-width: 100%; flex: 1 1 140px; }
    .header-filters .filter-select { width: auto; flex: 1 1 120px; }
    .hero { padding: 4rem 1.2rem 3rem; min-height: 70vh; }
    .hero-actions { flex-direction: column; align-items: center; }
    .events-section { padding: 1.5rem 1rem 3rem; }
    .featured-grid { grid-template-columns: 1fr; }
    .featured-card--hero { grid-column: span 1; }
    .newsletter-inner { flex-direction: column; }
    .newsletter-form { width: 100%; max-width: 100%; }
    .footer-inner { flex-direction: column; text-align: center; }
    .footer-links { justify-content: center; }
  }
`;
document.head.appendChild(clientStyle);
