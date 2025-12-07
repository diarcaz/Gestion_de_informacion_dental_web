// ============================================
// TIMELINE COMPONENT
// ============================================

class Timeline {
  constructor() {
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    window.timeline = window.timeline || {};
    window.timeline.toggle = (id) => {
      const body = document.getElementById(`timeline-body-${id}`);
      const toggle = document.getElementById(`timeline-toggle-${id}`);
      if (body && toggle) {
        if (body.classList.contains('collapsed')) {
          body.classList.remove('collapsed');
          toggle.style.transform = 'rotate(180deg)';
        } else {
          body.classList.add('collapsed');
          toggle.style.transform = 'rotate(0deg)';
        }
      }
    };
  }

  render(items = [], options = {}) {
    const { emptyMessage = 'No hay eventos' } = options;

    if (!items || items.length === 0) {
      return `
        <div class="timeline-empty">
          <div class="timeline-empty-icon">📅</div>
          <p>${emptyMessage}</p>
        </div>
      `;
    }

    // Sort items by date descending
    const sortedItems = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
      <div class="timeline">
        ${sortedItems.map((item, index) => this.renderItem(item, index)).join('')}
      </div>
    `;
  }

  renderItem(item, index) {
    const id = `t-${Date.now()}-${index}`;
    const date = new Date(item.date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const icon = this.getIconByType(item.type);
    const colorClass = this.getColorClassByType(item.type);

    return `
      <div class="timeline-item">
        <div class="timeline-marker ${colorClass ? 'bg-' + colorClass : ''}" style="background: var(--primary-blue);">
          <span class="timeline-icon">${icon}</span>
        </div>
        
        <div class="timeline-content">
          <div class="timeline-header" onclick="window.timeline.toggle('${id}')">
            <div class="timeline-title-group">
              <div class="timeline-title">${item.title}</div>
              <div class="timeline-date">${date}</div>
            </div>
            <div class="timeline-toggle" id="timeline-toggle-${id}">▼</div>
          </div>
          
          <div class="timeline-body collapsed" id="timeline-body-${id}">
            ${item.description ? `<p class="timeline-description">${item.description}</p>` : ''}
            
            ${item.details ? `
              <div class="timeline-details">
                ${Object.entries(item.details).map(([key, value]) => value ? `
                  <div class="timeline-detail-item">
                    <strong>${this.formatKey(key)}:</strong> ${value}
                  </div>
                ` : '').join('')}
              </div>
            ` : ''}

            ${item.cost !== undefined ? `
              <div class="timeline-cost">
                <span>💰 Costo:</span>
                <strong>$${item.cost.toFixed(2)}</strong>
                ${item.paid ? '<span class="badge badge-success">Pagado</span>' : '<span class="badge badge-warning">Pendiente</span>'}
              </div>
            ` : ''}
            
            ${item.photos && item.photos.length > 0 ? `
              <div style="margin-top: 1rem;">
                <strong>📸 Evidencia:</strong>
                <div class="timeline-photos">
                  ${item.photos.map((photo, pIndex) => `
                    <div class="timeline-photo" onclick="imageViewer.open(${JSON.stringify(item.photos)}, ${pIndex}); event.stopPropagation();">
                      <img src="${typeof photo === 'string' ? photo : photo.data}" alt="Evidencia">
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  getIconByType(type) {
    const icons = {
      treatment: '🦷',
      checkup: '🔍',
      cleaning: '✨',
      surgery: '🔪',
      consultation: '💬',
      emergency: '🚨',
      followup: '👀'
    };
    return icons[type] || '📅';
  }

  getColorClassByType(type) {
    // We handle colors via CSS variables usually, assuming standard for now
    return '';
  }

  formatKey(key) {
    const map = {
      dentist: 'Dentista',
      duration: 'Duración',
      notes: 'Notas'
    };
    return map[key] || key;
  }
}

const timeline = new Timeline();
window.timelineComponent = timeline; // Avoid conflict with global window.timeline handler namespace
export default timeline;
