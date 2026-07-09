// --- INITIAL DATA WITH COMPLETED FIELDS ---
const sampleVocabulary = [
    { 
        id: 1, hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Chào bạn", hsk: "HSK 1", lesson: "Bài 1", 
        pos: "Thán từ", radical: "亻 (Nhân)", structure: "Tả hữu (左右)", 
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
    }
];

// Upgraded Schema Sample Dataset
const sampleGrammar = [
    {
        id: 1,
        pattern: "Subject + 是 + Object",
        pinyin: "shì",
        meaning: "Chủ ngữ là Tân ngữ (Khẳng định định danh)",
        explanation: "Cấu trúc kinh điển dùng để liên kết hai danh từ, biểu thị mối quan hệ tương đương hoặc thuộc tính.",
        example: "我是越南人。 (Wǒ shì Yuènán rén. - Tôi là người Việt Nam.)",
        hsk: "HSK 1",
        lesson: "Bài 1",
        notes: "Thể phủ định thêm '不' (bù) thành '不是' (bú shì).",
        createdAt: "2026-01-01T08:00:00.000Z"
    },
    {
        id: 2,
        pattern: "Subject + 也很 + Adjective",
        pinyin: "yě hěn",
        meaning: "Chủ ngữ cũng rất...",
        explanation: "Phó từ '也' đứng trước phó từ chỉ mức độ '很' để diễn tả trạng thái tương đồng với đối tượng trước đó.",
        example: " order 也很忙。 (Wǒ yě hěn máng. - Tôi cũng rất bận.)",
        hsk: "HSK 1",
        lesson: "Bài 2",
        notes: "Tuyệt đối không đảo vị trí thành '很也'.",
        createdAt: "2026-01-03T10:30:00.000Z"
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
            const index = vocabulary.findIndex(v => v.id == id);
            if (index !== -1) {
                vocabulary[index] = { 
                    ...vocabulary[index], hanzi, pinyin, meaning, hsk, lesson, 
                    pos, radical, structure, example, tags, notes: notesText 
                };
            }
        } else {
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
    if (confirm("Bạn có chắc chắn muốn xóa hẳn từ vựng này?")) {
        vocabulary = vocabulary.filter(v => v.id !== id);
        saveToStorage();
        renderVocabulary();
    }
}

function renderVocabulary() {
    const tbody = document.getElementById('vocab-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    const query = vocabSearch.value.toLowerCase();
    const lessonFilter = vocabFilterLesson.value;

    vocabulary.forEach(word => {
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

// --- NEW MODULE: UPGRADED GRAMMAR MANAGEMENT (CRUD) ---
const grammarModal = document.getElementById('grammar-modal');
const btnAddGrammar = document.getElementById('btn-add-grammar');
const closeGrammarModal = document.getElementById('close-grammar-modal');
const grammarForm = document.getElementById('grammar-form');
const grammarSearch = document.getElementById('grammar-search');
const grammarFilterHsk = document.getElementById('grammar-filter-hsk');
const grammarFilterLesson = document.getElementById('grammar-filter-lesson');

if (btnAddGrammar) btnAddGrammar.onclick = () => openGrammarModal();
if (closeGrammarModal) closeGrammarModal.onclick = () => closeGrammarModalFunc();
if (grammarSearch) grammarSearch.addEventListener('input', renderGrammar);
if (grammarFilterHsk) grammarFilterHsk.addEventListener('change', renderGrammar);
if (grammarFilterLesson) grammarFilterLesson.addEventListener('change', renderGrammar);

function openGrammarModal(id = null) {
    grammarModal.style.display = 'flex';
    if (id) {
        document.getElementById('grammar-modal-title-text').innerText = "Chỉnh sửa cấu trúc Ngữ pháp";
        const item = grammar.find(g => g.id === id);
        if (item) {
            document.getElementById('grammar-id').value = item.id;
            document.getElementById('grammar-pattern').value = item.pattern;
            document.getElementById('grammar-pinyin').value = item.pinyin || '';
            document.getElementById('grammar-meaning').value = item.meaning;
            document.getElementById('grammar-hsk').value = item.hsk || '';
            document.getElementById('grammar-lesson').value = item.lesson || '';
            document.getElementById('grammar-explanation').value = item.explanation || '';
            document.getElementById('grammar-example').value = item.example || '';
            document.getElementById('grammar-notes').value = item.notes || '';
        }
    } else {
        document.getElementById('grammar-modal-title-text').innerText = "Thêm cấu trúc ngữ pháp mới";
        grammarForm.reset();
        document.getElementById('grammar-id').value = '';
    }
}

function closeGrammarModalFunc() { grammarModal.style.display = 'none'; }

if (grammarForm) {
    grammarForm.onsubmit = function(e) {
        e.preventDefault();
        const id = document.getElementById('grammar-id').value;
        const pattern = document.getElementById('grammar-pattern').value.trim();
        const pinyin = document.getElementById('grammar-pinyin').value.trim();
        const meaning = document.getElementById('grammar-meaning').value.trim();
        const hsk = document.getElementById('grammar-hsk').value.trim() || "HSK 1";
        const lesson = document.getElementById('grammar-lesson').value.trim() || "Chưa rõ";
        const explanation = document.getElementById('grammar-explanation').value.trim();
        const example = document.getElementById('grammar-example').value.trim();
        const notesText = document.getElementById('grammar-notes').value.trim();

        if (id) {
            const index = grammar.findIndex(g => g.id == id);
            if (index !== -1) {
                grammar[index] = { 
                    ...grammar[index], pattern, pinyin, meaning, hsk, lesson, 
                    explanation, example, notes: notesText 
                };
            }
        } else {
            grammar.push({
                id: Date.now(), pattern, pinyin, meaning, hsk, lesson, 
                explanation, example, notes: notesText,
                createdAt: new Date().toISOString()
            });
            stats.grammarStudiedToday++;
        }
        saveToStorage();
        closeGrammarModalFunc();
        renderGrammar();
    };
}

window.deleteGrammar = function(id) {
    if (confirm("Bạn có chắc muốn xóa vĩnh viễn cấu trúc ngữ pháp này?")) {
        grammar = grammar.filter(g => g.id !== id);
        saveToStorage();
        renderGrammar();
    }
}

function renderGrammar() {
    const container = document.getElementById('grammar-list');
    if (!container) return;
    container.innerHTML = '';
    
    const query = grammarSearch.value.toLowerCase();
    const hskFilter = grammarFilterHsk.value;
    const lessonFilter = grammarFilterLesson.value;

    grammar.forEach(item => {
        // Quét tìm kiếm thông minh trên cả 9 trường dữ liệu của Schema cấu trúc mới
        const matchAllFields = 
            item.pattern.toLowerCase().includes(query) ||
            (item.pinyin && item.pinyin.toLowerCase().includes(query)) ||
            item.meaning.toLowerCase().includes(query) ||
            (item.explanation && item.explanation.toLowerCase().includes(query)) ||
            (item.example && item.example.toLowerCase().includes(query)) ||
            (item.hsk && item.hsk.toLowerCase().includes(query)) ||
            (item.lesson && item.lesson.toLowerCase().includes(query)) ||
            (item.notes && item.notes.toLowerCase().includes(query));

        const matchesHsk = hskFilter === 'all' || item.hsk === hskFilter;
        const matchesLesson = lessonFilter === 'all' || item.lesson === lessonFilter;

        if (matchAllFields && matchesHsk && matchesLesson) {
            const card = document.createElement('div');
            card.className = 'grammar-card';
            
            // Format ngày tạo thân thiện người dùng
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Không rõ';

            card.innerHTML = `
                <div class="grammar-title-row">
                    <div>
                        <div class="grammar-pattern">${item.pattern}</div>
                        ${item.pinyin ? `<div class="grammar-pinyin-line">(${item.pinyin})</div>` : ''}
                    </div>
                    <div>
                        <button class="action-btn" onclick="openGrammarModal(${item.id})">✏️</button>
                        <button class="action-btn" onclick="deleteGrammar(${item.id})">🗑️</button>
                    </div>
                </div>

                <div class="grammar-meaning-title">💡 Ý nghĩa: ${item.meaning}</div>
                
                ${item.explanation ? `<div class="grammar-explanation">${item.explanation}</div>` : ''}
                
                <div class="grammar-meta">
                    <span class="badge badge-lesson">${item.lesson || 'Bài học'}</span>
                    <span class="badge badge-hsk">${item.hsk || 'HSK'}</span>
                </div>

                ${item.example ? `
                    <div class="grammar-examples">
                        <div class="ex-zh" style="white-space: pre-line;">${item.example}</div>
                    </div>
                ` : ''}

                ${item.notes ? `
                    <div class="grammar-notes-box">
                        <strong>📌 Lưu ý:</strong> ${item.notes}
                    </div>
                ` : ''}

                <div class="grammar-date">Ngày tạo: ${dateStr}</div>
            `;
            container.appendChild(card);
        }
    });
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

function renderNotes() {
    const container = document.getElementById('notes-grid'); if(!container) return; container.innerHTML = '';
    notes.forEach(n => {
        const div = document.createElement('div'); div.className = 'note-card';
        div.innerHTML = `<div><div class="note-title">${n.title}</div><div class="note-body">${n.content}</div></div>`;
        container.appendChild(div);
    });
}

// --- IMPORT / EXPORT CSV CONTROLLER ---
document.getElementById('btn-export-csv')?.addEventListener('click', exportVocabularyToCSV);
document.getElementById('btn-import-csv')?.addEventListener('click', importVocabularyFromCSV);

function escapeCSVField(field) {
    if (field === null || field === undefined) return '';
    let stringValue = String(field);
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
}

function exportVocabularyToCSV() {
    const headers = ["Hanzi", "Pinyin", "Meaning", "HSK", "Lesson", "POS", "Radical", "Structure", "Example", "Tags", "Notes"];
    let csvRows = [headers.join(',')];

    vocabulary.forEach(word => {
        const tagsString = word.tags ? word.tags.join(';') : '';
        const row = [
            escapeCSVField(word.hanzi), escapeCSVField(word.pinyin), escapeCSVField(word.meaning),
            escapeCSVField(word.hsk), escapeCSVField(word.lesson), escapeCSVField(word.pos),
            escapeCSVField(word.radical), escapeCSVField(word.structure), escapeCSVField(word.example),
            escapeCSVField(tagsString), escapeCSVField(word.notes)
        ];
        csvRows.push(row.join(','));
    });

    const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TrungVietHoc_Vocabulary_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function parseCSVLine(text) {
    let p = '', r = []; let q = false;
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        if (c === '"') { q = !q; }
        else if (c === ',' && !q) { r.push(p); p = ''; }
        else { p += c; }
    }
    r.push(p);
    return r.map(f => (f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1) : f).replace(/""/g, '"').trim());
}

function importVocabularyFromCSV() {
    const fileInput = document.getElementById('csv-file-input');
    if (!fileInput?.files?.[0]) { alert("Vui lòng chọn một tệp tin CSV trước!"); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) { alert("File trống!"); return; }

        let importedWords = [];
        let timestamp = Date.now();

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length < 3 || !values[0] || !values[1]) continue;

            importedWords.push({
                id: timestamp + i, hanzi: values[0], pinyin: values[1], meaning: values[2],
                hsk: values[3] || 'HSK 1', lesson: values[4] || 'Chưa rõ', pos: values[5] || '',
                radical: values[6] || '', structure: values[7] || '', example: values[8] || '',
                tags: values[9] ? values[9].split(';').map(t => t.trim()) : [], notes: values[10] || '',
                learned: false, favorite: false, nextReview: new Date().toISOString(), reviewCount: 0, createdAt: new Date().toISOString()
            });
        }

        const mode = document.querySelector('input[name="import-mode"]:checked').value;
        if (mode === 'overwrite') vocabulary = importedWords;
        else importedWords.forEach(n => { if (!vocabulary.some(v => v.hanzi === n.hanzi)) vocabulary.push(n); });

        saveToStorage();
        alert("Xử lý hoàn tất tệp dữ liệu.");
        navigateTo('vocabulary');
    };
    reader.readAsText(fileInput.files[0], 'UTF-8');
}

// Boot initial state
updateDashboard();