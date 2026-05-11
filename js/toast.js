/* =============================================
   TOAST — Sistema de notificaciones
   ============================================= */

const TOAST_COLORS = {
  success: { bg: '#111', border: '#3ddc84', icon: '✓', iconColor: '#3ddc84' },
  error:   { bg: '#111', border: '#e01010', icon: '✕', iconColor: '#e01010' },
  info:    { bg: '#111', border: '#888',    icon: 'i', iconColor: '#aaa'    },
  warning: { bg: '#111', border: '#f5a623', icon: '⚠', iconColor: '#f5a623' },
};

function showToast(message, type = 'success', duration = 3200) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const c = TOAST_COLORS[type] || TOAST_COLORS.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex; align-items: center; gap: .65rem;
    padding: .8rem 1.1rem;
    background: ${c.bg};
    border: 1px solid ${c.border};
    border-left: 4px solid ${c.border};
    border-radius: 10px;
    color: #f0f0f0;
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem; font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,.6);
    pointer-events: all;
    min-width: 260px; max-width: 360px;
    animation: toastIn .25s cubic-bezier(.4,0,.2,1);
    cursor: pointer;
  `;

  const icon = document.createElement('span');
  icon.textContent = c.icon;
  icon.style.cssText = `
    width: 22px; height: 22px; border-radius: 50%;
    background: ${c.border}18;
    color: ${c.iconColor};
    display: flex; align-items: center; justify-content: center;
    font-size: .78rem; font-weight: 900; flex-shrink: 0;
    border: 1px solid ${c.border}44;
  `;

  const msg = document.createElement('span');
  msg.textContent = message;
  msg.style.flex = '1';

  toast.appendChild(icon);
  toast.appendChild(msg);
  container.appendChild(toast);

  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = `
      @keyframes toastIn  { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes toastOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(40px); opacity: 0; } }
    `;
    document.head.appendChild(s);
  }

  const dismiss = () => {
    toast.style.animation = 'toastOut .22s ease forwards';
    setTimeout(() => toast.remove(), 220);
  };
  toast.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}
