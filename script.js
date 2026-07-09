// --- INITIAL DATA WITH COMPLETED FIELDS ---
const sampleVocabulary = [
    { 
        id: 1, hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Chào bạn", hsk: "HSK 1", lesson: "Bài 1", 
        pos: "Thán từ", radical: "Ref (Nhân)", structure: "Tả hữu (左右)", 
        example: "你好！很高兴认识 du.", tags: ["giao tiep", "co ban"], notes: "Từ bắt đầu cơ bản", 
        learned: true, favorite: false,
        nextReview: new Date().toISOString(), reviewCount: 2, createdAt: "2026-01-01T00:00:00.000Z"
    },
    { 
        id: 2, hanzi: "谢谢", pinyin: "xièxie", meaning: "Cảm ơn", hsk: "HSK 1", lesson: "Bài 1", 
        pos: "Động từ", radical: "讠 (Ngôn)", structure: "Tả hữu (左右)", 
        example: "谢谢 tu de giúp đỡ.", tags: ["giao tiep"], notes: "Thanh nhẹ ở âm sau", 
        learned: true, favorite: true,
        nextReview: new Date().toISOString(), reviewCount: 5, createdAt: "2026-01-02T00:00:00.000Z"
    },
    { 
        id: 3, hanzi: "苹果", pinyin: "píngguǒ", meaning: "Quả táo", hsk: "HSK 1", lesson: "Bài 2", 
        pos: "Danh từ", radical: "艹 (Thảo)", structure: "Trên dưới (上下)", 
        example: "我想吃一个苹果。", tags: ["hoa qua"], notes: "Phân biệt với từ Quả bính", 
        learned: false, favorite: false,
        nextReview: new Date().toISOString(), reviewCount: 0, createdAt: "2026-01-05T00:00:00.000Z"
    }
];

const sampleGrammar = [
    {
        id: 1,
        pattern: "Subject + 是 + Object",
        explanation: "Dùng để khẳng định cái gì là cái gì.",
        examples: [{ zh: "我是越南人。", py: "Wǒ shì Yuènán rén.", vi: "Tôi là người Việt Nam." }],
        bookmarked: true
    }
];

// --- STATE MANAGEMENT ---
let vocabulary = JSON.parse(localStorage.getItem('zh_vocab')) || sampleVocabulary;
let grammar = JSON.parse(localStorage.getItem('zh_grammar')) || sampleGrammar;
let notes = JSON.parse(localStorage.getItem('zh_notes')) || [];
let stats = JSON.parse(localStorage.getItem('zh_stats')) || {
    streak: 1, lastStudyDate: new Date().toDateString(),
    vocabLearnedToday: 0, cardsReviewedToday: 0, grammarStudiedToday: 0
};

function saveToStorage() {
    localStorage.setItem('zh_vocab', JSON.stringify(vocabulary));
    localStorage.setItem('zh_grammar', JSON.stringify(grammar));
    localStorage.setItem('zh_notes', JSON.stringify(notes));
    localStorage.setItem('zh_stats', JSON.stringify(stats));
}

// --- GLOBAL NAVIGATION ---
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

// --- VOCABULARY CRUD & MANAGEMENT ---
const vocabModal = document.getElementById('vocab-modal');
const btnAddVocab = document.getElementById('btn-add-vocab');
const closeVocabModal = document.getElementById('close-vocab-modal');
const vocabForm = document.getElementById('vocab-form');
const vocabSearch = document.getElementById('vocab-search');
const vocabFilterLesson = document.getElementById('vocab-filter-lesson');

if (btnAddVocab) btnAddVocab.onclick = () => openVocabModal();
if (closeVocabModal) closeVocabModal.onclick = () => closeVocabModalFunc();
if (vocabSearch) vocabSearch.addEventListener('input', renderVocabulary);
if (vocabFilterLesson) vocabFilterLesson.addEventListener('change', renderVocabulary);

function openVocabModal(id = null) {
    vocabModal.style.display = 'flex';
    if (id) {
        document.getElementById('vocab-modal-title-text').innerText = "Chỉnh sửa từ vựng";
        const word = vocabulary.find(v => v.id === id);
        if (word) {
            document.getElementById('vocab-id').value = word.id;
            document.getElementById('vocab-hanzi').value = word.hanzi;
            document.getElementById('vocab-pinyin').value = word.pinyin;
            document.getElementById('vocab-meaning').value = word.meaning;
            document.getElementById('vocab-hsk').value = word.hsk || '';
            document.getElementById('vocab-lesson').value = word.lesson || '';
            document.getElementById('vocab-pos').value = word.pos || '';
            document.getElementById('vocab-radical').value = word.radical || '';
            document.getElementById('vocab-structure').value = word.structure || '';
            document.getElementById('vocab-example').value = word.example || '';
            document.getElementById('vocab-tags').value = word.tags ? word.tags.join(', ') : '';
            document.getElementById('vocab-notes').value = word.notes || '';
        }
    } else {
        document.getElementById('vocab-modal-title-text').innerText = "Thêm từ vựng mới";
        vocabForm.reset();
        document.getElementById('vocab-id').value = '';
    }
}

