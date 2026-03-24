# 🎵 Proyecto Conciertos Conectados

Plataforma web para la gestión y venta de entradas a conciertos y eventos en vivo en Guatemala.

---

## 👤 Autor

**Jeshua Pérez**

---

## 📁 Estructura del proyecto
```
Proyecto_Conciertos_Pérez_Jeshua/
├── index.html          # Vista pública (clientes)
├── admin.html          # Panel de administración
├── styles/
│   ├── style.css       # Estilos globales
│   └── admin.css       # Estilos del panel admin
└── js/
    ├── storage.js      # Wrapper de localStorage
    ├── data.js         # Capa de datos + seed inicial
    ├── toast.js        # Sistema de notificaciones
    ├── cart.js         # Carrito de compras
    ├── event-card.js   # Tarjeta de evento
    ├── event-detail.js # Modal de detalle de evento
    ├── client-app.js   # Aplicación pública (cliente)
    └── admin-app.js    # Panel de administración
```

---

## 🚀 Cómo ejecutar

1. Clona o descarga el repositorio
2. Abre `index.html` en un navegador moderno (Chrome, Firefox, Edge)
3. Para el panel admin, navega a `admin.html`

> ⚠️ No requiere servidor ni instalación. Usa `localStorage` del navegador para persistencia de datos.

---

## 🔐 Acceso Admin

| Campo      | Valor          |
|------------|----------------|
| Email      | admin@mail.com |
| Contraseña | 123456         |

---

## ✨ Funcionalidades

### 🛍 Vista Clientes (`index.html`)
- Buscador en tiempo real por nombre de evento
- Filtro por ciudad
- Filtro por categoría
- Ordenamiento por fecha, precio y nombre
- Tarjetas de evento con imagen, precio, fecha y ciudad
- Sección de próximos eventos destacados
- Modal de detalle del evento
- Carrito de compras flotante con contador de tickets
- Proceso de compra con formulario del cliente
- Confirmación de compra con número de boleta
- Suscripción a newsletter

### ⚙️ Panel Admin (`admin.html`)
- Login con validación de credenciales
- Dashboard con estadísticas (eventos, ventas, ingresos, tickets vendidos)
- Top ciudades por ingresos
- **Categorías**: CRUD completo
- **Eventos**: CRUD completo con preview de imagen
- **Ventas**: listado con búsqueda + detalle completo de cada venta

---

## 🧩 Web Components

| Componente      | Tag HTML            | Descripción                      |
|-----------------|---------------------|----------------------------------|
| App Cliente     | `<cc-client-app>`   | Aplicación pública completa      |
| App Admin       | `<cc-admin-app>`    | Panel de administración completo |
| Tarjeta evento  | `<cc-event-card>`   | Tarjeta individual de evento     |
| Detalle evento  | `<cc-event-detail>` | Modal con info completa          |
| Carrito         | `<cc-cart>`         | Carrito flotante + checkout      |
| Notificaciones  | `<cc-toast>`        | Sistema de toasts                |

---

## 💾 Persistencia (localStorage)

| Clave           | Contenido             |
|-----------------|-----------------------|
| `cc_categories` | Lista de categorías   |
| `cc_events`     | Lista de eventos      |
| `cc_sales`      | Historial de ventas   |
| `cc_cart`       | Carrito actual        |

---

## 🎨 Stack tecnológico

- **HTML5** semántico
- **CSS3** con variables CSS, Grid, Flexbox y animaciones
- **JavaScript ES6+** vanilla (sin frameworks)
- **Web Components** con Custom Elements API
- **localStorage** para persistencia de datos
- **Google Fonts**: Bebas Neue + DM Sans

---

## 🏙 Ciudades disponibles

- Ciudad de Guatemala
- Quetzaltenango (Xela)
- Antigua Guatemala
- Mazatenango
- Cobán
- Fórum Majadas

---

## 📝 Conventional Commits

El proyecto sigue la convención **Conventional Commits**:
```
feat: add cart component
fix: correct price formatting
style: update hero section design
docs: update README
refactor: extract storage utility
```