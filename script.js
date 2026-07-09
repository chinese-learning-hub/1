// --- SAMPLE UPGRADED DATA SCHEMA ---
const sampleVocabulary = [
    { 
        id: 1, hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Chào bạn", hsk: "HSK 1", lesson: "Bài 1", 
        pos: "Thán từ", radical: "亻 (Nhân)", structure: "Tả hữu (左右)", 
        example: "你好！很高兴认识你。", tags: ["giao tiep", "co ban"], notes: "Từ vựng bắt đầu", 
        learned: true, favorite: false,
        nextReview: new Date().toISOString(), reviewCount: 2, createdAt: "2026-01-01T00:00:00.000Z"
    },
    { 
        id: 2, hanzi: "谢谢", pinyin: "xièxie", meaning: "Cảm ơn", hsk: "HSK 1", lesson: "Bài 1", 
        pos: "Động từ", radical: "讠 (Ngôn)", structure: "Tả hữu (左右)", 
        example: "谢谢你的 giúp đỡ。", tags: ["giao tiep"], notes: "Âm thanh nhẹ ở từ sau", 
        learned: true, favorite: true,
        nextReview: new Date().toISOString(), reviewCount: 5, createdAt: "2026-01-02T00:00:00.000Z"
    },
    { 
        id: 3, hanzi: "苹果", pinyin: "píngguǒ", meaning: "Quả táo", hsk: "HSK 1", lesson: "Bài 2", 
        pos: "Danh từ", radical: "艹 (Thảo) / 木 (Mộc)", structure: "Trên dưới (上下)", 
        example: "我想吃一个苹果。", tags: ["hoa qua", "danh tu"], notes: "Phân biệt với Bính quả", 
        learned: false, favorite: false,
        nextReview: new Date().toISOString(), reviewCount: 0, createdAt: "2026-01-05T00:00:00.000Z"
    },
    { 
        id: 4, hanzi: "看书", pinyin: "kàn shū", meaning: "Đọc sách", hsk: "HSK 1", lesson: "Bài 2", 
        pos: "Động từ ly hợp", radical: "目 (Mục) / 乛 (Phiệt)", structure: "Kết hợp", 
        example: "他在房间里看书。", tags: ["hanh dong"], notes: "Xem/Đọc + Sách", 
        learned: false, favorite: false,
        nextReview: new Date().toISOString(), reviewCount: 0, createdAt: "2026-01-06T00:00:00.000Z"
    },
    { 
        id: 5, hanzi: "高兴", pinyin: "gāoxìng", meaning: "Vui vẻ, mừng rỡ", hsk: "HSK 1", lesson: "Bài 3", 
        pos: "Tính từ", radical: "高 (Cao) / 八 (Bát)", structure: "Phức tạp", 
        example: "认识你很高兴。", tags: ["cam xuc"], notes: "Trạng thái tâm lý vui tươi", 
        learned: false, favorite: true,
        nextReview: new Date().toISOString(), reviewCount: 1, createdAt: "2026-01-10T00:00:00.000Z"
    }
];

const sampleGrammar = [
    {
        id: 1,
        pattern: "Subject + 是 + Object",
        explanation: "Dùng để khẳng định cái gì là cái gì (tương tự 'to be' trong tiếng Anh).",
        examples: [
            { zh: "我是越南人。", py: "Wǒ ...", vi: "Tôi là người Việt Nam." }
        ],
        bookmarked: true
    }
];

// --- APP STATE ---
let vocabulary = JSON.parse(localStorage.getItem('zh_vocab')) || sampleVocabulary;
let grammar = JSON.parse(localStorage.getItem('zh_grammar')) || sampleGrammar;
let notes = JSON.parse(localStorage.getItem('zh_notes')) || [];
let stats = JSON.parse(localStorage.getItem('zh_stats')) || {
    streak: 1,
    lastStudyDate: new Date().toDateString(),
    vocabLearnedToday: 0,
    cardsReviewedToday: 0,
    grammarStudiedToday: 0
};

// Luôn đảm bảo thuộc tính mới tồn tại nếu được kế thừa từ phiên bản cũ
vocabulary = vocabulary.map(word => ({
    ...word,
    createdAt: word.createdAt || new Date().toISOString(),
    reviewCount: word.reviewCount !== undefined ? word.reviewCount : (word.learned ? 1 : 0),
    nextReview: word.nextReview || new Date().toISOString()
}));

