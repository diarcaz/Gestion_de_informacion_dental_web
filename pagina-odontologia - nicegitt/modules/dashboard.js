// ============================================
// DASHBOARD MODULE
// ============================================

import db from '../database/db.js';

class DashboardModule {
    render() {
        const stats = db.getStats();
        const todayAppointments = db.getTodayAppointments();
        const lowStockItems = db.getLowStockItems();
        const recentPatients = db.getPatients().slice(-5).reverse();

        return `
      <div class="page-header">
        <h2>🏥 Dashboard - Clínica Dental</h2>
        <p>Bienvenido al sistema de gestión de tu consultorio</p>
      </div>

      ${this.renderStats(stats)}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        ${this.renderTodayAppointments(todayAppointments)}
        ${this.renderLowStockAlerts(lowStockItems)}
      </div>

      ${this.renderRecentPatients(recentPatients)}
    `;
    }

    renderStats(stats) {
        return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--gradient-primary);">👥</div>
          <div class="stat-content">
            <h3>${stats.totalPatients}</h3>
            <p>Pacientes Registrados</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: var(--gradient-mint);">📅</div>
          <div class="stat-content">
            <h3>${stats.todayAppointments}</h3>
            <p>Citas de Hoy</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #F6AD55 0%, #ED8936 100%);">⏳</div>
          <div class="stat-content">
            <h3>${stats.pendingAppointments}</h3>
            <p>Citas Pendientes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);">💰</div>
          <div class="stat-content">
            <h3>$${stats.totalInventoryValue.toFixed(2)}</h3>
            <p>Valor del Inventario</p>
          </div>
        </div>
      </div>
    `;
    }

    renderTodayAppointments(appointments) {
        return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📅 Citas de Hoy</h3>
          <button class="btn btn-sm btn-primary" onclick="app.navigateTo('appointments')">
            Ver Todas
          </button>
        </div>
        <div class="card-body">
          ${appointments.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📅</div>
              <h4>No hay citas programadas para hoy</h4>
              <p style="margin-bottom: 0;">Disfruta de un día tranquilo</p>
            </div>
          ` : `
            <div style="max-height: 400px; overflow-y: auto;">
              ${appointments.sort((a, b) => a.time.localeCompare(b.time)).map(apt => `
                <div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">
                  <div class="flex-between mb-2">
                    <strong style="color: var(--primary-blue); font-size: 1.1rem;">${apt.time}</strong>
                    <span class="badge badge-${apt.status === 'confirmed' ? 'success' : 'warning'}">
                      ${apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                  <div>
                    <strong>Paciente:</strong> ${apt.patientName}<br>
                    <strong>Tratamiento:</strong> ${apt.treatment}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
    }

    renderLowStockAlerts(lowStockItems) {
        return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">⚠️ Alertas de Inventario</h3>
          <button class="btn btn-sm btn-warning" onclick="app.navigateTo('inventory')">
            Ver Inventario
          </button>
        </div>
        <div class="card-body">
          ${lowStockItems.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">✓</div>
              <h4>Todo en orden</h4>
              <p style="margin-bottom: 0;">No hay productos con stock bajo</p>
            </div>
          ` : `
            <div style="max-height: 400px; overflow-y: auto;">
              ${lowStockItems.map(item => `
                <div class="card" style="margin-bottom: 0.75rem; padding: 1rem; border-left: 4px solid var(--warning);">
                  <div class="flex-between">
                    <div>
                      <strong style="color: var(--primary-blue);">${item.name}</strong><br>
                      <small style="color: var(--text-secondary);">${item.category}</small>
                    </div>
                    <div style="text-align: right;">
                      <strong style="color: var(--warning);">${item.quantity} ${item.unit}</strong><br>
                      <small style="color: var(--text-secondary);">Min: ${item.minStock}</small>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
    }

    renderRecentPatients(patients) {
        return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">👥 Pacientes Recientes</h3>
          <button class="btn btn-sm btn-primary" onclick="app.navigateTo('patients')">
            Ver Todos
          </button>
        </div>
        <div class="card-body">
          ${patients.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">👥</div>
              <h4>No hay pacientes registrados</h4>
              <p style="margin-bottom: 0;">Comienza agregando tu primer paciente</p>
            </div>
          ` : `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Última Visita</th>
                  </tr>
                </thead>
                <tbody>
                  ${patients.map(patient => `
                    <tr>
                      <td><strong>${patient.name}</strong></td>
                      <td>${patient.phone}</td>
                      <td>${patient.email}</td>
                      <td>${patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-MX') : 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
    }
}

const dashboardModule = new DashboardModule();
window.dashboardModule = dashboardModule;
export default dashboardModule;