function closeVocabModalFunc() { vocabModal.style.display = 'none'; }

if (vocabForm) {
    vocabForm.onsubmit = function(e) {
        e.preventDefault();
        const id = document.getElementById('vocab-id').value;
        const hanzi = document.getElementById('vocab-hanzi').value.trim();
        const pinyin = document.getElementById('vocab-pinyin').value.trim();
        const meaning = document.getElementById('vocab-meaning').value.trim();
        const hsk = document.getElementById('vocab-hsk').value.trim() || "HSK 1";
        const lesson = document.getElementById('vocab-lesson').value.trim() || "Chưa rõ";
        const pos = document.getElementById('vocab-pos').value.trim();
        const radical = document.getElementById('vocab-radical').value.trim();
        const structure = document.getElementById('vocab-structure').value.trim();
        const example = document.getElementById('vocab-example').value.trim();
        const rawTags = document.getElementById('vocab-tags').value;
        const notesText = document.getElementById('vocab-notes').value.trim();

        const tags = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);

        if (id) {
            // Cập nhật cấu trúc từ vựng cũ
            const index = vocabulary.findIndex(v => v.id == id);
            if (index !== -1) {
                vocabulary[index] = { 
                    ...vocabulary[index], hanzi, pinyin, meaning, hsk, lesson, 
                    pos, radical, structure, example, tags, notes: notesText 
                };
            }
        } else {
            // Thêm từ vựng mới hoàn toàn + tích hợp SRS ẩn
            vocabulary.push({
                id: Date.now(), hanzi, pinyin, meaning, hsk, lesson, 
                pos, radical, structure, example, tags, notes: notesText,
                learned: false, favorite: false,
                nextReview: new Date().toISOString(), reviewCount: 0, createdAt: new Date().toISOString()
            });
        }
        saveToStorage();
        closeVocabModalFunc();
        renderVocabulary();
    };
}

window.deleteVocab = function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa hẳn từ vựng này khỏi hệ thống?")) {
        vocabulary = vocabulary.filter(v => v.id !== id);
        saveToStorage();
        renderVocabulary();
    }
}