function saveToStorage() {
    localStorage.setItem('zh_vocab', JSON.stringify(vocabulary));
    localStorage.setItem('zh_grammar', JSON.stringify(grammar));
    localStorage.setItem('zh_notes', JSON.stringify(notes));
    localStorage.setItem('zh_stats', JSON.stringify(stats));
}

// --- NAVIGATION ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.getAttribute('data-target'));
    });
});

function navigateTo(targetPageId) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
    
    const activeNav = document.querySelector(`.nav-item[data-target="${targetPageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) targetPage.classList.add('active');

    if (targetPageId === 'dashboard') updateDashboard();
    if (targetPageId === 'vocabulary') renderVocabulary();
    if (targetPageId === 'grammar') renderGrammar();
    if (targetPageId === 'flashcards') initFlashcards();
    if (targetPageId === 'quiz') resetQuizUI();
    if (targetPageId === 'notebook') renderNotes();
}

// --- DASHBOARD ---
function updateDashboard() {
    const today = new Date().toDateString();
    if (stats.lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (stats.lastStudyDate === yesterday.toDateString()) {
            // Giữ vững chuỗi
        } else {
            stats.streak = 1; // reset chuỗi nếu đứt quãng quá 1 ngày
        }
        stats.vocabLearnedToday = 0;
        stats.cardsReviewedToday = 0;
        stats.grammarStudiedToday = 0;
        stats.lastStudyDate = today;
        saveToStorage();
    }

    document.getElementById('streak-count').innerText = stats.streak;
    document.getElementById('stat-vocab-today').innerText = stats.vocabLearnedToday;
    document.getElementById('stat-cards-today').innerText = stats.cardsReviewedToday;
    document.getElementById('stat-grammar-today').innerText = stats.grammarStudiedToday;
}

// --- VOCABULARY CONTROLLER (UPDATED FOR MATRIX VIEW) ---
const vocabSearch = document.getElementById('vocab-search');
const vocabFilterLesson = document.getElementById('vocab-filter-lesson');

if (vocabSearch) vocabSearch.addEventListener('input', renderVocabulary);
if (vocabFilterLesson) vocabFilterLesson.addEventListener('change', renderVocabulary);

function renderVocabulary() {
    const tbody = document.getElementById('vocab-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    const query = vocabSearch.value.toLowerCase();
    const lessonFilter = vocabFilterLesson.value;

    vocabulary.forEach(word => {
        const matchesSearch = 
            word.hanzi.includes(query) || 
            word.pinyin.toLowerCase().includes(query) || 
            word.meaning.toLowerCase().includes(query) ||
            (word.radical && word.radical.toLowerCase().includes(query)) ||
            (word.pos && word.pos.toLowerCase().includes(query));
            
        const matchesLesson = lessonFilter === 'all' || word.lesson === lessonFilter;

        if (matchesSearch && matchesLesson) {
            const tr = document.createElement('tr');
            
            // Format ngày ôn tập kế tiếp để hiển thị thân thiện
            const nextReviewDate = new Date(word.nextReview);
            const isOverdue = nextReviewDate <= new Date();
            const timeString = isOverdue ? "🔥 Cần ôn ngay" : nextReviewDate.toLocaleDateString('vi-VN');

            tr.innerHTML = `
                <td>
                    <div class="hanzi-container">
                        <span class="hanzi-text">${word.hanzi}</span>
                        <span class="sub-info">Bộ: ${word.radical || 'Chưa cập nhật'} | ${word.structure || ''}</span>
                    </div>
                </td>
                <td>
                    <div><strong>${word.pinyin}</strong></div>
                    <div style="font-size:0.8rem; color:var(--text-secondary)">${word.pos || 'Từ loại'}</div>
                </td>
                <td>
                    <div>${word.meaning}</div>
                    <div style="font-size:0.75rem; color:blue; max-width:200px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                        Ex: ${word.example || ''}
                    </div>
                </td>
                <td>
                    <span class="badge badge-lesson">${word.lesson}</span>
                    <span class="badge badge-hsk">${word.hsk || 'HSK'}</span>
                </td>
                <td>
                    <div class="review-info" style="color: ${isOverdue ? '#ea2b2b' : 'var(--text-primary)'}">
                        ${timeString}
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-secondary)">Đã ôn: ${word.reviewCount} lần</div>
                </td>
                <td>
                    <button class="action-btn" onclick="toggleFavoriteVocab(${word.id})">${word.favorite ? '⭐' : '☆'}</button>
                    <button class="action-btn" onclick="toggleLearnedVocab(${word.id})">${word.learned ? '🔄 Học lại' : '✅ Đã học'}</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
}

