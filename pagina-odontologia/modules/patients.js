// ============================================
// PATIENTS MODULE - ENHANCED
// ============================================

import db from '../database/db.js';
import modal from '../components/modal.js';
import notify from '../components/notifications.js';

class PatientsModule {
  constructor() {
    this.searchQuery = '';
  }

  // Helper function to format date without UTC offset issues
  formatLocalDateShort(dateString) {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX');
  }

  render() {
    const patients = this.searchQuery
      ? db.searchPatients(this.searchQuery)
      : db.getPatients();

    return `
      <div class="page-header">
        <h2>👥 Gestión de Pacientes</h2>
        <p>Administra la información y historial clínico de tus pacientes</p>
      </div>

      <div class="card mb-3">
        <div class="flex-between mb-3">
          <div class="search-bar" style="flex: 1; max-width: 500px;">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              id="patient-search-input"
              class="search-input" 
              placeholder="Buscar por nombre, ID, email, teléfono, dirección o tipo de sangre..."
              value="${this.searchQuery}"
            >
          </div>
          <button class="btn btn-primary" onclick="patientsModule.showAddForm()">
            ➕ Nuevo Paciente
          </button>
        </div>

        <div id="patients-table-container">
          ${patients.length === 0 ? this.renderEmptyState() : this.renderTable(patients)}
        </div>
      </div>
    `;
  }

