// Khởi tạo hoặc lấy dữ liệu từ localStorage
let grammarData = JSON.parse(localStorage.getItem('grammarData')) || [];

// Khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderGrammarList();
    updateLessonFilter(); // Đồng bộ dropdown bài học tự động khi mở trang

    // Lắng nghe sự kiện Form
    document.getElementById('grammarForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelBtn').addEventListener('click', resetForm);

    // Lắng nghe sự kiện Tìm kiếm và Lọc dữ liệu
    document.getElementById('searchInput').addEventListener('input', renderGrammarList);
    document.getElementById('lessonFilter').addEventListener('change', renderGrammarList);

    // Lắng nghe sự kiện Sao lưu / Khôi phục
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importFile').addEventListener('change', importData);
}

// 1 + 2 + 4. Cập nhật và sắp xếp động bộ lọc bài học (Lesson Filter)
function updateLessonFilter() {
    const lessonSelect = document.getElementById('lessonFilter');
    if (!lessonSelect) return;

    // Lưu lại giá trị đang chọn trước khi refresh dropdown
    const currentSelected = lessonSelect.value;

    // Lấy danh sách các bài học duy nhất (Unique) không rỗng
    const uniqueLessons = [...new Set(grammarData.map(item => item.lesson ? item.lesson.trim() : '').filter(Boolean))];

    // Sắp xếp tăng dần theo số (Ví dụ: "Lesson 1" < "Lesson 2" < "Lesson 10")
    uniqueLessons.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    // Làm mới dropdown, giữ lại lựa chọn mặc định "Tất cả"
    lessonSelect.innerHTML = '<option value="">Tất cả bài học</option>';
    
    uniqueLessons.forEach(lesson => {
        const option = document.createElement('option');
        option.value = lesson;
        option.textContent = lesson;
        lessonSelect.appendChild(option);
    });

    // Khôi phục lại lựa chọn trước đó nếu bài học đó vẫn tồn tại
    if (uniqueLessons.includes(currentSelected)) {
        lessonSelect.value = currentSelected;
    } else {
        lessonSelect.value = "";
    }
}

// Render danh sách cấu trúc ngữ pháp có kèm bộ lọc
function renderGrammarList() {
    const listContainer = document.getElementById('grammarList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedLesson = document.getElementById('lessonFilter') ? document.getElementById('lessonFilter').value : '';

    listContainer.innerHTML = '';

    // Lọc dữ liệu theo từ khóa tìm kiếm và theo bài học đang chọn
    const filteredData = grammarData.filter(item => {
        const matchesSearch = item.grammar.toLowerCase().includes(searchTerm) || item.meaning.toLowerCase().includes(searchTerm);
        const matchesLesson = selectedLesson === '' || item.lesson === selectedLesson;
        return matchesSearch && matchesLesson;
    });

    if (filteredData.length === 0) {
        listContainer.innerHTML = '<p class="empty-msg">Không tìm thấy dữ liệu phù hợp.</p>';
        return;
    }

    filteredData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'grammar-item';
        itemDiv.innerHTML = `
            <div class="item-header">
                <span class="badge">${item.lesson}</span>
                <h3>${item.grammar}</h3>
            </div>
            <p class="item-meaning">${item.meaning.replace(/\n/g, '<br>')}</p>
            <div class="item-actions">
                <button onclick="loadEditForm('${item.id}')" class="btn-action btn-edit">Sửa</button>
                <button onclick="deleteGrammar('${item.id}')" class="btn-action btn-delete">Xóa</button>
            </div>
        `;
        listContainer.appendChild(itemDiv);
    });
}

// Xử lý Thêm hoặc Sửa ngữ pháp
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('entryId').value;
    const lesson = document.getElementById('lessonInput').value.trim();
    const grammar = document.getElementById('grammarInput').value.trim();
    const meaning = document.getElementById('meaningInput').value.trim();

    if (id) {
        // Chế độ: Sửa (Edit Grammar)
        grammarData = grammarData.map(item => item.id === id ? { id, lesson, grammar, meaning } : item);
    } else {
        // Chế độ: Thêm mới (Add Grammar)
        const newEntry = {
            id: Date.now().toString(),
            lesson,
            grammar,
            meaning
        };
        grammarData.push(newEntry);
    }

    saveAndRefresh();
    resetForm();
}

// Tải dữ liệu lên form để sửa
function loadEditForm(id) {
    const item = grammarData.find(item => item.id === id);
    if (!item) return;

    document.getElementById('entryId').value = item.id;
    document.getElementById('lessonInput').value = item.lesson;
    document.getElementById('grammarInput').value = item.grammar;
    document.getElementById('meaningInput').value = item.meaning;

    document.getElementById('formTitle').textContent = 'Chỉnh Sửa Cấu Trúc';
    document.getElementById('submitBtn').textContent = 'Cập Nhật';
    document.getElementById('cancelBtn').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Chức năng Xóa (Delete Grammar)
function deleteGrammar(id) {
    if (confirm('Bạn có chắc chắn muốn xóa cấu trúc này không?')) {
        grammarData = grammarData.filter(item => item.id !== id);
        saveAndRefresh();
        
        // Nếu đang sửa cái vừa xóa thì reset form
        if (document.getElementById('entryId').value === id) {
            resetForm();
        }
    }
}

// Lưu dữ liệu vào LocalStorage và tự động làm mới giao diện + bộ lọc dropdown
function saveAndRefresh() {
    localStorage.setItem('grammarData', JSON.stringify(grammarData));
    updateLessonFilter(); // <-- 3. Tự động refresh sau các thao tác dữ liệu
    renderGrammarList();
}

// Đưa form về trạng thái trống ban đầu
function resetForm() {
    document.getElementById('grammarForm').reset();
    document.getElementById('entryId').value = '';
    document.getElementById('formTitle').textContent = 'Thêm Cấu Trúc Mới';
    document.getElementById('submitBtn').textContent = 'Lưu Lại';
    document.getElementById('cancelBtn').classList.add('hidden');
}

// Xuất file cấu hình dự phòng (Export Data)
function exportData() {
    if (grammarData.length === 0) {
        alert('Không có dữ liệu dữ phòng để xuất!');
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(grammarData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `grammar_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Chức năng Nhập bản lưu (Import Grammar)
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                if (confirm('Bạn có muốn gộp dữ liệu cũ với dữ liệu mới tải lên không? (Bấm Cancel để ghi đè hoàn toàn)')) {
                    // Gộp dữ liệu tránh trùng lặp ID
                    const existingIds = new Set(grammarData.map(item => item.id));
                    importedData.forEach(item => {
                        if (!existingIds.has(item.id)) {
                            grammarData.push(item);
                        } else {
                            item.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                            grammarData.push(item);
                        }
                    });
                } else {
                    grammarData = importedData;
                }
                saveAndRefresh();
                alert('Tải dữ liệu sao lưu thành công!');
            } else {
                alert('Định dạng file sao lưu không hợp lệ!');
            }
        } catch (error) {
            alert('Đọc file bị lỗi, hãy kiểm tra lại!');
        }
        e.target.value = ''; // Reset input file
    };
    reader.readAsText(file);
}
