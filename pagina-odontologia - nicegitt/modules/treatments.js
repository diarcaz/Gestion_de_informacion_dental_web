// ============================================
// TREATMENTS MODULE
// ============================================

import db from '../database/db.js';
import notify from '../components/notifications.js';
import modal from '../components/modal.js';

class TreatmentsModule {
    constructor() {
        this.filter = 'all'; // all, pending, paid
        this.searchQuery = '';
    }

    render() {
        const treatments = this.getFilteredTreatments();

        return `
      <div class="page-header">
        <h2>🩺 Gestión de Tratamientos</h2>
        <p>Administra todos los tratamientos, pagos y trabajos realizados</p>
      </div>

      <div class="card mb-3">
        <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 1rem;">
          <div class="search-bar" style="flex: 1; max-width: 400px;">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              id="treatment-search-input"
              class="search-input" 
              placeholder="Buscar por paciente, tratamiento o dentista..."
              value="${this.searchQuery}"
            >
          </div>
          
          <div class="filter-buttons">
            <button class="btn ${this.filter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="treatmentsModule.setFilter('all')">
              Todos
            </button>
            <button class="btn ${this.filter === 'pending' ? 'btn-warning' : 'btn-outline'}" onclick="treatmentsModule.setFilter('pending')">
              💰 Pendientes
            </button>
            <button class="btn ${this.filter === 'paid' ? 'btn-success' : 'btn-outline'}" onclick="treatmentsModule.setFilter('paid')">
              ✅ Pagados
            </button>
          </div>
        </div>

        <div id="treatments-table-container">
          ${treatments.length === 0 ? this.renderEmptyState() : this.renderTable(treatments)}
        </div>
      </div>
    `;
    }

    afterRender() {
        const searchInput = document.getElementById('treatment-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.search(e.target.value);
            });
        }
    }

    getFilteredTreatments() {
        const patients = db.getPatients();
        let allTreatments = [];

        // Flatten treatments from all patients
        patients.forEach(patient => {
            const patientTreatments = db.getTreatments(patient.id) || [];
            patientTreatments.forEach(t => {
                allTreatments.push({
                    ...t,
                    patientId: patient.id,
                    patientName: patient.name
                });
            });
        });

        // Sort by date descending
        allTreatments.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Filter by Search Query
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            allTreatments = allTreatments.filter(t =>
                t.patientName.toLowerCase().includes(q) ||
                t.treatment.toLowerCase().includes(q) ||
                (t.dentist && t.dentist.toLowerCase().includes(q))
            );
        }

        // Filter by Status
        if (this.filter === 'pending') {
            allTreatments = allTreatments.filter(t => !t.paid);
        } else if (this.filter === 'paid') {
            allTreatments = allTreatments.filter(t => t.paid);
        }

        return allTreatments;
    }

    renderEmptyState() {
        return `
      <div class="empty-state">
        <div class="empty-state-icon">🩺</div>
        <h3>No hay tratamientos encontrados</h3>
        <p>Intenta cambiar los filtros o agrega tratamientos desde el expediente de un paciente.</p>
      </div>
    `;
    }

    renderTable(treatments) {
        // Calculate totals
        const totalCost = treatments.reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0);
        const pendingCost = treatments.reduce((sum, t) => sum + (t.paid ? 0 : (parseFloat(t.cost) || 0)), 0);

        return `
      <div class="table-container">
        <div style="margin-bottom: 1rem; padding: 1rem; background: var(--off-white); border-radius: 8px; display: flex; gap: 2rem;">
          <div>
            <strong style="color: var(--text-secondary);">Total en lista:</strong>
            <span style="font-size: 1.2rem; display: block;">$${totalCost.toFixed(2)}</span>
          </div>
          <div>
            <strong style="color: var(--danger);">Pendiente de cobro:</strong>
            <span style="font-size: 1.2rem; display: block; color: var(--danger);">$${pendingCost.toFixed(2)}</span>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Tratamiento</th>
              <th>Dentista</th>
              <th>Costo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${treatments.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString('es-MX')}</td>
                <td>
                  <a href="#" onclick="window.patientsModule.viewPatient('${t.patientId}')" style="color: var(--primary-blue); text-decoration: none; font-weight: 500;">
                    ${t.patientName}
                  </a>
                </td>
                <td>${t.treatment}</td>
                <td>${t.dentist || '-'}</td>
                <td>$${t.cost.toFixed(2)}</td>
                <td>
                  <span class="badge badge-${t.paid ? 'success' : 'warning'}" style="cursor: pointer;" onclick="treatmentsModule.togglePayment('${t.patientId}', '${t.id}')">
                    ${t.paid ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn action-btn-delete" onclick="treatmentsModule.deleteTreatment('${t.patientId}', '${t.id}')" title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    }

    setFilter(filter) {
        this.filter = filter;
        this.refresh();
    }

    search(query) {
        this.searchQuery = query;
        this.refresh();
    }

    refresh() {
        const container = document.getElementById('treatments-table-container');
        if (container) {
            const treatments = this.getFilteredTreatments();
            container.innerHTML = treatments.length === 0 ? this.renderEmptyState() : this.renderTable(treatments);
        }
    }

    togglePayment(patientId, treatmentId) {
        const patient = db.getPatientById(patientId);
        if (!patient) return;

        const treatments = db.getTreatments(patientId);
        const treatment = treatments.find(t => t.id === treatmentId);

        if (treatment) {
            // Toggle local state for immediate feedback/logic (not strictly needed since we re-fetch)
            treatment.paid = !treatment.paid;

            // Perform update
            this.runToggle(patient, treatment);
        }
    }

    runToggle(patient, treatment) {
        db.updateTreatmentStatus(patient.id, treatment.id, treatment.paid);
        notify.success(`Estado actualizado a: ${treatment.paid ? 'Pagado' : 'Pendiente'}`);
        this.refresh();
    }

    deleteTreatment(patientId, treatmentId) {
        modal.confirm(
            'Eliminar Tratamiento',
            '¿Estás seguro? Esta acción no se puede deshacer.',
            () => {
                db.deleteTreatment(patientId, treatmentId);
                notify.success('Tratamiento eliminado');
                this.refresh();
            }
        );
    }
}

const treatmentsModule = new TreatmentsModule();
window.treatmentsModule = treatmentsModule;
export default treatmentsModule;
