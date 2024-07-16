document.getElementById('file-input').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const files = event.target.files;
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = ''; // 清空现有内容

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'image-item';
            div.setAttribute('data-index', index);

            const img = document.createElement('img');
            img.src = e.target.result;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = () => {
                div.remove(); // 删除图片
            };

            div.appendChild(img);
            div.appendChild(deleteBtn);
            imageContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });

    // Initialize SortableJS
    new Sortable(imageContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
    });
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const orientation = document.getElementById('orientation').value;
    const pdf = new jsPDF({ orientation: orientation });
    const imageItems = document.querySelectorAll('.image-item');

    for (let i = 0; i < imageItems.length; i++) {
        const imgElement = imageItems[i].querySelector('img');
        const imgData = imgElement.src;

        await new Promise(resolve => {
            const img = new Image();
            img.src = imgData;

            img.onload = () => {
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                // 计算图片的缩放比例
                const imgWidth = img.width;
                const imgHeight = img.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

                const width = imgWidth * ratio;
                const height = imgHeight * ratio;

                const x = (pdfWidth - width) / 2;
                const y = (pdfHeight - height) / 2;

                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(img, 'JPEG', x, y, width, height);
                resolve();
            };
        });
    }

    pdf.save('output.pdf');
}

const translations = {
    en: {
        title: "Upload and Sort Images",
        orientation: "Orientation:",
        portrait: "Portrait",
        landscape: "Landscape",
        generate: "Generate PDF"
    },
    zh: {
        title: "上传和排序图片",
        orientation: "方向:",
        portrait: "纵向",
        landscape: "横向",
        generate: "生成 PDF"
    }
};

function setLanguage(lang) {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        element.textContent = translations[lang][key];
    });
}

// Set default language to English
setLanguage('en');

// Modal functionality
const modalContainer = document.getElementById('modal-container');
const modalImg = document.getElementById('modal-img');
const closeModal = document.getElementsByClassName('close')[0];

document.getElementById('image-container').addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG') {
        modalImg.src = e.target.src;
        modalContainer.style.display = 'flex';
    }
});

closeModal.onclick = function() {
    modalContainer.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target === modalContainer) {
        modalContainer.style.display = 'none';
    }
};
