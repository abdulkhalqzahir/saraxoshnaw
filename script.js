document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.getElementById('add-btn');
    const photoUpload = document.getElementById('photo-upload');
    const photoPrice = document.getElementById('photo-price');
    const gallery = document.getElementById('photo-gallery');

    // بارکردنی داتا لە Local Storage
    loadPhotos();

    addBtn.addEventListener('click', function() {
        const file = photoUpload.files[0];
        const price = photoPrice.value.trim();

        if (!file) {
            showAlert('تکایە وێنەیەک هەڵبژێرە!', 'error');
            return;
        }

        if (!price) {
            showAlert('تکایە نرخی وێنە بنووسە!', 'error');
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const photoData = {
                id: Date.now(),
                image: e.target.result,
                price: price,
                date: new Date().toISOString()
            };

            addPhotoToGallery(photoData);
            savePhoto(photoData);
            
            // پاککردنەوەی خانەکان
            photoUpload.value = '';
            photoPrice.value = '';
            
            showAlert('وێنە بەسەرکەوتوویی زیادکرا!', 'success');
        };

        reader.readAsDataURL(file);
    });

    function addPhotoToGallery(photoData) {
        const emptyState = gallery.querySelector('.empty-state');
        if (emptyState) {
            gallery.removeChild(emptyState);
        }

        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        photoCard.dataset.id = photoData.id;
        
        photoCard.innerHTML = `
            <img src="${photoData.image}" alt="وێنە" class="photo-img">
            <div class="photo-details">
                <div class="photo-price">
                    <span>${photoData.price}</span> دینار
                </div>
                <small>${new Date(photoData.date).toLocaleString('ar-EG')}</small>
                <div class="photo-actions">
                    <button class="print-btn" onclick="printPhoto(this)">چاپکردن</button>
                    <button class="delete-btn" onclick="deletePhoto(this)">سڕینەوە</button>
                </div>
            </div>
        `;
        
        gallery.appendChild(photoCard);
    }

    function savePhoto(photoData) {
        let photos = JSON.parse(localStorage.getItem('photos')) || [];
        photos.push(photoData);
        localStorage.setItem('photos', JSON.stringify(photos));
    }

    function loadPhotos() {
        const photos = JSON.parse(localStorage.getItem('photos')) || [];
        
        if (photos.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="هیچ وێنەیەک نیە">
                    <h3>هیچ وێنەیەک نیە</h3>
                    <p>وێنە و نرخی زیاد بکە بۆ دەستپێکردن</p>
                </div>
            `;
            return;
        }

        photos.forEach(photo => {
            addPhotoToGallery(photo);
        });
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 3000);
    }

    window.printPhoto = function(btn) {
        const photoCard = btn.closest('.photo-card');
        const imgSrc = photoCard.querySelector('img').src;
        const price = photoCard.querySelector('.photo-price span').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>چاپی وێنە</title>
                    <style>
                        body { 
                            text-align: center; 
                            padding: 2rem; 
                            font-family: 'Tajawal', sans-serif;
                        }
                        img { 
                            max-width: 100%; 
                            height: auto;
                            max-height: 500px;
                            border-radius: 8px;
                        }
                        .price { 
                            font-size: 1.8rem; 
                            margin-top: 1.5rem; 
                            font-weight: bold;
                            color: #6a1b9a;
                        }
                        .date {
                            color: #757575;
                            margin-top: 1rem;
                        }
                    </style>
                </head>
                <body>
                    <img src="${imgSrc}">
                    <div class="price">نرخ: ${price} دینار</div>
                    <div class="date">${new Date().toLocaleString('ar-EG')}</div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 200);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    window.deletePhoto = function(btn) {
        if (confirm('دڵنیای لە سڕینەوەی ئەم وێنەیە؟')) {
            const photoCard = btn.closest('.photo-card');
            const photoId = parseInt(photoCard.dataset.id);
            
            // سڕینەوە لە Local Storage
            let photos = JSON.parse(localStorage.getItem('photos')) || [];
            photos = photos.filter(photo => photo.id !== photoId);
            localStorage.setItem('photos', JSON.stringify(photos));
            
            // سڕینەوە لە نمایش
            photoCard.remove();
            
            if (gallery.children.length === 0) {
                gallery.innerHTML = `
                    <div class="empty-state">
                        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="هیچ وێنەیەک نیە">
                        <h3>هیچ وێنەیەک نیە</h3>
                        <p>وێنە و نرخی زیاد بکە بۆ دەستپێکردن</p>
                    </div>
                `;
            }
            
            showAlert('وێنە بەسەرکەوتوویی سڕایەوە!', 'success');
        }
    };
});

// زیادکردنی شێوازی ئاگاداری
const style = document.createElement('style');
style.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transition: opacity 0.3s ease;
    }
    .alert-error {
        background-color: #e74c3c;
    }
    .alert-success {
        background-color: #2ecc71;
    }
`;
document.head.appendChild(style);