  afterRender() {
    // Setup search input listener after render
    const searchInput = document.getElementById('patient-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.search(e.target.value);
      });
    }
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <h3>No hay pacientes registrados</h3>
        <p>Comienza agregando tu primer paciente con su historial clínico completo</p>
        <button class="btn btn-primary mt-2" onclick="patientsModule.showAddForm()">
          ➕ Agregar Paciente
        </button>
      </div>
    `;
  }

  renderTable(patients) {
    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Edad</th>
              <th>Tipo de Sangre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Última Visita</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${patients.map(patient => `
              <tr>
                <td><strong>${patient.id}</strong></td>
                <td>${patient.name}</td>
                <td>${patient.age} años</td>
                <td>${patient.bloodType || 'N/A'}</td>
                <td>${patient.phone}</td>
                <td>${patient.email}</td>
                <td>${patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-MX') : 'N/A'}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn action-btn-view" onclick="patientsModule.viewPatient('${patient.id}')" title="Ver detalles">
                      👁️
                    </button>
                    <button class="action-btn action-btn-edit" onclick="patientsModule.showEditForm('${patient.id}')" title="Editar">
                      ✏️
                    </button>
                    <button class="action-btn action-btn-delete" onclick="patientsModule.deletePatient('${patient.id}')" title="Eliminar">
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

  search(query) {
    this.searchQuery = query;

    // Update only the table container without re-rendering entire module
    const container = document.getElementById('patients-table-container');
    if (container) {
      const patients = this.searchQuery
        ? db.searchPatients(this.searchQuery)
        : db.getPatients();

      container.innerHTML = patients.length === 0 ? this.renderEmptyState() : this.renderTable(patients);
    }
  }

  showAddForm() {
    modal.form('Nuevo Paciente - Información Completa', [
      { type: 'header', label: '📋 Información Personal' },
      { name: 'name', label: 'Nombre Completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
      { name: 'birthDate', label: 'Fecha de Nacimiento', type: 'date', required: true },
      { name: 'phone', label: 'Teléfono', type: 'tel', required: true, placeholder: '+52 555-1234' },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'ejemplo@email.com' },
      { name: 'address', label: 'Dirección Completa', type: 'text', placeholder: 'Calle, Número, Colonia, Ciudad' },
      {
        name: 'bloodType', label: 'Tipo de Sangre', type: 'select', options: [
          { value: '', label: 'Seleccionar...' },
          { value: 'A+', label: 'A+' },
          { value: 'A-', label: 'A-' },
          { value: 'B+', label: 'B+' },
          { value: 'B-', label: 'B-' },
          { value: 'AB+', label: 'AB+' },
          { value: 'AB-', label: 'AB-' },
          { value: 'O+', label: 'O+' },
          { value: 'O-', label: 'O-' }
        ]
      },
      { name: 'occupation', label: 'Ocupación', type: 'text', placeholder: 'Profesión o trabajo' },
      { name: 'insurance', label: 'Seguro Médico/Dental', type: 'text', placeholder: 'IMSS, Seguro Popular, Privado, etc.' },

      { type: 'header', label: '🚨 Contacto de Emergencia' },
      { name: 'emergencyName', label: 'Nombre del Contacto', type: 'text', placeholder: 'Nombre completo' },
      { name: 'emergencyPhone', label: 'Teléfono de Emergencia', type: 'tel', placeholder: '+52 555-5678' },
      { name: 'emergencyRelationship', label: 'Parentesco', type: 'text', placeholder: 'Esposo/a, Padre/Madre, Hijo/a, etc.' },

      { type: 'header', label: '🏥 Historial Clínico' },
      { name: 'allergies', label: 'Alergias', type: 'textarea', placeholder: 'Penicilina, Polen, Látex, etc. (separar con comas)' },
      { name: 'chronicDiseases', label: 'Enfermedades Crónicas', type: 'textarea', placeholder: 'Diabetes, Hipertensión, Asma, etc. (separar con comas)' },
      { name: 'currentMedications', label: 'Medicamentos Actuales', type: 'textarea', placeholder: 'Nombre y dosis (separar con comas)' },
      { name: 'previousSurgeries', label: 'Cirugías Previas', type: 'textarea', placeholder: 'Tipo de cirugía y año (separar con comas)' },
      { name: 'familyHistory', label: 'Antecedentes Familiares', type: 'textarea', placeholder: 'Enfermedades hereditarias en la familia' },
      { name: 'dentalHistory', label: 'Historial Dental', type: 'textarea', placeholder: 'Tratamientos dentales previos, ortodoncia, etc.' },
      { name: 'clinicalNotes', label: 'Notas Clínicas Adicionales', type: 'textarea', placeholder: 'Información relevante para tratamientos' }
    ], (data) => {
      // Calculate age from birthDate
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const patient = db.addPatient({
        name: data.name,
        birthDate: data.birthDate,
        age: age,
        phone: data.phone,
        email: data.email,
        address: data.address || '',
        bloodType: data.bloodType || '',
        occupation: data.occupation || '',
        insurance: data.insurance || '',
        emergencyContact: {
          name: data.emergencyName || '',
          phone: data.emergencyPhone || '',
          relationship: data.emergencyRelationship || ''
        },
        clinicalHistory: {
          allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
          chronicDiseases: data.chronicDiseases ? data.chronicDiseases.split(',').map(d => d.trim()).filter(d => d) : [],
          currentMedications: data.currentMedications ? data.currentMedications.split(',').map(m => m.trim()).filter(m => m) : [],
          previousSurgeries: data.previousSurgeries ? data.previousSurgeries.split(',').map(s => s.trim()).filter(s => s) : [],
          familyHistory: data.familyHistory || '',
          dentalHistory: data.dentalHistory || '',
          notes: data.clinicalNotes || ''
        }
      });

      notify.success(`Paciente ${patient.name} agregado exitosamente`);
      window.app.renderCurrentModule();
    });
  }

  showEditForm(id) {
    const patient = db.getPatientById(id);
    if (!patient) return;

    const clinicalHistory = patient.clinicalHistory || {};
    const emergencyContact = patient.emergencyContact || {};

    modal.form('Editar Paciente', [
      { type: 'header', label: '📋 Información Personal' },
      { name: 'name', label: 'Nombre Completo', type: 'text', required: true, value: patient.name },
      { name: 'birthDate', label: 'Fecha de Nacimiento', type: 'date', required: true, value: patient.birthDate || '' },
      { name: 'phone', label: 'Teléfono', type: 'tel', required: true, value: patient.phone },
      { name: 'email', label: 'Email', type: 'email', required: true, value: patient.email },
      { name: 'address', label: 'Dirección Completa', type: 'text', value: patient.address || '' },
      {
        name: 'bloodType', label: 'Tipo de Sangre', type: 'select', value: patient.bloodType || '', options: [
          { value: '', label: 'Seleccionar...' },
          { value: 'A+', label: 'A+' },
          { value: 'A-', label: 'A-' },
          { value: 'B+', label: 'B+' },
          { value: 'B-', label: 'B-' },
          { value: 'AB+', label: 'AB+' },
          { value: 'AB-', label: 'AB-' },
          { value: 'O+', label: 'O+' },
          { value: 'O-', label: 'O-' }
        ]
      },
      { name: 'occupation', label: 'Ocupación', type: 'text', value: patient.occupation || '' },
      { name: 'insurance', label: 'Seguro Médico/Dental', type: 'text', value: patient.insurance || '' },

      { type: 'header', label: '🚨 Contacto de Emergencia' },
      { name: 'emergencyName', label: 'Nombre del Contacto', type: 'text', value: emergencyContact.name || '' },
      { name: 'emergencyPhone', label: 'Teléfono de Emergencia', type: 'tel', value: emergencyContact.phone || '' },
      { name: 'emergencyRelationship', label: 'Parentesco', type: 'text', value: emergencyContact.relationship || '' },

      { type: 'header', label: '🏥 Historial Clínico' },
      { name: 'allergies', label: 'Alergias', type: 'textarea', value: (clinicalHistory.allergies || []).join(', ') },
      { name: 'chronicDiseases', label: 'Enfermedades Crónicas', type: 'textarea', value: (clinicalHistory.chronicDiseases || []).join(', ') },
      { name: 'currentMedications', label: 'Medicamentos Actuales', type: 'textarea', value: (clinicalHistory.currentMedications || []).join(', ') },
      { name: 'previousSurgeries', label: 'Cirugías Previas', type: 'textarea', value: (clinicalHistory.previousSurgeries || []).join(', ') },
      { name: 'familyHistory', label: 'Antecedentes Familiares', type: 'textarea', value: clinicalHistory.familyHistory || '' },
      { name: 'dentalHistory', label: 'Historial Dental', type: 'textarea', value: clinicalHistory.dentalHistory || '' },
      { name: 'clinicalNotes', label: 'Notas Clínicas Adicionales', type: 'textarea', value: clinicalHistory.notes || '' }
    ], (data) => {
      // Calculate age from birthDate
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      db.updatePatient(id, {
        name: data.name,
        birthDate: data.birthDate,
        age: age,
        phone: data.phone,
        email: data.email,
        address: data.address,
        bloodType: data.bloodType,
        occupation: data.occupation,
        insurance: data.insurance,
        emergencyContact: {
          name: data.emergencyName,
          phone: data.emergencyPhone,
          relationship: data.emergencyRelationship
        },
        clinicalHistory: {
          allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
          chronicDiseases: data.chronicDiseases ? data.chronicDiseases.split(',').map(d => d.trim()).filter(d => d) : [],
          currentMedications: data.currentMedications ? data.currentMedications.split(',').map(m => m.trim()).filter(m => m) : [],
          previousSurgeries: data.previousSurgeries ? data.previousSurgeries.split(',').map(s => s.trim()).filter(s => s) : [],
          familyHistory: data.familyHistory,
          dentalHistory: data.dentalHistory,
          notes: data.clinicalNotes
        }
      });

      notify.success('Paciente actualizado exitosamente');
      window.app.renderCurrentModule();
    });
  }

  viewPatient(id) {
    const patient = db.getPatientById(id);
    if (!patient) return;

    const appointments = db.getAppointmentsByPatient(id);
    const clinicalHistory = patient.clinicalHistory || {};
    const emergencyContact = patient.emergencyContact || {};

    const content = `
      <div class="patient-details">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div class="card" style="padding: 1rem;">
            <h4 style="color: var(--primary-blue); margin-bottom: 1rem;">📋 Información Personal</h4>
            <div style="display: grid; gap: 0.5rem;">
              <div><strong>ID:</strong> ${patient.id}</div>
              <div><strong>Nombre:</strong> ${patient.name}</div>
              <div><strong>Fecha de Nacimiento:</strong> ${patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('es-MX') : 'N/A'}</div>
              <div><strong>Edad:</strong> ${patient.age} años</div>
              <div><strong>Tipo de Sangre:</strong> ${patient.bloodType || 'N/A'}</div>
              <div><strong>Teléfono:</strong> ${patient.phone}</div>
              <div><strong>Email:</strong> ${patient.email}</div>
              <div><strong>Dirección:</strong> ${patient.address || 'N/A'}</div>
              <div><strong>Ocupación:</strong> ${patient.occupation || 'N/A'}</div>
              <div><strong>Seguro:</strong> ${patient.insurance || 'N/A'}</div>
            </div>
          </div>

          <div class="card" style="padding: 1rem;">
            <h4 style="color: var(--primary-blue); margin-bottom: 1rem;">🚨 Contacto de Emergencia</h4>
            <div style="display: grid; gap: 0.5rem;">
              <div><strong>Nombre:</strong> ${emergencyContact.name || 'N/A'}</div>
              <div><strong>Teléfono:</strong> ${emergencyContact.phone || 'N/A'}</div>
              <div><strong>Parentesco:</strong> ${emergencyContact.relationship || 'N/A'}</div>
            </div>
            <hr style="margin: 1rem 0;">
            <h4 style="color: var(--primary-blue); margin-bottom: 1rem;">📅 Información de Registro</h4>
            <div style="display: grid; gap: 0.5rem;">
              <div><strong>Fecha de registro:</strong> ${new Date(patient.createdAt).toLocaleDateString('es-MX')}</div>
              <div><strong>Última visita:</strong> ${patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-MX') : 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="card" style="padding: 1rem; margin-bottom: 1.5rem;">
          <h4 style="color: var(--primary-blue); margin-bottom: 1rem;">🏥 Historial Clínico</h4>
          <div style="display: grid; gap: 1rem;">
            ${clinicalHistory.allergies && clinicalHistory.allergies.length > 0 ? `
              <div>
                <strong style="color: var(--danger);">⚠️ Alergias:</strong>
                <div style="margin-top: 0.5rem;">
                  ${clinicalHistory.allergies.map(a => `<span class="badge badge-danger" style="margin-right: 0.5rem;">${a}</span>`).join('')}
                </div>
              </div>
            ` : '<div><strong>Alergias:</strong> Ninguna registrada</div>'}

            ${clinicalHistory.chronicDiseases && clinicalHistory.chronicDiseases.length > 0 ? `
              <div>
                <strong style="color: var(--warning);">🏥 Enfermedades Crónicas:</strong>
                <div style="margin-top: 0.5rem;">
                  ${clinicalHistory.chronicDiseases.map(d => `<span class="badge badge-warning" style="margin-right: 0.5rem;">${d}</span>`).join('')}
                </div>
              </div>
            ` : '<div><strong>Enfermedades Crónicas:</strong> Ninguna registrada</div>'}

            ${clinicalHistory.currentMedications && clinicalHistory.currentMedications.length > 0 ? `
              <div>
                <strong>💊 Medicamentos Actuales:</strong>
                <div style="margin-top: 0.5rem;">
                  ${clinicalHistory.currentMedications.map(m => `<span class="badge badge-info" style="margin-right: 0.5rem;">${m}</span>`).join('')}
                </div>
              </div>
            ` : '<div><strong>Medicamentos Actuales:</strong> Ninguno</div>'}

            ${clinicalHistory.previousSurgeries && clinicalHistory.previousSurgeries.length > 0 ? `
              <div>
                <strong>🔪 Cirugías Previas:</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem;">
                  ${clinicalHistory.previousSurgeries.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>
            ` : '<div><strong>Cirugías Previas:</strong> Ninguna</div>'}

            ${clinicalHistory.familyHistory ? `
              <div>
                <strong>👨‍👩‍👧‍👦 Antecedentes Familiares:</strong>
                <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary);">${clinicalHistory.familyHistory}</p>
              </div>
            ` : ''}

            ${clinicalHistory.dentalHistory ? `
              <div>
                <strong>🦷 Historial Dental:</strong>
                <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary);">${clinicalHistory.dentalHistory}</p>
              </div>
            ` : ''}

            ${clinicalHistory.notes ? `
              <div>
                <strong>📝 Notas Clínicas:</strong>
                <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary);">${clinicalHistory.notes}</p>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="card" style="padding: 1rem;">
          <h4 style="color: var(--primary-blue); margin-bottom: 1rem;">📅 Historial de Citas (${appointments.length})</h4>
          ${appointments.length === 0 ? '<p style="color: var(--text-secondary);">No hay citas registradas</p>' : `
            <div style="max-height: 300px; overflow-y: auto;">
              ${appointments.map(apt => `
                <div style="padding: 0.75rem; background: var(--off-white); border-radius: 8px; margin-bottom: 0.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${apt.treatment}</strong><br>
                      <small style="color: var(--text-secondary);">
                        📅 ${this.formatLocalDateShort(apt.date)} a las ${apt.time}
                      </small>
                    </div>
                    <span class="badge badge-${apt.status === 'confirmed' ? 'success' : apt.status === 'pending' ? 'warning' : 'secondary'}">
                      ${apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'pending' ? 'Pendiente' : apt.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </span>
                  </div>
                  ${apt.notes ? `<p style="margin-top: 0.5rem; margin-bottom: 0; font-size: 0.875rem; color: var(--text-secondary);">${apt.notes}</p>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    modal.create(`Expediente Completo - ${patient.name}`, content, [
      { text: 'Cerrar', class: 'btn-secondary' }
    ]);
  }

  deletePatient(id) {
    const patient = db.getPatientById(id);
    if (!patient) return;

    modal.confirm(
      'Eliminar Paciente',
      `¿Estás seguro de que deseas eliminar al paciente <strong>${patient.name}</strong>? Esta acción también eliminará todas sus citas asociadas y no se puede deshacer.`,
      () => {
        db.deletePatient(id);
        notify.success('Paciente eliminado exitosamente');
        window.app.renderCurrentModule();
      }
    );
  }
}

const patientsModule = new PatientsModule();
window.patientsModule = patientsModule;
export default patientsModule;
