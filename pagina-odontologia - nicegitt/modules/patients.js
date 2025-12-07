// ============================================
// PATIENTS MODULE - ENHANCED
// ============================================

import db from '../database/db.js';
import modal from '../components/modal.js';
import notify from '../components/notifications.js';
import printer from '../components/printer.js';
import timeline from '../components/timeline.js';
import fileUpload from '../components/file-upload.js';
import imageViewer from '../components/image-viewer.js';

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
    this.setupTableEvents();

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
                    <button class="action-btn action-btn-view js-view-patient" data-id="${patient.id}" title="Ver detalles">
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
      this.setupTableEvents();
    }
  }

  setupTableEvents() {
    const container = document.getElementById('patients-table-container');
    if (!container) return;

    container.querySelectorAll('.js-view-patient').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop bubbling just in case
        const id = btn.getAttribute('data-id');
        console.log('Manual click listener fired for id:', id);
        this.viewPatient(id);
      });
    });
  }

  showAddForm() {
    console.log('[DEBUG] showAddForm called');
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
      console.log('[DEBUG] Form submitted with data:', data);

      // Calculate age from birthDate
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      console.log('[DEBUG] Calculated age:', age);
      console.log('[DEBUG] Calling db.addPatient...');

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

      console.log('[DEBUG] Patient added:', patient);
      console.log('[DEBUG] Showing success notification...');
      notify.success(`Paciente ${patient.name} agregado exitosamente`);

      console.log('[DEBUG] Calling window.app.renderCurrentModule...');
      window.app.renderCurrentModule();
      console.log('[DEBUG] renderCurrentModule called');
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
    try {
      const content = this.getPatientDetailsHTML(id);
      if (!content) return;

      // Check if modal is already open
      const existingModalBody = document.getElementById(`patient-details-view-${id}`);
      if (existingModalBody) {
        // Update content in place
        existingModalBody.innerHTML = content;
        // Optionally re-scroll to some position or keep it?
        // For now, simple replace.
      } else {
        // Open new modal
        modal.create(
          `Expediente Completo - ${this.getPatientName(id)}`,
          `<div id="patient-details-view-${id}">${content}</div>`,
          [
            { text: 'Cerrar', class: 'btn-secondary' }
          ],
          { size: 'large' }
        );
      }
    } catch (error) {
      console.error('Error viewing patient:', error);
      notify.error('Error al abrir el expediente');
    }
  }

  getPatientName(id) {
    const p = db.getPatientById(id);
    return p ? p.name : 'Paciente';
  }

  toggleTreatmentPayment(patientId, treatmentId) {
    const patient = db.getPatientById(patientId);
    if (!patient) return;

    const treatments = db.getTreatments(patientId);
    const treatment = treatments.find(t => t.id === treatmentId);

    if (treatment) {
      const newStatus = !treatment.paid;
      db.updateTreatmentStatus(patientId, treatmentId, newStatus);
      notify.success(`Tratamiento marcado como ${newStatus ? 'Pagado' : 'Pendiente'}`);

      // Refresh the view seamlessly
      this.viewPatient(patientId);

      // Also refresh global treatments list if open (unlikely in modal but good practice)
      if (window.treatmentsModule) window.treatmentsModule.refresh();
    }
  }

  deleteTreatment(patientId, treatmentId) {
    if (confirm('¿Seguro que deseas eliminar este tratamiento?')) {
      db.deleteTreatment(patientId, treatmentId);
      notify.success('Tratamiento eliminado');
      this.viewPatient(patientId); // Seamless refresh
      if (window.treatmentsModule) window.treatmentsModule.refresh();
    }
  }

  getPatientDetailsHTML(id) {
    const patient = db.getPatientById(id);
    if (!patient) return null;

    const appointments = db.getAppointmentsByPatient(id);
    const treatments = db.getTreatments(id) || [];
    const documents = db.getDocuments(id) || [];
    const clinicalHistory = patient.clinicalHistory || {};
    const emergencyContact = patient.emergencyContact || {};
    const tags = patient.tags || [];
    const privateNotes = patient.privateNotes || '';

    // Prepare treatments for timeline
    const timelineEvents = treatments.map(t => ({
      type: t.type || 'treatment',
      title: t.treatment,
      date: t.date,
      description: t.notes,
      details: {
        dentist: t.dentist,
        duration: t.duration ? `${t.duration} min` : null
      },
      cost: t.cost,
      paid: t.paid,
      photos: t.photos || [],
      // Custom HTML for actions
      actionsHTML: `
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button class="btn btn-sm ${t.paid ? 'btn-success' : 'btn-warning'}" 
                        onclick="patientsModule.toggleTreatmentPayment('${id}', '${t.id}')">
                    ${t.paid ? '✅ Pagado' : '💰 Marcar como Pagado'}
                </button>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="patientsModule.deleteTreatment('${id}', '${t.id}')">
                    🗑️ Eliminar
                </button>
            </div>
         `
    }));

    return `
         <div class="patient-details">
           <!-- Photo and Basic Info -->
           <div class="patient-photo-container">
             <div class="patient-photo">
               ${patient.photo ? `
                 <img src="${patient.photo}" alt="${patient.name}" onclick="imageViewer.open('${patient.photo}')">
               ` : `
                 <div class="patient-photo-placeholder">${patient.name.charAt(0)}</div>
               `}
             </div>
             <div>
               <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-blue);">${patient.name}</h3>
               <p style="margin: 0; color: var(--text-secondary);">ID: ${patient.id} • ${patient.age} años</p>
               ${tags.length > 0 ? `
                 <div class="tags-container">
                   ${tags.map(tag => `<span class="tag tag-${tag.toLowerCase()}">${tag}</span>`).join('')}
                 </div>
               ` : ''}
               <div style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                 <button class="btn btn-sm btn-primary" onclick="patientsModule.uploadPhoto('${id}')">
                   📸 ${patient.photo ? 'Cambiar' : 'Agregar'} Foto
                 </button>
                 <button class="btn btn-sm btn-secondary" onclick="patientsModule.manageTags('${id}')">
                   🏷️ Etiquetas
                 </button>
                 <button class="btn btn-sm btn-outline" onclick="patientsModule.printMedicalHistory('${id}')" title="Imprimir Historial Clínico">
                   🖨️ Historial
                 </button>
                 <button class="btn btn-sm btn-outline" onclick="patientsModule.printNewPrescription('${id}')" title="Imprimir Nueva Receta">
                   💊 Receta
                 </button>
               </div>
             </div>
           </div>
 
           <!-- Info Grid -->
           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
             <div class="card" style="padding: 1rem;">
               <h4 style="color: var(--primary-blue); margin-bottom: 1rem;">📋 Información Personal</h4>
               <div style="display: grid; gap: 0.5rem;">
                 <div><strong>Nombre:</strong> ${patient.name}</div>
                 <div><strong>Fecha de Nacimiento:</strong> ${patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('es-MX') : 'N/A'}</div>
                 <div><strong>Edad:</strong> ${patient.age} años</div>
                 <div><strong>Tipo de Sangre:</strong> ${patient.bloodType || 'N/A'}</div>
                 <div><strong>Teléfono:</strong> ${patient.phone}</div>
                 <div><strong>Email:</strong> ${patient.email}</div>
                 <div><strong>Dirección:</strong> ${patient.address || 'N/A'}</div>
               </div>
             </div>
 
             <div class="card" style="padding: 1rem;">
               <h4 style="color: var(--primary-blue); margin-bottom: 1rem;">🏥 Historial Médico</h4>
               <div style="display: grid; gap: 0.5rem;">
                 <div>
                    <strong>Alergias:</strong> 
                    ${clinicalHistory.allergies && clinicalHistory.allergies.length ?
        clinicalHistory.allergies.map(a => `<span class="tag tag-danger">${a}</span>`).join(' ') :
        'Ninguna conocida'}
                 </div>
                 <div><strong>Enfermedades:</strong> ${clinicalHistory.conditions ? clinicalHistory.conditions.join(', ') : 'Ninguna'}</div>
                 <div><strong>Medicamentos:</strong> ${clinicalHistory.medications || 'Ninguno'}</div>
                 <hr style="margin: 0.5rem 0;">
                 <div style="color: var(--danger);">
                    <strong>Emergencia:</strong><br>
                    ${emergencyContact.name || 'No registrado'} - ${emergencyContact.phone || ''}
                 </div>
               </div>
             </div>
           </div>
 
           <!-- Tabs for History/Documents -->
           <div class="tabs">
             <div class="tab active">Historial y Tratamientos</div>
           </div>
 
           <div class="card" style="padding: 1rem;">
             <div class="flex-between mb-3">
               <h4 style="margin:0;">Cronograma de Atención</h4>
               <button class="btn btn-sm btn-primary" onclick="patientsModule.showTreatmentForm('${id}')">
                 + Agregar Tratamiento
               </button>
             </div>
             
             ${timeline.render(timelineEvents, { emptyMessage: 'No hay tratamientos registrados' })}
           </div>
 
            <div class="card" style="padding: 1rem; margin-top: 1.5rem;">
             <div class="flex-between mb-3">
               <h4 style="margin:0;">📁 Documentos y Radiografías</h4>
               <button class="btn btn-sm btn-secondary" onclick="patientsModule.uploadDocument('${id}')">
                 Total Adjuntar
               </button>
             </div>
             ${documents.length === 0 ? '<p>No hay documentos.</p>' : `
                <ul class="file-list">
                  ${documents.map(doc => `
                    <li>
                      <span class="file-icon">${doc.category === 'radiografia' ? '' : '📄'}</span>
                      <a href="#" onclick="return false;">${doc.name}</a>
                      <span style="font-size: 0.8rem; color: #999;">(${new Date(doc.uploadDate).toLocaleDateString()})</span>
                      <button class="btn-icon-small" onclick="patientsModule.deleteDocument('${id}', '${doc.id}')" title="Eliminar">🗑️</button>
                    </li>
                  `).join('')}
                </ul>
             `}
           </div>
 
           <!-- Private Notes -->
           <div class="card" style="padding: 1rem; margin-top: 1.5rem; background: #fffbe6; border-color: #ffe58f;">
              <h4 style="color: #d48806; margin-bottom: 0.5rem;">🔒 Notas Privadas (Solo interno)</h4>
              <textarea 
                id="private-notes-${id}"
                class="form-textarea" 
                rows="3" 
                placeholder="Escribe notas privadas aquí..."
              >${privateNotes}</textarea>
              <button class="btn btn-primary mt-2" onclick="patientsModule.savePrivateNotes('${id}')" style="margin-top: 0.5rem;">
                💾 Guardar Notas
              </button>
           </div>
         </div>
       `;
  }

  uploadPhoto(patientId) {
    const uploadUI = fileUpload.createUploadUI({
      accept: 'image/*',
      multiple: false,
      label: 'Seleccionar Foto'
    });

    modal.create('Foto del Paciente', uploadUI, [
      { text: 'Cancelar', class: 'btn-secondary' }
    ]);

    setTimeout(() => {
      // Find the upload container that was just created
      const uploadElement = document.querySelector('.file-upload-container');
      if (uploadElement) {
        fileUpload.init(uploadElement.id, (fileData) => {
          db.updatePatientPhoto(patientId, fileData.data);
          notify.success('Foto actualizada exitosamente');
          modal.close();
          this.viewPatient(patientId);
        });
      } else {
        console.error('[ERROR] Upload container not found');
        notify.error('Error al inicializar subida de foto');
      }
    }, 200);
  }

  showTreatmentForm(patientId) {
    modal.form('Nuevo Tratamiento', [
      { name: 'treatment', label: 'Tratamiento', type: 'text', required: true, placeholder: 'Ej: Limpieza dental, Extracción, Ortodoncia' },
      { name: 'date', label: 'Fecha', type: 'date', required: true, value: new Date().toISOString().split('T')[0] },
      { name: 'dentist', label: 'Dentista', type: 'text', placeholder: 'Nombre del dentista' },
      { name: 'duration', label: 'Duración (minutos)', type: 'number', placeholder: '30' },
      {
        name: 'type', label: 'Tipo', type: 'select', options: [
          { value: 'treatment', label: 'Tratamiento' },
          { value: 'checkup', label: 'Revisión' },
          { value: 'cleaning', label: 'Limpieza' },
          { value: 'surgery', label: 'Cirugía' },
          { value: 'consultation', label: 'Consulta' },
          { value: 'emergency', label: 'Emergencia' },
          { value: 'followup', label: 'Seguimiento' }
        ]
      },
      { name: 'cost', label: 'Costo', type: 'number', placeholder: '0.00' },
      {
        name: 'paid', label: 'Estado de Pago', type: 'select', options: [
          { value: 'true', label: 'Pagado' },
          { value: 'false', label: 'Pendiente' }
        ]
      },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Detalles del tratamiento, observaciones, etc.' }
    ], (data) => {
      db.addTreatment(patientId, {
        treatment: data.treatment,
        date: data.date,
        dentist: data.dentist || '',
        duration: parseInt(data.duration) || null,
        type: data.type || 'treatment',
        cost: parseFloat(data.cost) || 0,
        paid: data.paid === 'true',
        notes: data.notes || '',
        photos: []
      });

      notify.success('Tratamiento agregado exitosamente');
      modal.close();
      this.viewPatient(patientId); // Seamless refresh
      if (window.treatmentsModule) window.treatmentsModule.refresh();
    });
  }

  uploadDocument(patientId) {
    const uploadUI = fileUpload.createUploadUI({
      accept: 'image/*,application/pdf',
      multiple: true,
      label: 'Seleccionar Archivos'
    });

    modal.create('Subir Documento', `
      <p style="margin-bottom: 1rem; color: var(--text-secondary);">
        Puedes subir radiografías, estudios, recetas, consentimientos, etc.
      </p>
      ${uploadUI}
    `, [
      { text: 'Cerrar', class: 'btn-secondary' }
    ]);

    setTimeout(() => {
      // Find the upload container that was just created
      const uploadElement = document.querySelector('.file-upload-container');
      if (uploadElement) {
        fileUpload.init(uploadElement.id, (fileData) => {
          db.addDocument(patientId, {
            name: fileData.name,
            type: fileData.type,
            data: fileData.data,
            category: fileData.type.startsWith('image/') ? 'radiografia' : 'documento'
          });
          notify.success(`Documento "${fileData.name}" subido exitosamente`);
          this.viewPatient(patientId);
        });
      } else {
        console.error('[ERROR] Upload container not found');
        notify.error('Error al inicializar subida de documentos');
      }
    }, 200);
  }

  deleteDocument(patientId, documentId) {
    modal.confirm(
      'Eliminar Documento',
      '¿Estás seguro de que deseas eliminar este documento?',
      () => {
        db.deleteDocument(patientId, documentId);
        notify.success('Documento eliminado');
        this.viewPatient(patientId); // Seamless refresh
      }
    );
  }

  manageTags(patientId) {
    const patient = db.getPatientById(patientId);
    const currentTags = patient.tags || [];
    const availableTags = ['VIP', 'Ortodoncia', 'Implante', 'Urgente', 'Seguimiento'];

    modal.create('Gestionar Etiquetas', `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--primary-blue); margin-bottom: 0.5rem;">Etiquetas Actuales</h4>
        <div class="tags-container" id="current-tags-${patientId}">
          ${currentTags.length > 0 ? currentTags.map(tag => `
            <span class="tag tag-${tag.toLowerCase()}">
              ${tag}
              <button onclick="patientsModule.removeTagInline('${patientId}', '${tag}')" style="margin-left: 0.5rem; background: none; border: none; color: white; cursor: pointer;">×</button>
            </span>
          `).join('') : '<p style="color: var(--text-secondary);">Sin etiquetas</p>'}
        </div>
      </div>
      <div>
        <h4 style="color: var(--primary-blue); margin-bottom: 0.5rem;">Agregar Etiqueta</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;" id="available-tags-${patientId}">
          ${availableTags.map(tag => `
            <button 
              class="btn btn-sm ${currentTags.includes(tag) ? 'btn-secondary' : 'btn-outline'}"
              onclick="patientsModule.addTagInline('${patientId}', '${tag}')"
              ${currentTags.includes(tag) ? 'disabled' : ''}
              id="tag-btn-${tag}"
            >
              ${tag}
            </button>
          `).join('')}
        </div>
      </div>
    `, [
      { text: 'Cerrar y Volver al Expediente', class: 'btn-primary', onClick: () => this.viewPatient(patientId) }
    ]);
  }

  addTag(patientId, tag) {
    db.addPatientTag(patientId, tag);
    notify.success(`Etiqueta "${tag}" agregada`);
    modal.close();
    this.viewPatient(patientId);
  }

  // Add tag without closing modal (inline update)
  addTagInline(patientId, tag) {
    db.addPatientTag(patientId, tag);
    notify.success(`Etiqueta "${tag}" agregada`);

    // Update UI without reopening modal
    const patient = db.getPatientById(patientId);
    const currentTags = patient.tags || [];

    // Update current tags display
    const currentTagsContainer = document.getElementById(`current-tags-${patientId}`);
    if (currentTagsContainer) {
      currentTagsContainer.innerHTML = currentTags.map(t => `
        <span class="tag tag-${t.toLowerCase()}">
          ${t}
          <button onclick="patientsModule.removeTagInline('${patientId}', '${t}')" style="margin-left: 0.5rem; background: none; border: none; color: white; cursor: pointer;">×</button>
        </span>
      `).join('');
    }

    // Disable the button that was just clicked
    const tagBtn = document.getElementById(`tag-btn-${tag}`);
    if (tagBtn) {
      tagBtn.disabled = true;
      tagBtn.className = 'btn btn-sm btn-secondary';
    }
  }

  removeTag(patientId, tag) {
    db.removePatientTag(patientId, tag);
    notify.success(`Etiqueta "${tag}" eliminada`);
    modal.close();
    this.viewPatient(patientId);
  }

  // Remove tag without closing modal (inline update)
  removeTagInline(patientId, tag) {
    db.removePatientTag(patientId, tag);
    notify.success(`Etiqueta "${tag}" eliminada`);

    // Update UI without reopening modal
    const patient = db.getPatientById(patientId);
    const currentTags = patient.tags || [];

    // Update current tags display
    const currentTagsContainer = document.getElementById(`current-tags-${patientId}`);
    if (currentTagsContainer) {
      if (currentTags.length > 0) {
        currentTagsContainer.innerHTML = currentTags.map(t => `
          <span class="tag tag-${t.toLowerCase()}">
            ${t}
            <button onclick="patientsModule.removeTagInline('${patientId}', '${t}')" style="margin-left: 0.5rem; background: none; border: none; color: white; cursor: pointer;">×</button>
          </span>
        `).join('');
      } else {
        currentTagsContainer.innerHTML = '<p style="color: var(--text-secondary);">Sin etiquetas</p>';
      }
    }

    // Enable the button that was just removed
    const tagBtn = document.getElementById(`tag-btn-${tag}`);
    if (tagBtn) {
      tagBtn.disabled = false;
      tagBtn.className = 'btn btn-sm btn-outline';
    }
  }

  savePrivateNotes(patientId, value) {
    const notes = value !== undefined ? value : document.getElementById(`private-notes-${patientId}`).value;
    db.updatePrivateNotes(patientId, notes);
    notify.success('Notas privadas guardadas');
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

  printMedicalHistory(id) {
    const patient = db.getPatientById(id);
    const treatments = db.getTreatments(id) || [];
    printer.printHistory(patient, treatments);
  }

  printNewPrescription(id) {
    const patient = db.getPatientById(id);
    if (!patient) return;

    modal.form(`Nueva Receta - ${patient.name}`, [
      { name: 'medications', label: 'Medicamentos y Dosis', type: 'textarea', required: true, placeholder: 'Ej: Amoxicilina 500mg - 1 tableta cada 8 horas por 7 días' },
      { name: 'instructions', label: 'Indicaciones Adicionales', type: 'textarea', placeholder: 'Ej: Tomar con alimentos, reposo relativo...' }
    ], (data) => {
      printer.printPrescription(patient, data.medications, data.instructions);
      notify.success('Receta generada lista para imprimir');
    });

    // Auto-focus on medications field after modal renders
    setTimeout(() => {
      const medicationsField = document.getElementById('medications');
      if (medicationsField) {
        medicationsField.focus();
      }
    }, 300);
  }
}

const patientsModule = new PatientsModule();
window.patientsModule = patientsModule;
export default patientsModule;
