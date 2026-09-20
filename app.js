const STORAGE_KEY = 'metteBirthdayGallery';

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

const getImageDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Image could not be read.'));
    reader.readAsDataURL(file);
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

  const handlePhotoSelected = (event) => {
    const [file] = event.target.files;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      event.target.value = '';
      return;
    }

    // Clear the other input so the selected camera photo is the one saved.
    if (event.target === cameraInput) photoInput.value = '';
    if (event.target === photoInput) cameraInput.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
      previewWrap.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  };

  photoInput.addEventListener('change', handlePhotoSelected);
  cameraInput.addEventListener('change', handlePhotoSelected);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = cameraInput.files[0] || photoInput.files[0];
    const message = document.getElementById('messageInput').value.trim();

    if (!file) {
      alert('Please take a photo or choose one from your phone first.');
      return;
    }

    try {
      const image = await getImageDataUrl(file);
      const entries = loadEntries();

      entries.push({
        id: Date.now(),
        image,
        text: message || 'A special memory',
      });

      saveEntries(entries);
      form.reset();
      previewWrap.classList.add('hidden');
      imagePreview.src = '';
      window.location.href = 'gallery.html';
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
