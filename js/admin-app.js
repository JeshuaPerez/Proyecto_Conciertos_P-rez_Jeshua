/* =============================================
   WEB COMPONENT: <cc-admin-app>
   Complete admin panel with login + modules
   ============================================= */

class CCAdminApp extends HTMLElement {
  constructor() {
    super();
    this._loggedIn = false;
    this._section = 'dashboard';
    this._sidebarOpen = false;
    this._eventSearch = '';
    this._saleSearch = '';
  }

  connectedCallback() { this._render(); }

  /* ========== RENDER ROUTER ========== */
  _render() {
    if (!this._loggedIn) { this._renderLogin(); return; }
    this._renderLayout();
  }

  /* ========== LOGIN ========== */
  _renderLogin() {
    this.innerHTML = `
      <div class="login-screen">
        <div class="login-bg-glow"></div>
        <div class="login-bg-glow2"></div>
        <div class="login-card">
          <div class="login-logo">
            <span class="logo-big">ADMINISTRADOR</span>
            <span class="logo-small">Conciertos Conectados</span>
          </div>
          <h2 class="login-title">Iniciar sesión</h2>
          <form class="login-form" id="loginForm">
            <div class="form-group">
              <label>Email</label>
              <input class="input" type="email" id="loginEmail" placeholder="admin@mail.com" required/>
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <div style="position:relative">
                <input class="input" type="password" id="loginPass" placeholder="••••••" required style="padding-right:2.8rem"/>
                <button type="button" id="togglePass" style="position:absolute;right:.8rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:1rem;line-height:1;padding:0">👁</button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:.85rem;font-size:1rem;margin-top:.4rem">Entrar</button>
          </form>
          <div style="text-align:center;margin-top:1.4rem;padding-top:1.2rem;border-top:1px solid var(--border)">
            <button id="goToStoreBtn" class="btn btn-ghost btn-sm" style="width:100%;justify-content:center">Volver a la tienda</button>
          </div>
          <p style="text-align:center;margin-top:.8rem;font-size:.75rem;color:var(--text-faint)">admin@mail.com · 123456</p>
        </div>
      </div>
    `;

    this.querySelector('#goToStoreBtn').addEventListener('click', () => { window.location.href = 'index.html'; });

    this.querySelector('#togglePass').addEventListener('click', () => {
      const inp = this.querySelector('#loginPass');
      const btn = this.querySelector('#togglePass');
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.textContent = inp.type === 'password' ? '👁' : '🙈';
    });

    this.querySelector('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = this.querySelector('#loginEmail').value.trim();
      const pass  = this.querySelector('#loginPass').value;
      if (email === 'admin@mail.com' && pass === '123456') {
        this._loggedIn = true;
        showToast('¡Bienvenido, Administrador! 🎵', 'success');
        this._render();
      } else {
        showToast('Credenciales incorrectas', 'error');
        this.querySelector('#loginPass').value = '';
        this.querySelector('#loginPass').focus();
      }
    });
  }

  /* ========== LAYOUT ========== */
  _renderLayout() {
    const sections = [
      { id: 'dashboard',  label: 'Dashboard',  icon: '▦' },
      { id: 'categories', label: 'Categorías', icon: '⊞' },
      { id: 'events',     label: 'Eventos',    icon: '🎵' },
      { id: 'sales',      label: 'Ventas',     icon: '💳' },
    ];

    this.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="admin-sidebar ${this._sidebarOpen ? 'open' : ''}" id="adminSidebar">
          <div class="sidebar-logo">
            <div class="logo-text">ADMINISTRADOR</div>
            <div class="logo-sub">Panel Administrativo<br>De Eventos</div>
          </div>
          <nav class="sidebar-nav">
            ${sections.map(s => `
              <button class="nav-item ${this._section === s.id ? 'active' : ''}" data-section="${s.id}">
                <span class="nav-icon">${s.icon}</span>
                ${s.label}
              </button>
            `).join('')}
          </nav>
          <div class="sidebar-footer">
            <a href="index.html" class="nav-item" style="text-decoration:none">
              <span class="nav-icon">🛍</span>
              Ver tienda
            </a>
            <button class="nav-item" id="logoutBtn">
              <span class="nav-icon">⏻</span>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <!-- Main -->
        <div class="admin-main">
          <header class="admin-topbar">
            <div style="display:flex;align-items:center;gap:.8rem">
              <button class="menu-toggle" id="menuToggle">☰</button>
              <span class="topbar-title">${sections.find(s => s.id === this._section)?.label || ''}</span>
            </div>
            <div class="topbar-user">
              <span class="topbar-user-email">admin@mail.com</span>
              <div class="user-avatar">AD</div>
            </div>
          </header>
          <div class="admin-content" id="adminContent">
            ${this._renderSection()}
          </div>
        </div>
      </div>
    `;

    this.querySelectorAll('.nav-item[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._section = btn.dataset.section;
        this._sidebarOpen = false;
        this._render();
      });
    });

    this.querySelector('#logoutBtn').addEventListener('click', () => {
      this._loggedIn = false; this._section = 'dashboard';
      showToast('Sesión cerrada', 'info');
      this._render();
    });

    this.querySelector('#menuToggle').addEventListener('click', () => {
      this._sidebarOpen = !this._sidebarOpen;
      this.querySelector('#adminSidebar').classList.toggle('open', this._sidebarOpen);
    });

    this._attachSectionEvents();
  }

  _renderSection() {
    switch (this._section) {
      case 'dashboard':  return this._renderDashboard();
      case 'categories': return this._renderCategories();
      case 'events':     return this._renderEvents();
      case 'sales':      return this._renderSales();
      default:           return '';
    }
  }

  /* ========== DASHBOARD ========== */
  _renderDashboard() {
    const events = EventDB.getAll();
    const cats   = CategoryDB.getAll();
    const sales  = SaleDB.getAll();
    const totalRevenue = sales.reduce((s, v) => s + (v.total || 0), 0);
    const totalTickets = sales.reduce((s, v) => s + (v.items || []).reduce((a, i) => a + (i.qty || 1), 0), 0);

    // Agrupar ventas por ciudad
    const byCityMap = {};
    sales.forEach(s => {
      const c = s.city || 'Otra';
      byCityMap[c] = (byCityMap[c] || 0) + (s.total || 0);
    });
    const topCities = Object.entries(byCityMap).sort((a,b) => b[1]-a[1]).slice(0,3);

    // Próximos eventos
    const upcomingEvents = events
      .filter(e => new Date(e.date) >= new Date())
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .slice(0,3);

    // Ventas recientes
    const recentSales = sales.slice(0, 5);

    return `
      <!-- Stat cards -->
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-label">Eventos activos</div>
          <div class="stat-value" style="color:var(--accent)">${events.length}</div>
          <div class="stat-icon">🎵</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Categorías</div>
          <div class="stat-value" style="color:#fff">${cats.length}</div>
          <div class="stat-icon">⊞</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Ventas totales</div>
          <div class="stat-value" style="color:var(--accent2)">${sales.length}</div>
          <div class="stat-icon">💳</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Tickets vendidos</div>
          <div class="stat-value" style="color:#ccc">${totalTickets}</div>
          <div class="stat-icon">🎟</div>
        </div>
        <div class="stat-card" style="grid-column:span 2">
          <div class="stat-label">Ingresos totales</div>
          <div class="stat-value" style="color:var(--success);font-size:1.8rem">${formatPrice(totalRevenue)}</div>
          <div class="stat-icon">💰</div>
        </div>
      </div>

      <!-- Two column layout -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">

        <!-- Ventas recientes -->
        <div>
          <h3 class="section-heading">Ventas recientes</h3>
          ${recentSales.length === 0 ? `
            <div class="empty-state">
              <span class="empty-icon">💳</span>
              <p>Sin ventas aún</p>
            </div>
          ` : `
            <div class="recent-sales-list">
              ${recentSales.map(s => `
                <div class="recent-sale-item">
                  <div class="rsi-left">
                    <span class="rsi-name">${s.customer?.name || '—'}</span>
                    <span class="rsi-meta">${new Date(s.date).toLocaleDateString('es-GT')} · ${(s.items||[]).reduce((a,i)=>a+(i.qty||1),0)} ticket${(s.items||[]).reduce((a,i)=>a+(i.qty||1),0)!==1?'s':''}</span>
                  </div>
                  <span class="rsi-amount">${formatPrice(s.total)}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Próximos eventos -->
        <div>
          <h3 class="section-heading">Próximos eventos</h3>
          ${upcomingEvents.length === 0 ? `
            <div class="empty-state">
              <span class="empty-icon">🎵</span>
              <p>Sin eventos próximos</p>
            </div>
          ` : `
            <div class="recent-sales-list">
              ${upcomingEvents.map(e => `
                <div class="recent-sale-item">
                  <div class="rsi-left">
                    <span class="rsi-name">${e.name}</span>
                    <span class="rsi-meta">${formatDate(e.date)} · ${e.city}</span>
                  </div>
                  <span class="rsi-amount">${formatPrice(e.price)}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      ${topCities.length > 0 ? `
      <h3 class="section-heading" style="margin-top:2rem">Top ciudades por ingresos</h3>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${topCities.map(([city, amount], i) => {
          const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
          return `
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:.8rem 1rem">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">
                <span style="font-size:.88rem;font-weight:600">${i+1}. ${city}</span>
                <span style="font-family:var(--font-disp);color:var(--accent)">${formatPrice(amount)}</span>
              </div>
              <div style="background:var(--border);border-radius:99px;height:5px;overflow:hidden">
                <div style="--bar-w:${pct}%;background:var(--accent);height:100%;border-radius:99px;width:0;animation:growBar .8s .1s cubic-bezier(.4,0,.2,1) forwards"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ` : ''}

      <!-- Tabla de eventos recientes -->
      <h3 class="section-heading" style="margin-top:2rem">Todos los eventos</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Código</th><th>Evento</th><th>Ciudad</th><th>Fecha</th><th>Precio</th></tr></thead>
          <tbody>
            ${events.length === 0 ? `<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">🎵</span><p>Sin eventos</p></div></td></tr>` :
              events.map(e => `
              <tr>
                <td><span class="badge badge-accent">${e.code}</span></td>
                <td><strong>${e.name}</strong></td>
                <td style="color:var(--text-dim)">${e.city}</td>
                <td style="white-space:nowrap;color:var(--text-dim)">${formatDate(e.date)}</td>
                <td style="color:var(--accent);font-family:var(--font-disp)">${formatPrice(e.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========== CATEGORIES ========== */
  _renderCategories() {
    const cats = CategoryDB.getAll();
    return `
      <div class="module-header">
        <h2 class="module-title">Categorías</h2>
        <button class="btn btn-primary" id="addCatBtn">+ Agregar categoría</button>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Eventos</th><th>Acciones</th></tr></thead>
          <tbody>
            ${cats.length === 0 ? `<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">⊞</span><p>Sin categorías registradas</p></div></td></tr>` :
              cats.map((c, i) => {
                const evCount = EventDB.getAll().filter(e => e.categoryId === c.id).length;
                return `
                  <tr>
                    <td style="color:var(--text-dim);font-size:.8rem">${i+1}</td>
                    <td><strong>${c.name}</strong></td>
                    <td style="color:var(--text-dim);max-width:260px">${c.description}</td>
                    <td>
                      <span class="badge badge-accent">${evCount}</span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-ghost btn-sm edit-cat-btn" data-id="${c.id}">✎ Editar</button>
                        <button class="btn btn-danger btn-sm btn-icon delete-cat-btn" data-id="${c.id}" title="Eliminar">✕</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========== EVENTS ========== */
  _renderEvents() {
    let events = EventDB.getAll();
    if (this._eventSearch) {
      const q = this._eventSearch.toLowerCase();
      events = events.filter(e => e.name.toLowerCase().includes(q) || e.city.toLowerCase().includes(q) || e.code.toLowerCase().includes(q));
    }

    return `
      <div class="module-header">
        <h2 class="module-title">Eventos</h2>
        <button class="btn btn-primary" id="addEventBtn">+ Crear evento</button>
      </div>
      <div class="module-search-wrap">
        <input class="input" id="eventSearch" placeholder="🔍 Buscar por nombre, ciudad o código..." value="${this._eventSearch}" style="max-width:320px"/>
        ${this._eventSearch ? `<button class="btn btn-ghost btn-sm" id="clearEventSearch">✕ Limpiar</button>` : ''}
        <span style="color:var(--text-dim);font-size:.82rem;margin-left:auto">${events.length} evento${events.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Imagen</th><th>Código</th><th>Nombre</th><th>Categoría</th><th>Ciudad</th><th>Fecha</th><th>Precio</th><th>Acciones</th></tr></thead>
          <tbody>
            ${events.length === 0 ? `<tr><td colspan="8"><div class="empty-state"><span class="empty-icon">🎵</span><p>Sin eventos encontrados</p></div></td></tr>` :
              events.map(e => {
                const cat = CategoryDB.getById(e.categoryId);
                const isPast = new Date(e.date) < new Date();
                return `
                  <tr style="${isPast ? 'opacity:.55' : ''}">
                    <td><img src="${e.image}" class="event-thumb" alt="${e.name}" onerror="this.src='https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&q=60'"/></td>
                    <td><span class="badge badge-accent">${e.code}</span></td>
                    <td>
                      <strong>${e.name}</strong>
                      ${isPast ? '<br><span style="font-size:.7rem;color:var(--text-dim)">Pasado</span>' : ''}
                    </td>
                    <td>${cat ? `<span class="badge badge-dim">${cat.name}</span>` : '—'}</td>
                    <td style="color:var(--text-dim);font-size:.85rem">${e.city}</td>
                    <td style="white-space:nowrap;font-size:.85rem;color:var(--text-dim)">${formatDate(e.date)}</td>
                    <td style="color:var(--accent);font-family:var(--font-disp)">${formatPrice(e.price)}</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-ghost btn-sm edit-event-btn" data-id="${e.id}" title="Editar">✎</button>
                        <button class="btn btn-danger btn-sm btn-icon delete-event-btn" data-id="${e.id}" title="Eliminar">✕</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========== SALES ========== */
  _renderSales() {
    const allSales = SaleDB.getAll();
    let sales = allSales;
    if (this._saleSearch) {
      const q = this._saleSearch.toLowerCase();
      sales = allSales.filter(s =>
        (s.customer?.name || '').toLowerCase().includes(q) ||
        (s.customer?.email || '').toLowerCase().includes(q) ||
        s.id.slice(-5).toLowerCase().includes(q)
      );
    }

    const totalRevenue = allSales.reduce((s, v) => s + (v.total || 0), 0);

    return `
      <div class="module-header">
        <h2 class="module-title">Ventas</h2>
        <div style="display:flex;align-items:center;gap:.8rem;flex-wrap:wrap">
          <span class="badge badge-accent">${allSales.length} venta${allSales.length !== 1 ? 's' : ''}</span>
          <span style="font-family:var(--font-disp);color:var(--accent);font-size:1.3rem">${formatPrice(totalRevenue)}</span>
        </div>
      </div>
      <div class="module-search-wrap">
        <input class="input" id="saleSearch" placeholder="🔍 Buscar por nombre, email o ID..." value="${this._saleSearch}" style="max-width:320px"/>
        ${this._saleSearch ? `<button class="btn btn-ghost btn-sm" id="clearSaleSearch">✕ Limpiar</button>` : ''}
        <span style="color:var(--text-dim);font-size:.82rem;margin-left:auto">${sales.length} resultado${sales.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Ciudad</th><th>Tickets</th><th>Total</th><th>Acción</th></tr></thead>
          <tbody>
            ${sales.length === 0 ? `<tr><td colspan="7"><div class="empty-state"><span class="empty-icon">💳</span><p>Sin ventas registradas</p></div></td></tr>` :
              sales.map(s => {
                const tickets = (s.items || []).reduce((a, i) => a + (i.qty || 1), 0);
                return `
                  <tr>
                    <td><span class="badge badge-accent">#${s.id.slice(-5).toUpperCase()}</span></td>
                    <td style="white-space:nowrap;color:var(--text-dim);font-size:.82rem">${new Date(s.date).toLocaleString('es-GT')}</td>
                    <td>
                      <strong style="font-size:.88rem">${s.customer?.name || '—'}</strong><br>
                      <small style="color:var(--text-dim)">${s.customer?.email || ''}</small>
                    </td>
                    <td style="color:var(--text-dim);font-size:.85rem">${s.city || '—'}</td>
                    <td style="text-align:center">
                      <span class="badge badge-dim">${tickets} 🎟</span>
                    </td>
                    <td style="color:var(--accent);font-family:var(--font-disp)">${formatPrice(s.total)}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm view-sale-btn" data-id="${s.id}">Ver →</button>
                    </td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ========== SECTION EVENTS ========== */
  _attachSectionEvents() {
    // ---- CATEGORIES ----
    this.querySelector('#addCatBtn')?.addEventListener('click', () => this._openCatModal());
    this.querySelectorAll('.edit-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = CategoryDB.getById(btn.dataset.id);
        if (cat) this._openCatModal(cat);
      });
    });
    this.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('¿Eliminar esta categoría?')) {
          CategoryDB.delete(btn.dataset.id);
          showToast('Categoría eliminada', 'info');
          this._renderLayout();
        }
      });
    });

    // ---- EVENTS ----
    this.querySelector('#addEventBtn')?.addEventListener('click', () => this._openEventModal());

    // Búsqueda en tiempo real en eventos
    this.querySelector('#eventSearch')?.addEventListener('input', (e) => {
      this._eventSearch = e.target.value;
      const content = this.querySelector('#adminContent');
      if (content) content.innerHTML = this._renderEvents();
      this._attachSectionEvents();
    });
    this.querySelector('#clearEventSearch')?.addEventListener('click', () => {
      this._eventSearch = '';
      const content = this.querySelector('#adminContent');
      if (content) content.innerHTML = this._renderEvents();
      this._attachSectionEvents();
    });

    this.querySelectorAll('.edit-event-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ev = EventDB.getById(btn.dataset.id);
        if (ev) this._openEventModal(ev);
      });
    });
    this.querySelectorAll('.delete-event-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('¿Eliminar este evento?')) {
          EventDB.delete(btn.dataset.id);
          showToast('Evento eliminado', 'info');
          this._renderLayout();
        }
      });
    });

    // ---- SALES ----
    this.querySelector('#saleSearch')?.addEventListener('input', (e) => {
      this._saleSearch = e.target.value;
      const content = this.querySelector('#adminContent');
      if (content) content.innerHTML = this._renderSales();
      this._attachSectionEvents();
    });
    this.querySelector('#clearSaleSearch')?.addEventListener('click', () => {
      this._saleSearch = '';
      const content = this.querySelector('#adminContent');
      if (content) content.innerHTML = this._renderSales();
      this._attachSectionEvents();
    });

    this.querySelectorAll('.view-sale-btn').forEach(btn => {
      btn.addEventListener('click', () => this._openSaleDetail(btn.dataset.id));
    });
  }

  /* ========== CATEGORY MODAL ========== */
  _openCatModal(cat = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${cat ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <button class="modal-close">✕</button>
        </div>
        <form id="catForm" style="display:flex;flex-direction:column;gap:1rem">
          <div class="form-group">
            <label>Nombre</label>
            <input class="input" id="catName" placeholder="Nombre de la categoría" value="${cat?.name || ''}" required/>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea class="textarea" id="catDesc" placeholder="Descripción breve">${cat?.description || ''}</textarea>
          </div>
          <div style="display:flex;gap:.6rem;justify-content:flex-end">
            <button type="button" class="btn btn-ghost modal-close">Cancelar</button>
            <button type="submit" class="btn btn-primary">${cat ? 'Guardar cambios' : 'Crear categoría'}</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    modal.querySelector('#catName').focus();
    modal.querySelector('#catForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modal.querySelector('#catName').value.trim();
      const desc = modal.querySelector('#catDesc').value.trim();
      if (!name) { showToast('El nombre es requerido', 'error'); return; }
      if (cat) { CategoryDB.update(cat.id, { name, description: desc }); showToast('Categoría actualizada ✓', 'success'); }
      else      { CategoryDB.add({ name, description: desc });             showToast('Categoría creada ✓', 'success'); }
      modal.remove();
      this._renderLayout();
    });
  }

  /* ========== EVENT MODAL ========== */
  _openEventModal(event = null) {
    const cats   = CategoryDB.getAll();
    const cities = CITIES;
    const modal  = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:620px">
        <div class="modal-header">
          <h2 class="modal-title">${event ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button class="modal-close">✕</button>
        </div>
        <form id="eventForm" style="display:flex;flex-direction:column;gap:.9rem">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.9rem">
            <div class="form-group">
              <label>Código</label>
              <input class="input" id="evCode" placeholder="CC-001" value="${event?.code || ''}" required/>
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <select class="select" id="evCat">
                <option value="">Seleccionar...</option>
                ${cats.map(c => `<option value="${c.id}" ${event?.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Nombre del evento</label>
            <input class="input" id="evName" placeholder="Nombre del concierto" value="${event?.name || ''}" required/>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.9rem">
            <div class="form-group">
              <label>Precio (GTQ)</label>
              <input class="input" id="evPrice" type="number" min="0" placeholder="500" value="${event?.price || ''}" required/>
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input class="input" id="evDate" type="date" value="${event?.date || ''}" required/>
            </div>
            <div class="form-group">
              <label>Hora</label>
              <input class="input" id="evTime" type="time" value="${event?.time || ''}" required/>
            </div>
          </div>
          <div class="form-group">
            <label>Ciudad</label>
            <select class="select" id="evCity">
              <option value="">Seleccionar...</option>
              ${cities.map(c => `<option value="${c}" ${event?.city === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>URL de imagen</label>
            <input class="input" id="evImage" type="url" placeholder="https://..." value="${event?.image || ''}"/>
          </div>
          <!-- Preview de imagen -->
          ${event?.image ? `<img src="${event.image}" style="width:100%;height:140px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--border)" onerror="this.style.display='none'" id="imgPreview"/>` : '<div id="imgPreview"></div>'}
          <div class="form-group">
            <label>Descripción</label>
            <textarea class="textarea" id="evDesc" placeholder="Descripción del evento...">${event?.description || ''}</textarea>
          </div>
          <div style="display:flex;gap:.6rem;justify-content:flex-end;padding-top:.3rem">
            <button type="button" class="btn btn-ghost modal-close">Cancelar</button>
            <button type="submit" class="btn btn-primary">${event ? 'Guardar cambios' : 'Crear evento'}</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Preview de imagen al escribir URL
    modal.querySelector('#evImage').addEventListener('input', (e) => {
      const preview = modal.querySelector('#imgPreview');
      const url = e.target.value.trim();
      if (url) {
        preview.innerHTML = `<img src="${url}" style="width:100%;height:140px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--border);margin-top:.3rem" onerror="this.style.display='none'"/>`;
      } else {
        preview.innerHTML = '';
      }
    });

    modal.querySelector('#eventForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const code  = modal.querySelector('#evCode').value.trim();
      const name  = modal.querySelector('#evName').value.trim();
      const catId = modal.querySelector('#evCat').value;
      const price = Number(modal.querySelector('#evPrice').value);
      const date  = modal.querySelector('#evDate').value;
      const time  = modal.querySelector('#evTime').value;
      const city  = modal.querySelector('#evCity').value;
      const image = modal.querySelector('#evImage').value.trim();
      const desc  = modal.querySelector('#evDesc').value.trim();

      if (!code || !name || !price || !date || !time || !city) { showToast('Completa todos los campos requeridos', 'error'); return; }

      const data = { code, name, categoryId: catId, price, date, time, city, image, description: desc };
      if (event) { EventDB.update(event.id, data); showToast('Evento actualizado ✓', 'success'); }
      else        { EventDB.add(data);               showToast('Evento creado ✓', 'success'); }
      modal.remove();
      this._renderLayout();
    });
  }

  /* ========== SALE DETAIL MODAL ========== */
  _openSaleDetail(id) {
    const sale = SaleDB.getById(id);
    if (!sale) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:560px">
        <div class="modal-header">
          <h2 class="modal-title">Venta <span style="color:var(--accent)">#${sale.id.slice(-5).toUpperCase()}</span></h2>
          <button class="modal-close">✕</button>
        </div>

        <h3 style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-dim);margin-bottom:.8rem">Datos del cliente</h3>
        <div class="sale-detail-grid">
          <div class="detail-field"><label>Identificación</label><span>${sale.customer?.id || '—'}</span></div>
          <div class="detail-field"><label>Nombre</label><span>${sale.customer?.name || '—'}</span></div>
          <div class="detail-field"><label>Email</label><span>${sale.customer?.email || '—'}</span></div>
          <div class="detail-field"><label>Teléfono</label><span>${sale.customer?.phone || '—'}</span></div>
          <div class="detail-field"><label>Dirección</label><span>${sale.customer?.address || '—'}</span></div>
          <div class="detail-field"><label>Fecha de compra</label><span>${new Date(sale.date).toLocaleString('es-GT')}</span></div>
        </div>

        <h3 style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-dim);margin:1.2rem 0 .8rem">Eventos comprados</h3>
        <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.2rem">
          ${(sale.items || []).map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;background:var(--bg3);border-radius:var(--radius);border:1px solid var(--border)">
              <div>
                <span style="font-weight:600;font-size:.9rem">${item.name}</span>
                <div style="font-size:.74rem;color:var(--text-dim);margin-top:.2rem">${item.city} · ${item.qty || 1} ticket${(item.qty || 1) !== 1 ? 's' : ''}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.74rem;color:var(--text-dim)">${formatPrice(item.price)} × ${item.qty || 1}</div>
                <div style="font-family:var(--font-disp);color:var(--accent)">${formatPrice(item.subtotal || item.price)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.1rem;background:var(--accent);border-radius:var(--radius)">
          <span style="font-weight:700;color:#fff;font-size:.9rem">TOTAL PAGADO</span>
          <span style="font-family:var(--font-disp);font-size:1.6rem;color:#fff">${formatPrice(sale.total)}</span>
        </div>

        <div style="display:flex;justify-content:flex-end;margin-top:1.2rem">
          <button class="btn btn-ghost modal-close">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => modal.remove()));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }
}
customElements.define('cc-admin-app', CCAdminApp);
