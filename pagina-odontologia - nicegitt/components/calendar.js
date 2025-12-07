// ============================================
// CALENDAR COMPONENT
// ============================================

class Calendar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.selectedDate = null;
    this.appointments = [];
    this.onDateSelect = null;
  }

  setAppointments(appointments) {
    this.appointments = appointments;
    this.render();
  }

  setOnDateSelect(callback) {
    this.onDateSelect = callback;
  }

  render() {
    if (!this.container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let html = `
      <div class="calendar">
        <div class="calendar-header">
          <button class="btn btn-sm btn-outline" onclick="calendar.previousMonth()">
            ‹
          </button>
          <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
          <button class="btn btn-sm btn-outline" onclick="calendar.nextMonth()">
            ›
          </button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-day-header">Dom</div>
          <div class="calendar-day-header">Lun</div>
          <div class="calendar-day-header">Mar</div>
          <div class="calendar-day-header">Mié</div>
          <div class="calendar-day-header">Jue</div>
          <div class="calendar-day-header">Vie</div>
          <div class="calendar-day-header">Sáb</div>
    `;

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="calendar-day"></div>';
    }

    // Days of the month
    // Helper to format date as YYYY-MM-DD in local time
    const formatDateLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const today = new Date();
    const todayStr = formatDateLocal(today);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateLocal(date);
      const hasAppointment = this.appointments.some(a => a.date === dateStr);

      let classes = 'calendar-day';
      if (dateStr === todayStr) classes += ' today';
      if (hasAppointment) classes += ' has-appointment';

      html += `
        <div class="${classes}" onclick="calendar.selectDate('${dateStr}')">
          ${day}
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    if (this.onDateSelect) {
      this.onDateSelect(dateStr);
    }
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  goToToday() {
    this.currentDate = new Date();
    this.render();
  }
}

// Make calendar globally accessible
window.Calendar = Calendar;
export default Calendar;
