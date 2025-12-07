// ============================================
// MAIN APPLICATION - SIMPLIFIED VERSION
// ============================================

import db from './database/db.js?v=7';
import Auth, { ROLES } from './modules/auth.js?v=9';
import dashboardModule from './modules/dashboard.js?v=7';
import patientsModule from './modules/patients.js?v=7';
import appointmentsModule from './modules/appointments.js?v=7';
import inventoryModule from './modules/inventory.js?v=7';
import treatmentsModule from './modules/treatments.js?v=7';

console.log('[APP.JS] All imports loaded successfully!');

// Create app object with all methods
const app = {
  Auth: Auth, // Make Auth accessible as a property
  currentModule: 'dashboard',
  modules: {
    dashboard: dashboardModule,
    patients: patientsModule,
    appointments: appointmentsModule,
    inventory: inventoryModule,
    treatments: treatmentsModule
  },
  sidebarOpen: window.innerWidth > 1024,

  init: function () {
    console.log('App Initializing...');
    this.Auth.init();

    if (this.Auth.isLoggedIn()) {
      this.showApp();
    } else {
      this.showLogin();
    }

    this.setupEventListeners();
    this.setupLoginListeners();
    console.log('App Init Complete');
  },

  showApp: function () {
    console.log('Showing App...');
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app');

    if (loginContainer) loginContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';

    this.renderLayout();
    this.updateUserUI();

    setTimeout(() => {
      this.renderCurrentModule();
    }, 0);

    if (db) {
      db.init();
      db.migrateData();
    }
  },

  showLogin: function () {
    console.log('Showing Login...');
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app');

    if (loginContainer) loginContainer.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
  },

  renderLayout: function () {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    appEl.innerHTML = `
      <div class="app-container">
        <button class="menu-toggle" onclick="app.toggleSidebar()">☰</button>

        <aside class="sidebar ${this.sidebarOpen ? 'active' : ''}">
          <div class="sidebar-header">
            <div class="clinic-icon">🦷</div>
            <h1>Clínica Dental</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">Sistema de Gestión</p>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-item ${this.currentModule === 'dashboard' ? 'active' : ''}" onclick="app.navigateTo('dashboard')">
              <span class="nav-item-icon">🏥</span>
              <span>Dashboard</span>
            </div>
            <div class="nav-item ${this.currentModule === 'patients' ? 'active' : ''}" onclick="app.navigateTo('patients')">
              <span class="nav-item-icon">👥</span>
              <span>Pacientes</span>
            </div>
            <div class="nav-item ${this.currentModule === 'appointments' ? 'active' : ''}" onclick="app.navigateTo('appointments')">
              <span class="nav-item-icon">📅</span>
              <span>Citas</span>
            </div>
            <div class="nav-item ${this.currentModule === 'treatments' ? 'active' : ''}" onclick="app.navigateTo('treatments')">
              <span class="nav-item-icon">🩺</span>
              <span>Tratamientos</span>
            </div>
            <div class="nav-item ${this.currentModule === 'inventory' ? 'active' : ''}" onclick="app.navigateTo('inventory')">
              <span class="nav-item-icon">📦</span>
              <span>Inventario</span>
            </div>

            <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--light-gray);">

            <div class="nav-item" onclick="app.exportData()">
              <span class="nav-item-icon">💾</span>
              <span>Exportar Datos</span>
            </div>
            <div class="nav-item" onclick="app.showAbout()">
              <span class="nav-item-icon">ℹ️</span>
              <span>Acerca de</span>
            </div>
            <div class="nav-item" onclick="app.logout()" style="margin-top: auto; color: #ffcccc;">
              <span class="nav-item-icon">🚪</span>
              <span>Cerrar Sesión</span>
            </div>
          </nav>
        </aside>

        <main class="main-content" id="main-content">
          <!-- Content will be rendered here -->
        </main>
      </div>
    `;
  },

  renderCurrentModule: function () {
    const mainContent = document.getElementById('main-content');
    const module = this.modules[this.currentModule];

    if (mainContent && module) {
      mainContent.innerHTML = module.render();
      if (module.afterRender) {
        module.afterRender();
      }
    }
    this.updateNavItems();
  },

  updateNavItems: function () {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
      const modules = ['dashboard', 'patients', 'appointments', 'treatments', 'inventory'];
      if (index < modules.length) {
        if (modules[index] === this.currentModule) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      }
    });
  },

  navigateTo: function (moduleName) {
    if (this.modules[moduleName]) {
      this.currentModule = moduleName;
      this.renderCurrentModule();

      if (window.innerWidth <= 1024) {
        this.sidebarOpen = false;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
      }
    }
  },

  toggleSidebar: function () {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.querySelector('.sidebar');
    if (this.sidebarOpen) {
      sidebar.classList.add('active');
    } else {
      sidebar.classList.remove('active');
    }
  },

  setupEventListeners: function () {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        this.sidebarOpen = true;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.add('active');
      } else {
        this.sidebarOpen = false;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && this.sidebarOpen) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');

        if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
          this.sidebarOpen = false;
          sidebar.classList.remove('active');
        }
      }
    });
  },

  setupLoginListeners: function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    if (showRegisterLink && showLoginLink) {
      showRegisterLink.onclick = (e) => {
        e.preventDefault();
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
      };

      showLoginLink.onclick = (e) => {
        e.preventDefault();
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
      };
    }

    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        console.log('Login Submitted');
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const result = await this.Auth.login(username, password);
        console.log('Login Result:', result);

        if (result.success) {
          this.showApp();
          if (window.notify) window.notify.success(`Bienvenido, ${this.Auth.currentUser.name}`);
        } else {
          alert(result.message);
        }
      };
    }

    if (registerForm) {
      registerForm.onsubmit = async (e) => {
        e.preventDefault();
        console.log('Register Submitted');
        const name = document.getElementById('reg-name').value;
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
          alert('Las contraseñas no coinciden');
          return;
        }

        const result = await this.Auth.register({
          name,
          username,
          password
        });

        if (result.success) {
          alert('Registro exitoso. Por favor inicia sesión.');
          registerForm.reset();
          registerForm.style.display = 'none';
          loginForm.style.display = 'block';
        } else {
          alert(result.message);
        }
      };
    }
  },

  changePassword: function () {
    const user = this.Auth.getUser();
    if (!user) return;

    if (window.modal) {
      window.modal.form(`Cambiar Contraseña - ${user.username}`, [
        { name: 'currentPassword', label: 'Contraseña Actual', type: 'password', required: true },
        { name: 'newPassword', label: 'Nueva Contraseña', type: 'password', required: true },
        { name: 'confirmNewPassword', label: 'Confirmar Nueva', type: 'password', required: true }
      ], (data) => {
        if (data.currentPassword !== user.password) {
          if (window.notify) window.notify.error('La contraseña actual es incorrecta');
          return;
        }
        if (data.newPassword !== data.confirmNewPassword) {
          if (window.notify) window.notify.error('Las nuevas contraseñas no coinciden');
          return;
        }

        const result = this.Auth.updatePassword(user.username, data.newPassword);
        if (result.success) {
          if (window.notify) window.notify.success('Contraseña actualizada exitosamente');
          window.modal.close();
        } else {
          if (window.notify) window.notify.error(result.message);
        }
      });
    }
  },

  logout: function () {
    if (confirm('¿Cerrar sesión?')) {
      this.Auth.logout();
    }
  },

  updateUserUI: function () {
    const user = this.Auth.getUser();
    if (user) {
      const header = document.querySelector('.sidebar-header');
      if (header) {
        let userInfo = document.getElementById('user-info-display');
        if (!userInfo) {
          userInfo = document.createElement('div');
          userInfo.id = 'user-info-display';
          userInfo.style.marginTop = '1rem';
          userInfo.style.padding = '0.5rem';
          userInfo.style.background = 'rgba(255,255,255,0.1)';
          userInfo.style.borderRadius = 'var(--radius-md)';
          header.appendChild(userInfo);
        }

        userInfo.innerHTML = `
          <div style="font-size: 0.9rem; font-weight: 600;">${user.name}</div>
          <div style="font-size: 0.8rem; opacity: 0.8; text-transform: capitalize;">${user.role === ROLES.ADMIN ? 'Odontólogo' : 'Recepción'}</div>
          <button onclick="window.app.changePassword()" style="
              margin-top: 0.5rem;
              background: rgba(255,255,255,0.2);
              border: none;
              color: white;
              padding: 0.2rem 0.5rem;
              border-radius: 4px;
              font-size: 0.75rem;
              cursor: pointer;
              width: 100%;
          ">🔑 Cambiar Contraseña</button>
        `;
      }
    }
  },

  showAbout: function () {
    if (window.modal) {
      window.modal.create(
        'Acerca del Sistema',
        `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🦷</div>
            <h3 style="color: var(--primary-blue); margin-bottom: 1rem;">Sistema de Gestión Dental</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
              Versión 2.0.0 - Con Historial Clínico Completo
            </p>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
              Sistema completo para la administración de consultorios dentales, 
              incluyendo gestión de pacientes con historial médico completo, citas e inventario con tracking.
            </p>
            <hr style="margin: 1.5rem 0;">
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              <strong>Características:</strong><br>
              ✓ Gestión de pacientes con historial clínico completo<br>
              ✓ Alergias, enfermedades crónicas y medicamentos<br>
              ✓ Contacto de emergencia<br>
              ✓ Calendario de citas interactivo<br>
              ✓ Control de inventario con tracking de movimientos<br>
              ✓ Reportes mensuales de consumo<br>
              ✓ Predicciones de reabastecimiento<br>
              ✓ Diseño responsive para móviles<br>
              ✓ Almacenamiento local de datos<br>
              ✓ Exportación de datos
            </p>
          </div>
        `,
        [{ text: 'Cerrar', class: 'btn-primary' }]
      );
    }
  },

  exportData: function () {
    if (this.Auth.canExportData()) {
      const data = {
        users: this.Auth.users,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dental_data_backup.json';
      a.click();
    } else {
      alert('No tienes permisos para exportar datos');
    }
  },

  logout: function () {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.Auth.logout();
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Ready, Initializing App...');
  try {
    window.app = app;
    window.app.init();
    console.log('Window.app initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('Error al iniciar la aplicación. Por favor recarga la página.');
  }
});

export default app;
