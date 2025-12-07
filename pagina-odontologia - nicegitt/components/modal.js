// ============================================
// MODAL COMPONENT
// ============================================

class Modal {
    constructor() {
        this.openModals = []; // Stack to track open modals
    }

    create(title, content, buttons = [], options = {}) {
        // Do NOT close existing modals. We want to stack them.

        // Create context for this specific modal instance
        const modalContext = {
            overlay: document.createElement('div'),
            modal: document.createElement('div'),
            escHandler: null
        };

        // Create overlay
        modalContext.overlay.className = 'modal-overlay';

        // Adjust z-index based on stack depth to ensure stacking order
        const baseZIndex = 2000;
        const depth = this.openModals.length;
        modalContext.overlay.style.zIndex = baseZIndex + (depth * 10);

        // Create modal
        modalContext.modal = document.createElement('div');
        modalContext.modal.className = options.size === 'large' ? 'modal modal-large' : 'modal';

        // Modal header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close">×</button>
    `;

        // Setup close button
        // We need to capture the specific close function for THIS modal
        const closeThisModal = () => this.close(modalContext);
        header.querySelector('.modal-close').onclick = closeThisModal;

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
                if (btn.closeOnClick !== false) closeThisModal();
            };
            footer.appendChild(button);
        });

        // Assemble modal
        modalContext.modal.appendChild(header);
        modalContext.modal.appendChild(body);
        if (buttons.length > 0) {
            modalContext.modal.appendChild(footer);
        }

        modalContext.overlay.appendChild(modalContext.modal);
        document.body.appendChild(modalContext.overlay);

        // Close on overlay click
        modalContext.overlay.addEventListener('click', (e) => {
            if (e.target === modalContext.overlay) {
                closeThisModal();
            }
        });

        // Close on ESC key
        modalContext.escHandler = (e) => {
            // Only close if this is the top-most modal
            if (e.key === 'Escape' && this.openModals[this.openModals.length - 1] === modalContext) {
                closeThisModal();
            }
        };
        document.addEventListener('keydown', modalContext.escHandler);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (modalContext.overlay) {
                    modalContext.overlay.classList.add('active');
                }
            });
        });

        // Add to stack
        this.openModals.push(modalContext);

        return this; // Keep chaining if needed, though 'this' is the global manager now
    }

    close(specificContext = null) {
        // If specific context provided, close that one (and any above it ideally, but usually we just close top)
        // For simplicity, we'll assume we usually close the top-most, or specific if provided.

        let contextToClose = specificContext;

        if (!contextToClose) {
            // Default to closing the top-most
            if (this.openModals.length === 0) return;
            contextToClose = this.openModals[this.openModals.length - 1];
        }

        // Remove from DOM
        if (contextToClose.overlay && contextToClose.overlay.parentNode) {
            contextToClose.overlay.parentNode.removeChild(contextToClose.overlay);
        }

        // Remove listener
        if (contextToClose.escHandler) {
            document.removeEventListener('keydown', contextToClose.escHandler);
        }

        // Remove from stack
        this.openModals = this.openModals.filter(m => m !== contextToClose);
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

            // Allow onSubmit to return false to prevent closing
            const result = onSubmit(data);
            if (result !== false) {
                this.close();
            }
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
                    // Trigger HTML5 validation
                    if (form.checkValidity()) {
                        form.dispatchEvent(new Event('submit'));
                    } else {
                        form.reportValidity();
                    }
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
