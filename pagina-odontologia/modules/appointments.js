// ============================================
// APPOINTMENTS MODULE
// ============================================

import db from '../database/db.js?v=2';
import modal from '../components/modal.js?v=2';
import notify from '../components/notifications.js?v=2';
import Calendar from '../components/calendar.js?v=2';

class AppointmentsModule {
  constructor() {
    this.selectedDate = null;
    this.calendar = null;
  }

  // Helper function to format date without UTC offset issues
  // Helper function to format date without UTC offset issues
  formatLocalDate(dateString) {
    if (!dateString) return 'N/A';

    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const [year, month, day] = dateString.split('-');
    const monthName = months[parseInt(month) - 1];

    // Create date just to get the weekday, but use the day from string
    const date = new Date(year, month - 1, day);
    const weekday = date.toLocaleDateString('es-MX', { weekday: 'long' });

    // Capitalize weekday
    const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);

    return `${weekdayCap}, ${parseInt(day)} de ${monthName} de ${year}`;
  }

  formatLocalDateShort(dateString) {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  }

  render() {
    const appointments = this.selectedDate
      ? db.getAppointmentsByDate(this.selectedDate)
      : db.getTodayAppointments();

    const displayDate = this.selectedDate
      ? this.formatLocalDate(this.selectedDate)
      : 'Hoy';

    return `
      <div class="page-header">
        <h2>📅 Gestión de Citas</h2>
        <p>Administra las citas de tus pacientes</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card">
          <div id="calendar-container"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Citas - ${displayDate}</h3>
            <button class="btn btn-primary btn-sm" onclick="appointmentsModule.showAddForm()">
              ➕ Nueva Cita
            </button>
          </div>
          <div class="card-body">
            ${appointments.length === 0 ? this.renderEmptyState() : this.renderAppointmentsList(appointments)}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Todas las Citas</h3>
        </div>
        ${this.renderAllAppointmentsTable()}
      </div>
    `;
  }

  afterRender() {
    // Initialize calendar after DOM is ready
    setTimeout(() => {
      this.calendar = new Calendar('calendar-container');
      this.calendar.setAppointments(db.getAppointments());
      this.calendar.setOnDateSelect((date) => {
        this.selectedDate = date;
        window.app.renderCurrentModule();
      });
      window.calendar = this.calendar; // Make it globally accessible
    }, 100);
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3>No hay citas para esta fecha</h3>
        <p>Selecciona otra fecha o agenda una nueva cita</p>
      </div>
    `;
  }

  renderAppointmentsList(appointments) {
    const sortedAppointments = appointments.sort((a, b) => a.time.localeCompare(b.time));

    return `
      <div style="max-height: 400px; overflow-y: auto;">
        ${sortedAppointments.map(apt => `
          <div class="card" style="margin-bottom: 1rem; padding: 1rem;">
            <div class="flex-between mb-2">
              <div>
                <strong style="font-size: 1.1rem; color: var(--primary-blue);">${apt.time}</strong>
                <span class="badge badge-${this.getStatusBadgeClass(apt.status)}" style="margin-left: 0.5rem;">
                  ${this.getStatusText(apt.status)}
                </span>
              </div>
              <div class="action-buttons">
                <button class="action-btn action-btn-edit" onclick="appointmentsModule.showEditForm('${apt.id}')" title="Editar">
                  ✏️
                </button>
                <button class="action-btn action-btn-delete" onclick="appointmentsModule.deleteAppointment('${apt.id}')" title="Eliminar">
                  🗑️
                </button>
              </div>
            </div>
            <div>
              <strong>Paciente:</strong> ${apt.patientName}<br>
              <strong>Tratamiento:</strong> ${apt.treatment}
              ${apt.notes ? `<br><small style="color: var(--text-secondary);">Notas: ${apt.notes}</small>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderAllAppointmentsTable() {
    const appointments = db.getAppointments().sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      return dateCompare !== 0 ? dateCompare : b.time.localeCompare(a.time);
    });

    if (appointments.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3>No hay citas registradas</h3>
          <p>Comienza agregando tu primera cita</p>
          <button class="btn btn-primary mt-2" onclick="appointmentsModule.showAddForm()">
            ➕ Agregar Cita
          </button>
        </div>
      `;
    }

    return `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Tratamiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${appointments.map(apt => `
              <tr>
                <td><strong>${apt.id}</strong></td>
                <td>${this.formatLocalDateShort(apt.date)}</td>
                <td>${apt.time}</td>
                <td>${apt.patientName}</td>
                <td>${apt.treatment}</td>
                <td>
                  <span class="badge badge-${this.getStatusBadgeClass(apt.status)}">
                    ${this.getStatusText(apt.status)}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn action-btn-edit" onclick="appointmentsModule.showEditForm('${apt.id}')" title="Editar">
                      ✏️
                    </button>
                    <button class="action-btn action-btn-delete" onclick="appointmentsModule.deleteAppointment('${apt.id}')" title="Eliminar">
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

  getStatusBadgeClass(status) {
    const classes = {
      'pending': 'warning',
      'confirmed': 'success',
      'completed': 'info',
      'cancelled': 'secondary'
    };
    return classes[status] || 'secondary';
  }

  getStatusText(status) {
    const texts = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return texts[status] || status;
  }

  showAddForm() {
    const patients = db.getPatients();

    if (patients.length === 0) {
      modal.alert('Sin Pacientes', 'Primero debes agregar pacientes antes de crear citas.');
      return;
    }

    modal.form('Nueva Cita', [
      {
        name: 'patientId',
        label: 'Paciente',
        type: 'select',
        required: true,
        options: patients.map(p => ({ value: p.id, label: `${p.name} (${p.id})` }))
      },
      { name: 'date', label: 'Fecha', type: 'date', required: true, value: this.selectedDate || new Date().toISOString().split('T')[0] },
      { name: 'time', label: 'Hora', type: 'time', required: true },
      { name: 'treatment', label: 'Tratamiento', type: 'text', required: true, placeholder: 'Ej: Limpieza dental, Extracción, etc.' },
      {
        name: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [
          { value: 'pending', label: 'Pendiente' },
          { value: 'confirmed', label: 'Confirmada' }
        ]
      },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Información adicional...' }
    ], (data) => {
      // Check if time slot is available
      if (!db.isTimeSlotAvailable(data.date, data.time)) {
        notify.error('Ya existe una cita en este horario');
        return;
      }

      const patient = db.getPatientById(data.patientId);
      const appointment = db.addAppointment({
        patientId: data.patientId,
        patientName: patient.name,
        date: data.date,
        time: data.time,
        treatment: data.treatment,
        status: data.status,
        notes: data.notes || ''
      });

      notify.success('Cita agregada exitosamente');
      window.app.renderCurrentModule();
    });
  }

  showEditForm(id) {
    const appointment = db.getAppointmentById(id);
    if (!appointment) return;

    const patients = db.getPatients();

    modal.form('Editar Cita', [
      {
        name: 'patientId',
        label: 'Paciente',
        type: 'select',
        required: true,
        value: appointment.patientId,
        options: patients.map(p => ({ value: p.id, label: `${p.name} (${p.id})` }))
      },
      { name: 'date', label: 'Fecha', type: 'date', required: true, value: appointment.date },
      { name: 'time', label: 'Hora', type: 'time', required: true, value: appointment.time },
      { name: 'treatment', label: 'Tratamiento', type: 'text', required: true, value: appointment.treatment },
      {
        name: 'status',
        label: 'Estado',
        type: 'select',
        required: true,
        value: appointment.status,
        options: [
          { value: 'pending', label: 'Pendiente' },
          { value: 'confirmed', label: 'Confirmada' },
          { value: 'completed', label: 'Completada' },
          { value: 'cancelled', label: 'Cancelada' }
        ]
      },
      { name: 'notes', label: 'Notas', type: 'textarea', value: appointment.notes }
    ], (data) => {
      // Check if time slot is available (excluding current appointment)
      if (!db.isTimeSlotAvailable(data.date, data.time, id)) {
        notify.error('Ya existe una cita en este horario');
        return;
      }

      const patient = db.getPatientById(data.patientId);
      db.updateAppointment(id, {
        patientId: data.patientId,
        patientName: patient.name,
        date: data.date,
        time: data.time,
        treatment: data.treatment,
        status: data.status,
        notes: data.notes
      });

      notify.success('Cita actualizada exitosamente');
      window.app.renderCurrentModule();
    });
  }

  deleteAppointment(id) {
    const appointment = db.getAppointmentById(id);
    if (!appointment) return;

    modal.confirm(
      'Eliminar Cita',
      `¿Estás seguro de que deseas eliminar la cita de <strong>${appointment.patientName}</strong> el ${this.formatLocalDateShort(appointment.date)} a las ${appointment.time}?`,
      () => {
        db.deleteAppointment(id);
        notify.success('Cita eliminada exitosamente');
        window.app.renderCurrentModule();
      }
    );
  }
}

const appointmentsModule = new AppointmentsModule();
window.appointmentsModule = appointmentsModule;
export default appointmentsModule;
