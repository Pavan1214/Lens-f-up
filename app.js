document.addEventListener('DOMContentLoaded', () => {
    // API base URL
    const API_URL = 'https://lens-b-1.onrender.com/api/images';

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

    // --- Functions ---

    // Fetch and display all images
  // Replace the existing function in before-after-app/frontend/app.js

const fetchAndDisplayImages = async () => {
    try {
        const response = await fetch(API_URL);
        const images = await response.json();
        
        imageGrid.innerHTML = ''; // Clear the grid

        // **THIS IS THE FIX**: First, filter the array to only include valid items
        const validImages = images.filter(image => image.beforeImage && image.afterImage);
        
        // Then, loop over the clean, filtered array
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
                    <button class="edit-btn" data-id="${image._id}">Edit</button>
                    <button class="delete-btn" data-id="${image._id}">Delete</button>
                </div>
            `;
            imageGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching images:', error);
    }
};

    // Show image preview
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
    
    // --- Event Listeners ---

    // Initial load
    fetchAndDisplayImages();

    // Image preview listeners
    beforeImageInput.addEventListener('change', () => showPreview(beforeImageInput, beforePreview));
    afterImageInput.addEventListener('change', () => showPreview(afterImageInput, afterPreview));

    // Handle new image upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                uploadForm.reset();
                beforePreview.style.display = 'none';
                afterPreview.style.display = 'none';
                fetchAndDisplayImages(); // Refresh the grid
            } else {
                const err = await response.json();
                alert(`Upload failed: ${err.message}`);
            }
        } catch (error) {
            console.error('Error uploading:', error);
        }
    });

    // Handle clicks on Edit/Delete buttons (Event Delegation)
 // Replace the entire imageGrid.addEventListener function with this one

imageGrid.addEventListener('click', async (e) => {
    // Use .closest() to reliably find the button, even if an inner element is clicked
    const deleteBtn = e.target.closest('.delete-btn');
    const editBtn = e.target.closest('.edit-btn');

    // --- DELETE ---
    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchAndDisplayImages(); // Refresh the grid
                } else {
                    alert('Failed to delete entry');
                }
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    }

    // --- EDIT (Open Modal) ---
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
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                editModal.style.display = 'none'; // Hide modal
                editForm.reset();
                fetchAndDisplayImages(); // Refresh the grid
            } else {
                alert('Failed to update entry.');
            }
        } catch (error) {
            console.error('Error updating:', error);
        }
    });

    // Close Modal
    closeModalButton.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == editModal) {
            editModal.style.display = 'none';
        }
    });
});