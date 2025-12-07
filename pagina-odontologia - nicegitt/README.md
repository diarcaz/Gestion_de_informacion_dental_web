# Sistema de Gestión Dental 🦷

Sistema completo de gestión para consultorios dentales desarrollado con HTML5, CSS3 y JavaScript vanilla.

## 🌟 Características

- **Gestión de Pacientes**: Expedientes completos con historial clínico, fotos, documentos y etiquetas
- **Agenda de Citas**: Calendario interactivo con estados de citas y validación de horarios
- **Control de Inventario**: Gestión de insumos con alertas de stock bajo y predicciones inteligentes
- **Tratamientos**: Control de tratamientos y pagos con estadísticas
- **Dashboard**: Estadísticas en tiempo real del consultorio
- **Seguridad**: Hashing de contraseñas SHA-256, protección brute force, sesiones con expiración
- **Backup Automático**: Respaldo diario automático de datos

## 🚀 Demo en Vivo

[Ver Demo](https://tu-usuario.github.io/pagina-odontologia)

## 🔐 Credenciales de Prueba

- **Administrador**: `admin` / `admin123`
- **Recepcionista**: `recepcion` / `Recepcion123`

## 📱 Compatibilidad

- ✅ Responsive (móvil, tablet, desktop)
- ✅ Offline-first (localStorage)
- ✅ Sin dependencias externas
- ✅ Compatible con todos los navegadores modernos

## 🛠️ Instalación

### Opción 1: Abrir directamente
```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/pagina-odontologia.git
cd pagina-odontologia

# Abre index.html en tu navegador
```

### Opción 2: Servidor local
```bash
# Python 3
python -m http.server 8080

# Node.js
npx http-server -p 8080

# Luego abre: http://localhost:8080
```

## 📊 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Almacenamiento**: LocalStorage
- **Arquitectura**: Módulos ES6
- **Seguridad**: SHA-256 para hashing de contraseñas

## 📁 Estructura del Proyecto

```
pagina-odontologia/
├── index.html              # Página principal
├── app.js                  # Aplicación principal
├── styles.css              # Estilos globales
├── components/             # Componentes reutilizables
│   ├── modal.js
│   ├── calendar.js
│   ├── notifications.js
│   └── ...
├── modules/                # Módulos de funcionalidad
│   ├── auth.js
│   ├── dashboard.js
│   ├── patients.js
│   ├── appointments.js
│   ├── inventory.js
│   └── treatments.js
├── database/               # Gestión de datos
│   ├── db.js
│   └── schema.json
└── utils/                  # Utilidades
    └── password-hash.js
```

## 🎯 Funcionalidades Principales

### Pacientes
- Expediente completo con datos personales y clínicos
- Historial de tratamientos con timeline
- Subida de fotos y documentos
- Sistema de etiquetas
- Notas privadas
- Impresión de recetas

### Citas
- Calendario interactivo mensual
- Estados: Pendiente, Confirmada, Completada, Cancelada
- Validación de conflictos de horario
- Actualización en tiempo real sin recargas

### Inventario
- Control de stock con alertas automáticas
- Historial de movimientos (compras, uso, ajustes)
- Predicciones de consumo
- Reportes mensuales
- Múltiples categorías

### Tratamientos
- Registro de tratamientos por paciente
- Control de pagos (pendiente/pagado)
- Estadísticas de ingresos
- Búsqueda y filtros

## 🔒 Seguridad

- **Contraseñas**: Hasheadas con SHA-256
- **Validación**: Contraseñas fuertes (8+ caracteres, mayúsculas, números)
- **Brute Force**: Protección con bloqueo temporal (5 intentos / 5 minutos)
- **Sesiones**: Expiración automática después de 8 horas
- **Límites**: Monitoreo de límites de localStorage
- **Backup**: Respaldo automático diario

## ⚠️ Limitaciones

### Almacenamiento
- LocalStorage tiene límite de ~5-10MB (varía por navegador)
- Con fotos en base64: ~10-20 pacientes máximo
- **Solución**: Hacer backup regularmente

### Sin Sincronización
- Cada dispositivo mantiene sus propios datos
- No hay sincronización entre dispositivos
- **Solución futura**: Backend con API REST

### Uso Apropiado
Este sistema es apropiado para:
- ✅ Demos y prototipos
- ✅ Uso personal/familiar
- ✅ Pruebas de concepto
- ✅ Aprendizaje

NO es apropiado para:
- ❌ Producción con datos reales de pacientes (sin cumplimiento HIPAA/GDPR)
- ❌ Múltiples usuarios simultáneos
- ❌ Datos sensibles sin encriptación adicional

## 🧪 Pruebas

### Navegadores Probados
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Edge 120+
- ✅ Safari 17+

### Dispositivos Probados
- ✅ Desktop (Windows, Mac)
- ✅ Móvil (Android, iOS)
- ✅ Tablet

## 📈 Roadmap

### Próximas Mejoras
- [ ] PWA (Progressive Web App)
- [ ] Gráficos con Chart.js
- [ ] Exportar a PDF/Excel
- [ ] Modo oscuro
- [ ] Backend con Node.js/Firebase
- [ ] Sincronización en la nube

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para más detalles

## 👨‍💻 Autor

[Tu Nombre]

## 🙏 Agradecimientos

- Proyecto desarrollado como sistema de gestión dental
- Inspirado en las necesidades reales de consultorios dentales
- Diseño moderno y responsive

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**
