// ============================================
// MODAL COMPONENT
// ============================================

class Modal {
    constructor() {
        this.overlay = null;
        this.modal = null;
        this.onConfirm = null;
    }

    create(title, content, buttons = []) {
        // Remove existing modal if any
        this.close();

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';

        // Create modal
        this.modal = document.createElement('div');
        this.modal.className = 'modal';

        // Modal header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close" onclick="window.modal.close()">×</button>
    `;

        // Modal body
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }

        // Modal footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class || 'btn-secondary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                if (btn.onClick) btn.onClick();
                if (btn.closeOnClick !== false) this.close();
            };
            footer.appendChild(button);
        });

        // Assemble modal
        this.modal.appendChild(header);
        this.modal.appendChild(body);
        if (buttons.length > 0) {
            this.modal.appendChild(footer);
        }

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Close on ESC key
        this.escHandler = (e) => {
            if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', this.escHandler);

        return this;
    }

    close() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
        }
        this.overlay = null;
        this.modal = null;
    }

    confirm(title, message, onConfirm) {
        return this.create(title, `<p>${message}</p>`, [
            {
                text: 'Cancelar',
                class: 'btn-secondary'
            },
            {
                text: 'Confirmar',
                class: 'btn-primary',
                onClick: onConfirm
            }
        ]);
    }

    alert(title, message) {
        return this.create(title, `<p>${message}</p>`, [
            {
                text: 'Aceptar',
                class: 'btn-primary'
            }
        ]);
    }

    form(title, fields, onSubmit) {
        const form = document.createElement('form');
        form.className = 'modal-form';

        fields.forEach(field => {
            // Handle header type for section dividers
            if (field.type === 'header') {
                const header = document.createElement('h4');
                header.style.cssText = 'color: var(--primary-blue); margin: 1.5rem 0 1rem 0; padding-top: 1rem; border-top: 2px solid var(--off-white);';
                if (fields.indexOf(field) === 0) {
                    header.style.borderTop = 'none';
                    header.style.paddingTop = '0';
                    header.style.marginTop = '0';
                }
                header.textContent = field.label;
                form.appendChild(header);
                return;
            }

            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = field.label;
            label.setAttribute('for', field.name);

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.className = 'form-textarea';
                input.rows = 3;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                input.className = 'form-select';
                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    if (opt.value === field.value) option.selected = true;
                    input.appendChild(option);
                });
            } else {
                input = document.createElement('input');
                input.className = 'form-input';
                input.type = field.type || 'text';
            }

            input.name = field.name;
            input.id = field.name;
            if (field.value !== undefined) input.value = field.value;
            if (field.required) input.required = true;
            if (field.placeholder) input.placeholder = field.placeholder;
            if (field.min !== undefined) input.min = field.min;
            if (field.max !== undefined) input.max = field.max;

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            form.appendChild(formGroup);
        });

        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            onSubmit(data);
            this.close();
        };

        return this.create(title, form, [
            {
                text: 'Cancelar',
                class: 'btn-secondary'
            },
            {
                text: 'Guardar',
                class: 'btn-primary',
                onClick: () => {
                    form.dispatchEvent(new Event('submit'));
                },
                closeOnClick: false
            }
        ]);
    }
}

// Export modal instance
const modal = new Modal();
window.modal = modal; // Make it globally accessible for inline onclick handlers
export default modal;