window.toggleFavoriteVocab = function(id) {
    const word = vocabulary.find(v => v.id === id);
    if (word) {
        word.favorite = !word.favorite;
        saveToStorage();
        renderVocabulary();
    }
}

window.toggleLearnedVocab = function(id) {
    const word = vocabulary.find(v => v.id === id);
    if (word) {
        word.learned = !word.learned;
        if (word.learned) {
            stats.vocabLearnedToday++;
            word.reviewCount = 1;
            word.nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Ngày mai ôn tiếp
        } else {
            word.reviewCount = 0;
            word.nextReview = new Date().toISOString();
        }
        saveToStorage();
        renderVocabulary();
    }
}

// --- GRAMMAR CONTROLLER ---
const grammarSearch = document.getElementById('grammar-search');
if (grammarSearch) grammarSearch.addEventListener('input', renderGrammar);

function renderGrammar() {
    const container = document.getElementById('grammar-list');
    if(!container) return;
    container.innerHTML = '';
    const query = grammarSearch.value.toLowerCase();

    grammar.forEach(item => {
        if (item.pattern.toLowerCase().includes(query) || item.explanation.toLowerCase().includes(query)) {
            const card = document.createElement('div');
            card.className = 'grammar-card';
            
            let examplesHTML = '';
            item.examples.forEach(ex => {
                examplesHTML += `
                    <div class="example-item">
                        <div class="ex-zh">${ex.zh}</div>
                        <div class="ex-py">${ex.py}</div>
                        <div class="ex-vi">${ex.vi}</div>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="grammar-title-row">
                    <div class="grammar-pattern">${item.pattern}</div>
                    <button class="action-btn" onclick="toggleBookmarkGrammar(${item.id})">${item.bookmarked ? '🔖' : '📑'}</button>
                </div>
                <div class="grammar-explanation">${item.explanation}</div>
                <div class="grammar-examples">${examplesHTML}</div>
            `;
            container.appendChild(card);
        }
    });
}

window.toggleBookmarkGrammar = function(id) {
    const item = grammar.find(g => g.id === id);
    if (item) {
        item.bookmarked = !item.bookmarked;
        if (item.bookmarked) stats.grammarStudiedToday++;
        saveToStorage();
        renderGrammar();
    }
}

// --- FLASHCARDS SRS CONTROLLER (UPDATED ARGS & LOGIC) ---
let activeDeck = [];
let currentCardIndex = 0;

const cardElement = document.getElementById('flashcard');
if (cardElement) {
    cardElement.addEventListener('click', () => {
        cardElement.classList.toggle('flipped');
        document.getElementById('smr-box').style.display = cardElement.classList.contains('flipped') ? 'flex' : 'none';
    });
}

function initFlashcards() {
    // Sắp xếp ưu tiên các từ đến lịch ôn tập trước (nextReview nhỏ hơn hiện tại)
    activeDeck = [...vocabulary].sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
    currentCardIndex = 0;
    showCard();
}

function showCard() {
    if (activeDeck.length === 0) {
        document.getElementById('card-front-text').innerText = "Trống";
        document.getElementById('card-front-details').innerText = "";
        document.getElementById('card-back-pinyin').innerText = "";
        document.getElementById('card-back-meaning').innerText = "Hãy bổ sung từ vựng.";
        document.getElementById('card-back-example').innerText = "";
        return;
    }
    cardElement.classList.remove('flipped');
    document.getElementById('smr-box').style.display = 'none';

    const currentCard = activeDeck[currentCardIndex];
    document.getElementById('card-front-text').innerText = currentCard.hanzi;
    document.getElementById('card-front-details').innerText = `Bộ thủ: ${currentCard.radical || 'Không'} | Loại từ: ${currentCard.pos || 'N/A'}`;
    document.getElementById('card-back-pinyin').innerText = currentCard.pinyin;
    document.getElementById('card-back-meaning').innerText = currentCard.meaning;
    document.getElementById('card-back-example').innerText = currentCard.example ? `Ví dụ: ${currentCard.example}` : "Không có ví dụ";
}

document.getElementById('btn-next')?.addEventListener('click', () => {
    if (activeDeck.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % activeDeck.length;
    showCard();
});

document.getElementById('btn-prev')?.addEventListener('click', () => {
    if (activeDeck.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + activeDeck.length) % activeDeck.length;
    showCard();
});

document.getElementById('btn-shuffle')?.addEventListener('click', () => {
    if (activeDeck.length === 0) return;
    activeDeck.sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    showCard();
});

// Xử lý sự kiện nhấn nút SRS tương ứng mức độ nhớ (1: Học lại, 2: Khó, 3: Tốt, 4: Dễ)
document.querySelectorAll('.smr-box, .smr-buttons .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeDeck.length === 0) return;

        const score = parseInt(btn.getAttribute('data-score'));
        if (!score) return;

        const currentCard = activeDeck[currentCardIndex];
        
        // Cập nhật thống kê hệ thống toàn cục
        stats.cardsReviewedToday++;
        
        // Tiến hành cập nhật tiến trình SRS cho từ vựng thực tế trong mảng gốc
        const mainVocabItem = vocabulary.find(v => v.id === currentCard.id);
        if (mainVocabItem) {
            mainVocabItem.reviewCount += 1;
            mainVocabItem.learned = score > 1; // Nếu bấm Khó trở lên xem như đã tiếp thu sơ bộ

            // Thuật toán kéo giãn chu kỳ ôn tập (SRS đơn giản hóa)
            let daysToAdd = 1;
            if (score === 2) daysToAdd = 2 * mainVocabItem.reviewCount;
            if (score === 3) daysToAdd = 4 * mainVocabItem.reviewCount;
            if (score === 4) daysToAdd = 7 * mainVocabItem.reviewCount;
            
            if (score === 1) {
                // Nếu quên hoàn toàn, đặt lịch ôn tập lại sau 10 phút (0.007 ngày)
                mainVocabItem.nextReview = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            } else {
                mainVocabItem.nextReview = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
            }
        }
        
        // Tăng chuỗi học tập (Streak) linh hoạt khi ôn tập tích cực ngày hôm nay
        if (stats.vocabLearnedToday === 0 && stats.cardsReviewedToday === 1) {
            stats.streak += 1;
        }

        saveToStorage();
        
        // Chuyển sang thẻ tiếp theo
        currentCardIndex = (currentCardIndex + 1) % activeDeck.length;
        showCard();
    });
});

