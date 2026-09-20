const STORAGE_KEY = 'metteBirthdayGallery';
const SELECTED_IMAGE_KEY = 'metteBirthdaySelectedImage';
const MAX_IMAGE_SIZE = 1200;

const loadEntries = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load gallery entries:', error);
    return [];
  }
};

const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const loadSelectedImage = () => {
  try {
    return localStorage.getItem(SELECTED_IMAGE_KEY);
  } catch (error) {
    console.error('Failed to load selected image:', error);
    return null;
  }
};

const saveSelectedImage = (dataUrl) => {
  try {
    localStorage.setItem(SELECTED_IMAGE_KEY, dataUrl);
  } catch (error) {
    console.error('Failed to save selected image:', error);
  }
};

const clearSelectedImage = () => {
  localStorage.removeItem(SELECTED_IMAGE_KEY);
};

const getImageDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Image could not be read.'));
    reader.readAsDataURL(file);
  });
};

const compressImage = (dataUrl, maxSize = MAX_IMAGE_SIZE) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressed = canvas.toDataURL('image/jpeg', 0.82);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Image compression failed.'));
    img.src = dataUrl;
  });
};

const renderGallery = () => {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  const entries = loadEntries();

  if (!entries.length) {
    gallery.innerHTML = `
      <div class="empty-state">
        <p>No photos yet. Add the first memory.</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = entries
    .slice()
    .reverse()
    .map(
      (entry) => `
        <article class="gallery-item">
          <img src="${entry.image}" alt="${entry.text || 'Uploaded memory'}" />
          <div class="gallery-content">
            <p>${escapeHtml(entry.text || 'No message added.')}</p>
          </div>
        </article>
      `
    )
    .join('');
};

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const setupUploadPage = () => {
  const form = document.getElementById('uploadForm');
  const photoInput = document.getElementById('photoInput');
  const cameraInput = document.getElementById('cameraInput');
  const previewWrap = document.getElementById('previewWrap');
  const imagePreview = document.getElementById('imagePreview');

  if (!form || !photoInput || !cameraInput || !previewWrap || !imagePreview) return;

  const selectedImage = loadSelectedImage();
  if (selectedImage) {
    imagePreview.src = selectedImage;
    previewWrap.classList.remove('hidden');
  }

  const handlePhotoSelected = async (event) => {
    const [file] = event.target.files;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      event.target.value = '';
      return;
    }

    try {
      const rawDataUrl = await getImageDataUrl(file);
      const compressed = await compressImage(rawDataUrl, 1200);
      saveSelectedImage(compressed);
      imagePreview.src = compressed;
      previewWrap.classList.remove('hidden');
    } catch (error) {
      console.error(error);
      alert('The selected photo could not be loaded. Please try again.');
    }
  };

  photoInput.addEventListener('change', handlePhotoSelected);
  cameraInput.addEventListener('change', handlePhotoSelected);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const imageFromStorage = loadSelectedImage();
    const file = cameraInput.files[0] || photoInput.files[0];
    const message = document.getElementById('messageInput').value.trim();

    if (!file && !imageFromStorage) {
      alert('Please take a photo or choose one from your phone first.');
      return;
    }

    try {
      const image = file ? await compressImage(await getImageDataUrl(file), 1200) : imageFromStorage;
      const entries = loadEntries();

      entries.push({
        id: Date.now(),
        image,
        text: message || 'A special memory',
      });

      saveEntries(entries);
      clearSelectedImage();
      form.reset();
      previewWrap.classList.add('hidden');
      imagePreview.src = '';
      photoInput.value = '';
      cameraInput.value = '';
      document.getElementById('messageInput').value = '';
    } catch (error) {
      console.error(error);
      alert('Something went wrong while saving your photo. Please try again.');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  setupUploadPage();
});
