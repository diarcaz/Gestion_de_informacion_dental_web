// ============================================
// IMAGE VIEWER COMPONENT
// ============================================

class ImageViewer {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.isOpen = false;
    }

    // Open viewer with images
    open(images, startIndex = 0) {
        this.images = Array.isArray(images) ? images : [images];
        this.currentIndex = startIndex;
        this.isOpen = true;
        this.render();
        this.setupEventListeners();
    }

    // Close viewer
    close() {
        const viewer = document.getElementById('image-viewer');
        if (viewer) {
            viewer.remove();
        }
        this.isOpen = false;
        this.images = [];
        this.currentIndex = 0;
    }

    // Render viewer
    render() {
        // Remove existing viewer
        const existing = document.getElementById('image-viewer');
        if (existing) existing.remove();

        const viewer = document.createElement('div');
        viewer.id = 'image-viewer';
        viewer.className = 'image-viewer-overlay';

        const currentImage = this.images[this.currentIndex];
        const imageData = typeof currentImage === 'string' ? currentImage : currentImage.data;
        const imageName = typeof currentImage === 'string' ? 'Imagen' : currentImage.name;

        viewer.innerHTML = `
      <div class="image-viewer-container">
        <div class="image-viewer-header">
          <div class="image-viewer-title">
            <span>${imageName}</span>
            <span class="image-viewer-counter">${this.currentIndex + 1} / ${this.images.length}</span>
          </div>
          <div class="image-viewer-controls">
            <button class="image-viewer-btn" onclick="imageViewer.download()" title="Descargar">
              💾
            </button>
            <button class="image-viewer-btn" onclick="imageViewer.rotate()" title="Rotar">
              🔄
            </button>
            <button class="image-viewer-btn" onclick="imageViewer.close()" title="Cerrar">
              ×
            </button>
          </div>
        </div>
        
        <div class="image-viewer-content">
          ${this.images.length > 1 ? `
            <button class="image-viewer-nav image-viewer-prev" onclick="imageViewer.prev()">
              ‹
            </button>
          ` : ''}
          
          <div class="image-viewer-image-container">
            <img 
              src="${imageData}" 
              alt="${imageName}"
              class="image-viewer-image"
              id="viewer-image"
            >
          </div>
          
          ${this.images.length > 1 ? `
            <button class="image-viewer-nav image-viewer-next" onclick="imageViewer.next()">
              ›
            </button>
          ` : ''}
        </div>

        ${this.images.length > 1 ? `
          <div class="image-viewer-thumbnails">
            ${this.images.map((img, index) => {
            const thumbData = typeof img === 'string' ? img : img.data;
            return `
                <div 
                  class="image-viewer-thumbnail ${index === this.currentIndex ? 'active' : ''}"
                  onclick="imageViewer.goTo(${index})"
                >
                  <img src="${thumbData}" alt="Thumbnail ${index + 1}">
                </div>
              `;
        }).join('')}
          </div>
        ` : ''}
      </div>
    `;

        document.body.appendChild(viewer);

        // Animate in
        setTimeout(() => {
            viewer.classList.add('active');
        }, 10);
    }

    // Setup event listeners
    setupEventListeners() {
        // Keyboard navigation
        const keyHandler = (e) => {
            if (!this.isOpen) return;

            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
            }
        };

        document.addEventListener('keydown', keyHandler);

        // Click outside to close
        const viewer = document.getElementById('image-viewer');
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                this.close();
            }
        });
    }

    // Navigate to specific image
    goTo(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.updateImage();
        }
    }

    // Previous image
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateImage();
        }
    }

    // Next image
    next() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.updateImage();
        }
    }

    // Update displayed image
    updateImage() {
        const img = document.getElementById('viewer-image');
        const currentImage = this.images[this.currentIndex];
        const imageData = typeof currentImage === 'string' ? currentImage : currentImage.data;
        const imageName = typeof currentImage === 'string' ? 'Imagen' : currentImage.name;

        if (img) {
            img.src = imageData;
            img.alt = imageName;
        }

        // Update title and counter
        const title = document.querySelector('.image-viewer-title span');
        const counter = document.querySelector('.image-viewer-counter');
        if (title) title.textContent = imageName;
        if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;

        // Update thumbnails
        const thumbnails = document.querySelectorAll('.image-viewer-thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
    }

    // Rotate image
    rotate() {
        const img = document.getElementById('viewer-image');
        if (!img) return;

        const currentRotation = parseInt(img.dataset.rotation || '0');
        const newRotation = (currentRotation + 90) % 360;
        img.dataset.rotation = newRotation;
        img.style.transform = `rotate(${newRotation}deg)`;
    }

    // Download image
    download() {
        const currentImage = this.images[this.currentIndex];
        const imageData = typeof currentImage === 'string' ? currentImage : currentImage.data;
        const imageName = typeof currentImage === 'string' ? 'imagen.jpg' : currentImage.name;

        const link = document.createElement('a');
        link.href = imageData;
        link.download = imageName;
        link.click();
    }
}

// Export instance
const imageViewer = new ImageViewer();
window.imageViewer = imageViewer;
export default imageViewer;