// --- SEARCH ENGINE ALL FIELDS ---
function renderVocabulary() {
    const tbody = document.getElementById('vocab-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    const query = vocabSearch.value.toLowerCase();
    const lessonFilter = vocabFilterLesson.value;

    vocabulary.forEach(word => {
        // Quét tìm kiếm thông minh trên cả 11 trường dữ liệu của Schema
        const matchAllFields = 
            word.hanzi.includes(query) || 
            word.pinyin.toLowerCase().includes(query) || 
            word.meaning.toLowerCase().includes(query) ||
            (word.hsk && word.hsk.toLowerCase().includes(query)) ||
            (word.lesson && word.lesson.toLowerCase().includes(query)) ||
            (word.pos && word.pos.toLowerCase().includes(query)) ||
            (word.radical && word.radical.toLowerCase().includes(query)) ||
            (word.structure && word.structure.toLowerCase().includes(query)) ||
            (word.example && word.example.toLowerCase().includes(query)) ||
            (word.notes && word.notes.toLowerCase().includes(query)) ||
            (word.tags && word.tags.some(t => t.toLowerCase().includes(query)));

        const matchesLesson = lessonFilter === 'all' || word.lesson === lessonFilter;

        if (matchAllFields && matchesLesson) {
            const tr = document.createElement('tr');
            const nextReviewDate = new Date(word.nextReview);
            const isOverdue = nextReviewDate <= new Date();
            const timeString = isOverdue ? "🔥 Cần ôn" : nextReviewDate.toLocaleDateString('vi-VN');
            const tagsHTML = word.tags ? word.tags.map(t => `<span class="tag">#${t}</span>`).join(' ') : '';

            tr.innerHTML = `
                <td>
                    <div class="hanzi-container">
                        <span class="hanzi-text">${word.hanzi}</span>
                        <span class="sub-info">Bộ: ${word.radical || '-'} | ${word.structure || '-'}</span>
                    </div>
                </td>
                <td>
                    <div><strong>${word.pinyin}</strong></div>
                    <div style="font-size:0.8rem; color:var(--text-secondary)">${word.pos || '-'}</div>
                </td>
                <td>
                    <div>${word.meaning}</div>
                    <div style="margin-top:4px;">${tagsHTML}</div>
                </td>
                <td>
                    <span class="badge badge-lesson">${word.lesson}</span>
                    <span class="badge badge-hsk">${word.hsk}</span>
                </td>
                <td>
                    <div class="review-info" style="color: ${isOverdue ? '#ea2b2b' : 'var(--text-primary)'}">${timeString}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary)">Đã ôn: ${word.reviewCount} lần</div>
                </td>
                <td>
                    <button class="action-btn" onclick="toggleFavoriteVocab(${word.id})">${word.favorite ? '⭐' : '☆'}</button>
                    <button class="action-btn" onclick="openVocabModal(${word.id})">✏️</button>
                    <button class="action-btn" onclick="deleteVocab(${word.id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
}

window.toggleFavoriteVocab = function(id) {
    const word = vocabulary.find(v => v.id === id);
    if (word) { word.favorite = !word.favorite; saveToStorage(); renderVocabulary(); }
}

window.toggleLearnedVocab = function(id) {
    const word = vocabulary.find(v => v.id === id);
    if (word) {
        word.learned = !word.learned;
        if (word.learned) { stats.vocabLearnedToday++; word.nextReview = new Date(Date.now() + 24*60*60*1000).toISOString(); }
        saveToStorage(); renderVocabulary();
    }
}

// --- GRAMMAR ---
function renderGrammar() {
    const container = document.getElementById('grammar-list');
    if(!container) return; container.innerHTML = '';
    grammar.forEach(item => {
        const card = document.createElement('div');
        card.className = 'grammar-card';
        card.innerHTML = `
            <div class="grammar-title-row">
                <div class="grammar-pattern">${item.pattern}</div>
                <button class="action-btn" onclick="toggleBookmarkGrammar(${item.id})">${item.bookmarked ? '🔖' : '📑'}</button>
            </div>
            <div class="grammar-explanation">${item.explanation}</div>
            <div class="grammar-examples">
                ${item.examples.map(ex => `<div class="example-item"><div class="ex-zh">${ex.zh}</div><div class="ex-py">${ex.py}</div><div class="ex-vi">${ex.vi}</div></div>`).join('')}
            </div>
        `;
        container.appendChild(card);
    });
}

window.toggleBookmarkGrammar = function(id) {
    const item = grammar.find(g => g.id === id);
    if (item) { item.bookmarked = !item.bookmarked; if (item.bookmarked) stats.grammarStudiedToday++; saveToStorage(); renderGrammar(); }
}

// --- SRS FLASHCARDS ---
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
    activeDeck = [...vocabulary].sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
    currentCardIndex = 0;
    showCard();
}

function showCard() {
    if (activeDeck.length === 0) {
        document.getElementById('card-front-text').innerText = "Trống";
        document.getElementById('card-back-meaning').innerText = "Hãy bổ sung thêm từ vựng.";
        return;
    }
    cardElement.classList.remove('flipped');
    document.getElementById('smr-box').style.display = 'none';
    const currentCard = activeDeck[currentCardIndex];
    document.getElementById('card-front-text').innerText = currentCard.hanzi;
    document.getElementById('card-front-details').innerText = `Bộ thủ: ${currentCard.radical || '-'} | Loại: ${currentCard.pos || '-'}`;
    document.getElementById('card-back-pinyin').innerText = currentCard.pinyin;
    document.getElementById('card-back-meaning').innerText = currentCard.meaning;
    document.getElementById('card-back-example').innerText = currentCard.example ? `Ví dụ: ${currentCard.example}` : "";
}

document.querySelectorAll('.smr-buttons .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeDeck.length === 0) return;
        const score = parseInt(btn.getAttribute('data-score'));
        const currentCard = activeDeck[currentCardIndex];
        stats.cardsReviewedToday++;

        const mainVocabItem = vocabulary.find(v => v.id === currentCard.id);
        if (mainVocabItem) {
            mainVocabItem.reviewCount += 1;
            mainVocabItem.learned = score > 1;
            let daysToAdd = score === 2 ? 2 : score === 3 ? 4 : score === 4 ? 7 : 0;
            mainVocabItem.nextReview = daysToAdd === 0 ? new Date(Date.now() + 10*60*1000).toISOString() : new Date(Date.now() + daysToAdd*24*60*60*1000).toISOString();
        }
        saveToStorage();
        currentCardIndex = (currentCardIndex + 1) % activeDeck.length;
        showCard();
    });
});

document.getElementById('btn-next')?.addEventListener('click', () => { currentCardIndex = (currentCardIndex + 1) % activeDeck.length; showCard(); });
document.getElementById('btn-prev')?.addEventListener('click', () => { currentCardIndex = (currentCardIndex - 1 + activeDeck.length) % activeDeck.length; showCard(); });
document.getElementById('btn-shuffle')?.addEventListener('click', () => { activeDeck.sort(() => Math.random() - 0.5); currentCardIndex = 0; showCard(); });

// --- QUIZ & NOTEBOOK ---
let quizQuestions = []; let currentQuizIdx = 0; let quizScore = 0;
document.getElementById('btn-start-quiz')?.addEventListener('click', () => {
    if (vocabulary.length < 4) { alert("Cần tối thiểu 4 từ vựng để làm trắc nghiệm!"); return; }
    quizScore = 0; currentQuizIdx = 0;
    quizQuestions = vocabulary.sort(() => Math.random() - 0.5).slice(0, 5).map(word => {
        let wrongs = vocabulary.filter(v => v.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map(v => v.meaning);
        return { question: `Ý nghĩa của chữ "${word.hanzi}" là gì?`, correctAnswer: word.meaning, options: [word.meaning, ...wrongs].sort(() => Math.random() - 0.5) };
    });
    document.getElementById('quiz-start-screen').style.display = 'none';
    document.getElementById('quiz-play-screen').style.display = 'block';
    showQuizQuestion();
});

function resetQuizUI() { document.getElementById('quiz-start-screen').style.display = 'block'; document.getElementById('quiz-play-screen').style.display = 'none'; document.getElementById('quiz-result-screen').style.display = 'none'; }
function showQuizQuestion() {
    const q = quizQuestions[currentQuizIdx]; document.getElementById('quiz-current').innerText = currentQuizIdx + 1; document.getElementById('quiz-question-text').innerText = q.question;
    const container = document.getElementById('quiz-options-container'); container.innerHTML = '';
    q.options.forEach(opt => {
        const b = document.createElement('button'); b.className = 'option-btn'; b.innerText = opt;
        b.onclick = () => {
            document.querySelectorAll('.option-btn').forEach(x => x.disabled = true);
            if (opt === q.correctAnswer) { b.classList.add('correct'); quizScore++; } else { b.classList.add('wrong'); }
            setTimeout(() => { currentQuizIdx++; if (currentQuizIdx < quizQuestions.length) showQuizQuestion(); else { document.getElementById('quiz-play-screen').style.display = 'none'; document.getElementById('quiz-result-screen').style.display = 'block'; document.getElementById('quiz-score-text').innerText = `${quizScore} / 5`; } }, 1200);
        };
        container.appendChild(b);
    });
}

// NOTEBOOK IMPLEMENTATION
const noteModal = document.getElementById('note-modal');
const noteForm = document.getElementById('note-form');
if (document.getElementById('btn-add-note')) document.getElementById('btn-add-note').onclick = () => { noteForm.reset(); document.getElementById('note-id').value = ''; noteModal.style.display = 'flex'; };
if (document.getElementById('close-note-modal')) document.getElementById('close-note-modal').onclick = () => noteModal.style.display = 'none';

if (noteForm) {
    noteForm.onsubmit = function(e) {
        e.preventDefault();
        const id = document.getElementById('note-id').value;
        const title = document.getElementById('note-title').value;
        const tags = document.getElementById('note-tags').value.split(',').map(t => t.trim());
        const content = document.getElementById('note-content').value;
        if (id) {
            const idx = notes.findIndex(n => n.id == id);
            if (idx !== -1) notes[idx] = { ...notes[idx], title, tags, content, date: new Date().toLocaleDateString('vi-VN') };
        } else {
            notes.push({ id: Date.now(), title, tags, content, date: new Date().toLocaleDateString('vi-VN') });
        }
        saveToStorage(); noteModal.style.display = 'none'; renderNotes();
    };
}

function renderNotes() {
    const container = document.getElementById('notes-grid'); if(!container) return; container.innerHTML = '';
    notes.forEach(n => {
        const div = document.createElement('div'); div.className = 'note-card';
        div.innerHTML = `<div><div class="note-title">${n.title}</div><div class="note-date">${n.date}</div><div class="note-body">${n.content}</div></div>
                         <div class="note-actions"><button class="note-action-lnk edit-lnk" onclick="editNote(${n.id})">Sửa</button><button class="note-action-lnk del-lnk" onclick="deleteNote(${n.id})">Xóa</button></div>`;
        container.appendChild(div);
    });
}
window.editNote = function(id) { const n = notes.find(x => x.id === id); if(n) { document.getElementById('note-id').value = n.id; document.getElementById('note-title').value = n.title; document.getElementById('note-tags').value = n.tags.join(', '); document.getElementById('note-content').value = n.content; noteModal.style.display = 'flex'; } };
window.deleteNote = function(id) { if(confirm("Xóa ghi chú?")) { notes = notes.filter(x => x.id !== id); saveToStorage(); renderNotes(); } };

// Boot initial state
updateDashboard();
