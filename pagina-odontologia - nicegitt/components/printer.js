// ============================================
// PRINTER UTILITY COMPONENT
// ============================================

class Printer {
    constructor() {
        this.clinicInfo = {
            name: 'Clínica Dental',
            doctor: 'Dr. Admin',
            address: 'Calle Principal #123, Ciudad',
            phone: '(555) 123-4567',
            email: 'contacto@clinicadental.com'
        };
    }

    // Helper to create a standardized print header
    getHeader() {
        return `
            <div class="print-header" style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #333; padding-bottom: 1rem;">
                <h1 style="margin: 0; color: #0077BE;">${this.clinicInfo.name}</h1>
                <p style="margin: 0.5rem 0;">${this.clinicInfo.address}</p>
                <p style="margin: 0;">Tel: ${this.clinicInfo.phone} | Email: ${this.clinicInfo.email}</p>
            </div>
        `;
    }

    // Helper to print a specific customized content string
    printDocument(title, content) {
        // Create a hidden iframe or open new window
        const printWindow = window.open('', '_blank');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body {
                        font-family: 'Segoe UI', system-ui, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 2rem;
                        background: white;
                    }
                    .print-footer {
                        margin-top: 3rem;
                        text-align: center;
                        font-size: 0.9rem;
                        color: #666;
                        border-top: 1px solid #ddd;
                        padding-top: 1rem;
                    }
                    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    
                    @media print {
                        .no-print { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${this.getHeader()}
                
                <div class="content">
                    ${content}
                </div>

                <div class="print-footer">
                    <p>Documento generado el ${new Date().toLocaleString('es-MX')}</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        // Optional: close window after print
                        // window.onafterprint = function() { window.close(); }
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    }

    // Specific method for Prescriptions
    printPrescription(patient, medications, notes = '') {
        const content = `
            <div style="margin-bottom: 2rem;">
                <h2 style="text-align: center; margin-bottom: 2rem;">RECETA MÉDICA</h2>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; background: #f9f9f9; padding: 1rem; border-radius: 8px;">
                    <div>
                        <strong>Paciente:</strong> ${patient.name}<br>
                        <strong>Edad:</strong> ${patient.age} años<br>
                        <strong>Folio:</strong> ${patient.id}
                    </div>
                    <div style="text-align: right;">
                        <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX')}<br>
                        <strong>Médico:</strong> ${this.clinicInfo.doctor}
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h3>💊 Medicamentos Previstos</h3>
                    <div style="white-space: pre-wrap; font-size: 1.1rem; line-height: 1.8;">${medications}</div>
                </div>

                ${notes ? `
                <div style="margin-bottom: 2rem;">
                    <h3>📝 Indicaciones Adicionales</h3>
                    <div style="white-space: pre-wrap;">${notes}</div>
                </div>
                ` : ''}
            </div>

            <div style="margin-top: 4rem; display: flex; justify-content: space-between;">
                <div style="text-align: center; width: 45%;">
                    <div style="border-top: 1px solid #333; padding-top: 0.5rem;">Firma del Paciente</div>
                </div>
                <div style="text-align: center; width: 45%;">
                    <div style="border-top: 1px solid #333; padding-top: 0.5rem;">Firma del Médico</div>
                </div>
            </div>
        `;

        this.printDocument(`Receta - ${patient.name}`, content);
    }

    // Specific method for Medical History
    printHistory(patient, treatments = []) {
        const content = `
            <div style="margin-bottom: 2rem;">
                <h2 style="text-align: center; margin-bottom: 2rem;">HISTORIA CLÍNICA</h2>
                
                <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <strong>Paciente:</strong> ${patient.name}<br>
                            <strong>Teléfono:</strong> ${patient.phone}<br>
                            <strong>Tipo de Sangre:</strong> ${patient.bloodType || 'N/A'}
                        </div>
                        <div>
                            <strong>Email:</strong> ${patient.email}<br>
                            <strong>Dirección:</strong> ${patient.address || 'N/A'}<br>
                            <strong>Alergias:</strong> ${patient.allergies || 'Ninguna conocida'}
                        </div>
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ddd;">
                        <strong>Antecedentes Médicos:</strong><br>
                        ${patient.medicalHistory || 'Sin antecedentes registrados'}
                    </div>
                </div>

                <h3>📋 Historial de Tratamientos</h3>
                ${treatments.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tratamiento</th>
                            <th>Dientes</th>
                            <th>Costo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${treatments.map(t => `
                            <tr>
                                <td>${new Date(t.date).toLocaleDateString('es-MX')}</td>
                                <td>
                                    <strong>${t.description}</strong><br>
                                    <small>${t.notes || ''}</small>
                                </td>
                                <td>${t.teeth ? t.teeth.join(', ') : 'General'}</td>
                                <td>$${t.cost.toFixed(2)}</td>
                                <td>${t.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p>No hay tratamientos registrados.</p>'}
            </div>
        `;

        this.printDocument(`Historia Clínica - ${patient.name}`, content);
    }
}

const printer = new Printer();
export default printer;