// --- QUIZ ---
let quizQuestions = [];
let currentQuizIdx = 0;
let quizScore = 0;

document.getElementById('btn-start-quiz')?.addEventListener('click', startQuiz);
document.getElementById('btn-restart-quiz')?.addEventListener('click', resetQuizUI);

function resetQuizUI() {
    document.getElementById('quiz-start-screen').style.display = 'block';
    document.getElementById('quiz-play-screen').style.display = 'none';
    document.getElementById('quiz-result-screen').style.display = 'none';
}

function startQuiz() {
    if (vocabulary.length < 4) {
        alert("Bạn cần có ít nhất 4 từ vựng để tạo bài trắc nghiệm!");
        return;
    }
    quizScore = 0;
    currentQuizIdx = 0;
    quizQuestions = generateQuizQuestions();
    document.getElementById('quiz-start-screen').style.display = 'none';
    document.getElementById('quiz-play-screen').style.display = 'block';
    showQuizQuestion();
}

function generateQuizQuestions() {
    let shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    let chosenWords = shuffled.slice(0, Math.min(5, vocabulary.length));
    
    return chosenWords.map(word => {
        let wrongOptions = vocabulary
            .filter(v => v.id !== word.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(v => v.meaning);
            
        let options = [word.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        return {
            question: `Ý nghĩa của chữ Hán "${word.hanzi}" là gì?`,
            correctAnswer: word.meaning,
            options: options
        };
    });
}

function showQuizQuestion() {
    const qData = quizQuestions[currentQuizIdx];
    document.getElementById('quiz-current').innerText = currentQuizIdx + 1;
    document.getElementById('quiz-question-text').innerText = qData.question;
    
    const container = document.getElementById('quiz-options-container');
    container.innerHTML = '';
    
    qData.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => selectOption(btn, opt, qData.correctAnswer);
        container.appendChild(btn);
    });
}

