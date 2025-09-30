document.addEventListener('DOMContentLoaded', () => {
    // API URLs
    const IMAGES_API_URL = 'https://lens-b-1.onrender.com/api/images';
    const STATS_API_URL = 'https://lens-b-1.onrender.com/api/view-stats'; // <-- New API URL

    // DOM Elements
    const uploadForm = document.getElementById('upload-form');
    const imageGrid = document.getElementById('image-grid');
    const beforePreview = document.getElementById('before-preview');
    const afterPreview = document.getElementById('after-preview');
    const beforeImageInput = document.getElementById('beforeImage');
    const afterImageInput = document.getElementById('afterImage');
    
    // Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModalButton = document.querySelector('.close-button');

    // Stats Elements
    const uniqueVisitorsCount = document.getElementById('unique-visitors-count');
    const totalViewsCount = document.getElementById('total-views-count');


    // --- NEW FUNCTION TO FETCH AND DISPLAY VIEW STATS ---
    const fetchViewStats = async () => {
        try {
            const response = await fetch(STATS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const stats = await response.json();

            uniqueVisitorsCount.textContent = stats.totalUniqueVisitors.toLocaleString();
            totalViewsCount.textContent = stats.totalViews.toLocaleString();

        } catch (error) {
            console.error('Error fetching view stats:', error);
            uniqueVisitorsCount.textContent = 'Error';
            totalViewsCount.textContent = 'Error';
        }
    };


    const fetchAndDisplayImages = async () => {
        try {
            const response = await fetch(IMAGES_API_URL);
            const images = await response.json();
            imageGrid.innerHTML = '';
            const validImages = images.filter(image => image.beforeImage && image.afterImage);
            
            validImages.forEach(image => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="card-images">
                        <img src="${image.beforeImage.url}" alt="Before">
                        <img src="${image.afterImage.url}" alt="After">
                    </div>
                    <div class="card-content">
                        <h3>${image.title}</h3>
                        <p>${image.description}</p>
                    </div>
                    <div class="card-actions">
                        <div class="like-section">
                            <button class="like-btn" data-id="${image._id}">❤️</button>
                            <span class="like-count" data-id="${image._id}">${image.likes || 0}</span>
                        </div>
                        <div class="action-buttons">
                            <button class="edit-btn" data-id="${image._id}">Edit</button>
                            <button class="delete-btn" data-id="${image._id}">Delete</button>
                        </div>
                    </div>
                `;
                imageGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const showPreview = (input, previewElement) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.src = e.target.result;
                previewElement.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        }
    };
    
    // --- INITIAL DATA FETCH ---
    fetchAndDisplayImages();
    fetchViewStats(); // Fetch stats on initial load
    setInterval(fetchViewStats, 15000); // Refresh stats every 15 seconds

    beforeImageInput.addEventListener('change', () => showPreview(beforeImageInput, beforePreview));
    afterImageInput.addEventListener('change', () => showPreview(afterImageInput, afterPreview));

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        try {
            const response = await fetch(IMAGES_API_URL, { method: 'POST', body: formData });
            if (response.ok) {
                uploadForm.reset();
                beforePreview.style.display = 'none';
                afterPreview.style.display = 'none';
                fetchAndDisplayImages();
            } else {
                const err = await response.json();
                alert(`Upload failed: ${err.message}`);
            }
        } catch (error) {
            console.error('Error uploading:', error);
        }
    });

    imageGrid.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (confirm('Are you sure you want to delete this entry?')) {
                try {
                    const response = await fetch(`${IMAGES_API_URL}/${id}`, { method: 'DELETE' });
                    if (response.ok) fetchAndDisplayImages();
                    else alert('Failed to delete entry');
                } catch (error) { console.error('Error deleting:', error); }
            }
        }

        if (editBtn) {
            const id = editBtn.dataset.id;
            const card = editBtn.closest('.card');
            const title = card.querySelector('h3').textContent;
            const description = card.querySelector('p').textContent;
            editForm.querySelector('#edit-id').value = id;
            editForm.querySelector('#edit-title').value = title;
            editForm.querySelector('#edit-description').value = description;
            editModal.style.display = 'flex';
        }
    });

    // Handle Edit Form Submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editForm.querySelector('#edit-id').value;
        const formData = new FormData(editForm);
        try {
            const response = await fetch(`${IMAGES_API_URL}/${id}`, { method: 'PUT', body: formData });
            if (response.ok) {
                editModal.style.display = 'none';
                editForm.reset();
                fetchAndDisplayImages();
            } else {
                alert('Failed to update entry.');
            }
        } catch (error) {
            console.error('Error updating:', error);
        }
    });

    // Close Modal
    closeModalButton.addEventListener('click', () => { editModal.style.display = 'none'; });
    window.addEventListener('click', (e) => {
        if (e.target == editModal) { editModal.style.display = 'none'; }
    });
});
