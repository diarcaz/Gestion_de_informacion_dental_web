// ============================================
// FILE UPLOAD COMPONENT
// ============================================

class FileUpload {
  constructor() {
    this.maxFileSize = 2 * 1024 * 1024; // 2MB
    this.acceptedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    this.acceptedDocTypes = ['application/pdf', ...this.acceptedImageTypes];
  }

  // Create file upload UI
  createUploadUI(options = {}) {
    const {
      accept = 'image/*',
      multiple = false,
      maxSize = this.maxFileSize,
      onUpload = null,
      label = 'Seleccionar archivo'
    } = options;

    const uploadId = `upload-${Date.now()}`;

    return `
      <div class="file-upload-container" id="${uploadId}">
        <div class="file-upload-dropzone" data-upload-id="${uploadId}">
          <div class="file-upload-icon">📁</div>
          <p class="file-upload-text">
            Arrastra archivos aquí o 
            <label class="file-upload-label">
              <span class="file-upload-button">${label}</span>
              <input 
                type="file" 
                accept="${accept}" 
                ${multiple ? 'multiple' : ''} 
                class="file-upload-input"
                data-upload-id="${uploadId}"
              >
            </label>
          </p>
          <p class="file-upload-hint">Tamaño máximo: ${this.formatFileSize(maxSize)}</p>
        </div>
        <div class="file-upload-preview" id="preview-${uploadId}"></div>
      </div>
    `;
  }

  // Initialize upload functionality
  init(uploadId, callback) {
    const container = document.getElementById(uploadId);
    if (!container) return;

    const dropzone = container.querySelector('.file-upload-dropzone');
    const input = container.querySelector('.file-upload-input');
    const preview = container.querySelector('.file-upload-preview');

    // File input change
    input.addEventListener('change', (e) => {
      this.handleFiles(e.target.files, preview, callback);
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files, preview, callback);
    });
  }

  // Handle file selection
  async handleFiles(files, previewContainer, callback) {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        if (window.notify) {
          window.notify.error(validation.message);
        }
        continue;
      }

      // Read file
      const fileData = await this.readFile(file);
      
      // Create preview
      this.createPreview(file, fileData, previewContainer);

      // Callback with file data
      if (callback) {
        callback({
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileData,
          uploadDate: new Date().toISOString()
        });
      }
    }
  }

  // Validate file
  validateFile(file) {
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        message: `El archivo es demasiado grande. Máximo ${this.formatFileSize(this.maxFileSize)}`
      };
    }

    const isImage = this.acceptedImageTypes.includes(file.type);
    const isDoc = this.acceptedDocTypes.includes(file.type);

    if (!isImage && !isDoc) {
      return {
        valid: false,
        message: 'Tipo de archivo no soportado'
      };
    }

    return { valid: true };
  }

  // Read file as base64
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        let result = e.target.result;
        
        // Compress image if needed
        if (file.type.startsWith('image/')) {
          result = await this.compressImage(result, file.type);
        }
        
        resolve(result);
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Compress image
  compressImage(base64, mimeType) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if too large
        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress
        const quality = 0.8;
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.src = base64;
    });
  }

  // Create preview
  createPreview(file, fileData, container) {
    const previewItem = document.createElement('div');
    previewItem.className = 'file-preview-item';

    if (file.type.startsWith('image/')) {
      previewItem.innerHTML = `
        <div class="file-preview-image">
          <img src="${fileData}" alt="${file.name}">
        </div>
        <div class="file-preview-info">
          <p class="file-preview-name">${file.name}</p>
          <p class="file-preview-size">${this.formatFileSize(file.size)}</p>
        </div>
        <button class="file-preview-remove" onclick="this.parentElement.remove()">×</button>
      `;
    } else {
      previewItem.innerHTML = `
        <div class="file-preview-icon">📄</div>
        <div class="file-preview-info">
          <p class="file-preview-name">${file.name}</p>
          <p class="file-preview-size">${this.formatFileSize(file.size)}</p>
        </div>
        <button class="file-preview-remove" onclick="this.parentElement.remove()">×</button>
      `;
    }

    container.appendChild(previewItem);
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export instance
const fileUpload = new FileUpload();
window.fileUpload = fileUpload;
export default fileUpload;
