# 🦷 Sistema de Gestión de Consultorio Dental

Sistema web completo y moderno para la administración de consultorios dentales, desarrollado con HTML, CSS y JavaScript vanilla.

![Dental Clinic](https://img.shields.io/badge/Versión-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Características Principales

### 👥 Gestión de Pacientes
- Registro completo de pacientes con información personal
- Historial médico detallado
- Búsqueda y filtrado rápido
- Visualización de historial de citas por paciente
- Operaciones CRUD completas

### 📅 Gestión de Citas
- Calendario interactivo mensual
- Programación de citas con validación de horarios
- Estados de citas (Pendiente, Confirmada, Completada, Cancelada)
- Vista de citas del día
- Prevención de conflictos de horarios

### 📦 Control de Inventario
- Gestión de insumos y materiales dentales
- Alertas automáticas de stock bajo
- Categorización de productos
- Búsqueda y filtrado por categoría
- Seguimiento de proveedores y precios
- Estadísticas de valor total del inventario

### 📊 Dashboard
- Resumen de estadísticas clave
- Citas del día
- Alertas de inventario
- Pacientes recientes
- Métricas en tiempo real

## 🎨 Diseño

### Paleta de Colores Odontológicos
- **Azul Dental**: #0077BE (Color principal profesional)
- **Verde Menta**: #98D8C8 (Frescura y limpieza)
- **Blanco**: #FFFFFF (Pureza y profesionalismo)
- **Gris Claro**: #F7F9FC (Fondo suave)

### Características Visuales
- ✓ Diseño moderno con glassmorphism
- ✓ Gradientes suaves y elegantes
- ✓ Animaciones y transiciones fluidas
- ✓ Iconografía intuitiva
- ✓ Tipografía premium (Poppins e Inter)

## 📱 Responsive Design

El sistema está completamente optimizado para:
- 📱 **Móviles**: < 768px
- 📱 **Tablets**: 768px - 1024px
- 💻 **Desktop**: > 1024px

Características responsive:
- Menú hamburguesa en dispositivos móviles
- Tablas scrollables
- Grids adaptativos
- Formularios optimizados para touch

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Soporte para ES6 Modules
- LocalStorage habilitado

### Instalación

1. **Descarga los archivos**
   ```bash
   # Clona o descarga el repositorio
   cd pagina-odontologia
   ```

2. **Inicia un servidor local**
   
   Opción 1 - Python:
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   
   Opción 2 - Node.js:
   ```bash
   # Si tienes npx instalado
   npx http-server
   ```
   
   Opción 3 - VS Code:
   - Instala la extensión "Live Server"
   - Click derecho en `index.html` → "Open with Live Server"

3. **Abre en el navegador**
   ```
   http://localhost:8000
   ```

### Uso Rápido

1. **Dashboard**: Vista general del consultorio
2. **Pacientes**: Agrega y gestiona información de pacientes
3. **Citas**: Programa y administra citas en el calendario
4. **Inventario**: Controla tus insumos y materiales

## 📁 Estructura del Proyecto

```
pagina-odontologia/
├── index.html                 # Página principal
├── styles.css                 # Estilos globales y sistema de diseño
├── app.js                     # Aplicación principal y navegación
├── README.md                  # Documentación
│
├── database/
│   ├── db.js                  # Sistema de base de datos (LocalStorage)
│   └── schema.json            # Esquema y datos de ejemplo
│
├── components/
│   ├── modal.js               # Componente de modal reutilizable
│   ├── notifications.js       # Sistema de notificaciones toast
│   └── calendar.js            # Componente de calendario
│
└── modules/
    ├── dashboard.js           # Módulo del dashboard
    ├── patients.js            # Módulo de gestión de pacientes
    ├── appointments.js        # Módulo de gestión de citas
    └── inventory.js           # Módulo de gestión de inventario
```

## 💾 Almacenamiento de Datos

El sistema utiliza **LocalStorage** del navegador para almacenar todos los datos:

- ✓ Persistencia automática
- ✓ No requiere servidor backend
- ✓ Datos accesibles offline
- ✓ Exportación de datos en formato JSON

### Exportar Datos

Desde el menú lateral:
1. Click en "Exportar Datos"
2. Se descargará un archivo JSON con toda la información
3. Guarda este archivo como respaldo

### Importar Datos

Para restaurar datos:
1. Abre la consola del navegador (F12)
2. Ejecuta: `db.importData(jsonString)`

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con variables CSS, Grid y Flexbox
- **JavaScript ES6+**: Módulos, clases, async/await
- **LocalStorage API**: Persistencia de datos
- **Google Fonts**: Tipografía premium

## 🌟 Funcionalidades Destacadas

### Validaciones
- ✓ Formularios con validación en tiempo real
- ✓ Prevención de citas duplicadas
- ✓ Validación de horarios de trabajo
- ✓ Campos requeridos marcados

### Notificaciones
- ✓ Feedback visual para todas las acciones
- ✓ Mensajes de éxito, error y advertencia
- ✓ Animaciones suaves

### Búsqueda y Filtros
- ✓ Búsqueda instantánea en pacientes
- ✓ Búsqueda en inventario
- ✓ Filtrado por categorías
- ✓ Resultados en tiempo real

## 📊 Datos de Ejemplo

El sistema incluye datos de ejemplo para demostración:
- 3 pacientes de muestra
- 4 citas programadas
- 8 productos en inventario

Puedes eliminar estos datos y comenzar con tu propia información.

## 🔒 Seguridad y Privacidad

- Los datos se almacenan localmente en tu navegador
- No se envía información a servidores externos
- Limpia el LocalStorage para eliminar todos los datos
- Recomendado para uso en computadoras personales

## 🎯 Casos de Uso

Ideal para:
- Consultorios dentales pequeños y medianos
- Dentistas independientes
- Clínicas familiares
- Estudiantes de odontología
- Demostración de sistemas de gestión

## 🐛 Solución de Problemas

### La aplicación no carga
- Verifica que estés usando un servidor local (no `file://`)
- Asegúrate de que tu navegador soporte ES6 modules
- Revisa la consola del navegador (F12) para errores

### Los datos no se guardan
- Verifica que LocalStorage esté habilitado
- Revisa el espacio disponible en LocalStorage
- Intenta limpiar la caché del navegador

### Problemas de visualización
- Actualiza tu navegador a la última versión
- Limpia la caché del navegador
- Verifica que los archivos CSS se carguen correctamente

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo libremente para proyectos personales o comerciales.

## 👨‍💻 Desarrollo

### Personalización

Para personalizar los colores:
1. Edita las variables CSS en `styles.css` (líneas 10-30)
2. Modifica los colores principales
3. Los cambios se aplicarán automáticamente

### Agregar Nuevas Funcionalidades

1. Crea un nuevo módulo en `modules/`
2. Importa el módulo en `app.js`
3. Agrega la navegación en el sidebar
4. Implementa el método `render()`

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:
1. Haz un fork del proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Soporte

Para preguntas o soporte:
- Abre un issue en el repositorio
- Revisa la documentación
- Consulta el código fuente

## 🎉 Agradecimientos

Desarrollado con ❤️ para la comunidad odontológica.

---

**¡Disfruta gestionando tu consultorio dental de manera eficiente y moderna!** 🦷✨