function selectOption(selectedBtn, chosenOpt, correctOpt) {
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    if (chosenOpt === correctOpt) {
        selectedBtn.classList.add('correct');
        quizScore++;
    } else {
        selectedBtn.classList.add('wrong');
        document.querySelectorAll('.option-btn').forEach(b => {
            if (b.innerText === correctOpt) b.classList.add('correct');
        });
    }
    setTimeout(() => {
        currentQuizIdx++;
        if (currentQuizIdx < quizQuestions.length) {
            showQuizQuestion();
        } else {
            showQuizResult();
        }
    }, 1200);
}

function showQuizResult() {
    document.getElementById('quiz-play-screen').style.display = 'none';
    document.getElementById('quiz-result-screen').style.display = 'block';
    document.getElementById('quiz-score-text').innerText = `${quizScore} / ${quizQuestions.length}`;
}

// --- STUDY NOTEBOOK ---
const noteModal = document.getElementById('note-modal');
const btnAddNote = document.getElementById('btn-add-note');
const closeNoteModal = document.getElementById('close-note-modal');
const noteForm = document.getElementById('note-form');
const noteSearch = document.getElementById('note-search');

if (btnAddNote) btnAddNote.onclick = () => openModal();
if (closeNoteModal) closeNoteModal.onclick = () => closeModal();
if (noteSearch) noteSearch.addEventListener('input', renderNotes);

function openModal(id = null) {
    noteModal.style.display = 'flex';
    if (id) {
        document.getElementById('modal-title-text').innerText = "Sửa ghi chú";
        const target = notes.find(n => n.id === id);
        document.getElementById('note-id').value = target.id;
        document.getElementById('note-title').value = target.title;
        document.getElementById('note-tags').value = target.tags.join(', ');
        document.getElementById('note-content').value = target.content;
    } else {
        document.getElementById('modal-title-text').innerText = "Thêm ghi chú mới";
        noteForm.reset();
        document.getElementById('note-id').value = '';
    }
}

function closeModal() { noteModal.style.display = 'none'; }

if (noteForm) {
    noteForm.onsubmit = function(e) {
        e.preventDefault();
        const id = document.getElementById('note-id').value;
        const title = document.getElementById('note-title').value;
        const rawTags = document.getElementById('note-tags').value;
        const content = document.getElementById('note-content').value;
        const tags = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        const dateString = new Date().toLocaleDateString('vi-VN');

        if (id) {
            const index = notes.findIndex(n => n.id == id);
            if (index !== -1) notes[index] = { ...notes[index], title, tags, content, date: dateString };
        } else {
            notes.push({ id: Date.now(), title, tags, content, date: dateString });
        }
        saveToStorage();
        closeModal();
        renderNotes();
    };
}

function renderNotes() {
    const container = document.getElementById('notes-grid');
    if(!container) return;
    container.innerHTML = '';
    const query = noteSearch.value.toLowerCase();

    notes.forEach(note => {
        const matchesQuery = note.title.toLowerCase().includes(query) || 
                             note.content.toLowerCase().includes(query) || 
                             note.tags.some(t => t.toLowerCase().includes(query));

        if (matchesQuery) {
            const card = document.createElement('div');
            card.className = 'note-card';
            const tagsHTML = note.tags.map(t => `<span class="tag">#${t}</span>`).join('');
            card.innerHTML = `
                <div>
                    <div class="note-title">${note.title}</div>
                    <div class="note-date">Cập nhật: ${note.date}</div>
                    <div class="note-body">${note.content}</div>
                    <div class="note-tags-container">${tagsHTML}</div>
                </div>
                <div class="note-actions">
                    <button class="note-action-lnk edit-lnk" onclick="openModal(${note.id})">Sửa</button>
                    <button class="note-action-lnk del-lnk" onclick="deleteNote(${note.id})">Xóa</button>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

window.deleteNote = function(id) {
    if (confirm("Bạn có chắc muốn xóa ghi chú này?")) {
        notes = notes.filter(n => n.id !== id);
        saveToStorage();
        renderNotes();
    }
}

// Khởi chạy ứng dụng ban đầu
updateDashboard();
