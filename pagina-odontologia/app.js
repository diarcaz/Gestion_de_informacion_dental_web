// ============================================
// MAIN APPLICATION
// ============================================

import db from './database/db.js?v=2';
import dashboardModule from './modules/dashboard.js?v=2';
import patientsModule from './modules/patients.js?v=2';
import appointmentsModule from './modules/appointments.js?v=2';
import inventoryModule from './modules/inventory.js?v=2';

class DentalApp {
  constructor() {
    this.currentModule = 'dashboard';
    this.modules = {
      dashboard: dashboardModule,
      patients: patientsModule,
      appointments: appointmentsModule,
      inventory: inventoryModule
    };
    this.sidebarOpen = window.innerWidth > 1024;
  }

  init() {
    this.renderLayout();

    // Use setTimeout to ensure DOM is updated before rendering module
    setTimeout(() => {
      this.renderCurrentModule();
    }, 0);

    this.setupEventListeners();

    // Initialize database
    db.init();
  }

  renderLayout() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="app-container">
        <button class="menu-toggle" onclick="app.toggleSidebar()">
          ☰
        </button>

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
          </nav>
        </aside>

        <main class="main-content" id="main-content">
          <!-- Content will be rendered here -->
        </main>
      </div>
    `;
  }

  renderCurrentModule() {
    const mainContent = document.getElementById('main-content');
    const module = this.modules[this.currentModule];

    if (mainContent && module) {
      mainContent.innerHTML = module.render();

      // Call afterRender if the module has it
      if (module.afterRender) {
        module.afterRender();
      }
    }

    // Update active nav item without re-rendering entire layout
    this.updateNavItems();
  }

  updateNavItems() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
      const modules = ['dashboard', 'patients', 'appointments', 'inventory'];
      if (index < modules.length) {
        if (modules[index] === this.currentModule) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      }
    });
  }

  navigateTo(moduleName) {
    if (this.modules[moduleName]) {
      this.currentModule = moduleName;
      this.renderCurrentModule();

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 1024) {
        this.sidebarOpen = false;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
      }
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.querySelector('.sidebar');
    if (this.sidebarOpen) {
      sidebar.classList.add('active');
    } else {
      sidebar.classList.remove('active');
    }
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        this.sidebarOpen = true;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.add('active');
      }
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && this.sidebarOpen) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');

        if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          this.sidebarOpen = false;
          sidebar.classList.remove('active');
        }
      }
    });
  }

  exportData() {
    db.exportData();
    if (window.notify) {
      window.notify.success('Datos exportados exitosamente');
    }
  }

  showAbout() {
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
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new DentalApp();
  window.app.init();
});

export default DentalApp;
