// --- SAMPLE INITIAL DATA ---
const sampleVocabulary = [
    { 
        id: 1, hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Chào bạn", hsk: "HSK 1", lesson: "Bài 1", 
        pos: "Thán từ", radical: "亻 (Nhân)", structure: "Tả hữu", 
        example: "你好！很高兴认识ni。", tags: ["giaotiep"], notes: "Từ cơ bản", 
        learned: true, favorite: false,
        nextReview: new Date().toISOString(), reviewCount: 2, createdAt: "2026-01-01T00:00:00.000Z"
    },
    { 
        id: 2, hanzi: "谢谢", pinyin: "xièxie", meaning: "Cảm ơn", hsk: "HSK 1", lesson: "Bài 1", 
        pos: "Động từ", radical: "讠 (Ngôn)", structure: "Tả hữu", 
        example: "谢谢你的帮助。", tags: ["giaotiep"], notes: "Từ tiếp theo thanh nhẹ", 
        learned: true, favorite: true,
        nextReview: new Date().toISOString(), reviewCount: 5, createdAt: "2026-01-02T00:00:00.000Z"
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

// --- STORAGE BOOTSTRAP ---
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
    if (targetPage) targetPage.add
    if (targetPage) targetPage.classList.add('active');

    if (targetPageId === 'dashboard') updateDashboard();
    if (targetPageId === 'vocabulary') renderVocabulary();
    if (targetPageId === 'grammar') renderGrammar();
    if (targetPageId === 'flashcards') initFlashcards();
    if (targetPageId === 'quiz') resetQuizUI();
    if (targetPageId === 'notebook') renderNotes();
}

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

// --- VOCABULARY MANAGEMENT LOGIC (NEW FEATURES) ---
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
            document.getElementById('v-hanzi').value = word.hanzi;
            document.getElementById('v-pinyin').value = word.pinyin;
            document.getElementById('v-meaning').value = word.meaning;
            document.getElementById('v-hsk').value = word.hsk || '';
            document.getElementById('v-lesson').value = word.lesson || '';
            document.getElementById('v-pos').value = word.pos || '';
            document.getElementById('v-radical').value = word.radical || '';
            document.getElementById('v-structure').value = word.structure || '';
            document.getElementById('v-example').value = word.example || '';
            document.getElementById('v-tags').value = word.tags ? word.tags.join(', ') : '';
            document.getElementById('v-notes').value = word.notes || '';
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
        const hanzi = document.getElementById('v-hanzi').value.trim();
        const pinyin = document.getElementById('v-pinyin').value.trim();
        const meaning = document.getElementById('v-meaning').value.trim();
        const hsk = document.getElementById('v-hsk').value.trim() || "HSK 1";
        const lesson = document.getElementById('v-lesson').value.trim() || "Bài 1";
        const pos = document.getElementById('v-pos').value.trim();
        const radical = document.getElementById('v-radical').value.trim();
        const structure = document.getElementById('v-structure').value.trim();
        const example = document.getElementById('v-example').value.trim();
        const rawTags = document.getElementById('v-tags').value;
        const notesContent = document.getElementById('v-notes').value.trim();

        const tags = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);

        if (id) {
            // Edit Mode
            const index = vocabulary.findIndex(v => v.id == id);
            if (index !== -1) {
                vocabulary[index] = { 
                    ...vocabulary[index], hanzi, pinyin, meaning, hsk, lesson, 
                    pos, radical, structure, example, tags, notes: notesContent 
                };
            }
        } else {
            // Create Mode
            const newVocab = {
                id: Date.now(), hanzi, pinyin, meaning, hsk, lesson,
                pos, radical, structure, example, tags, notes: notesContent,
                learned: false, favorite: false,
                nextReview: new Date().toISOString(), reviewCount: 0, createdAt: new Date().toISOString()
            };
            vocabulary.push(newVocab);
        }

        saveToStorage();
        closeVocabModalFunc();
        renderVocabulary();
    }
}

function deleteVocabulary(id) {
    if (confirm("Bạn có chắc chắn muốn xóa từ vựng này khỏi hệ thống dữ liệu?")) {
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
        const matchesSearch = 
            word.hanzi.includes(query) || word.pinyin.toLowerCase().includes(query) || 
            word.meaning.toLowerCase().includes(query) || (word.radical && word.radical.toLowerCase().includes(query));
        const matchesLesson = lessonFilter === 'all' || word.lesson === lessonFilter;

        if (matchesSearch && matchesLesson) {
            const tr = document.createElement('tr');
            const nextReviewDate = new Date(word.nextReview);
            const isOverdue = nextReviewDate <= new Date();
            const timeString = isOverdue ? "🔥 Cần ôn" : nextReviewDate.toLocaleDateString('vi-VN');

            tr.innerHTML = `
                <td>
                    <div class="hanzi-container">
                        <span class="hanzi-text">${word.hanzi}</span>
                        <span class="sub-info">Bộ: ${word.radical || 'N/A'} | ${word.structure || ''}</span>
                    </div>
                </td>
                <td>
                    <div><strong>${word.pinyin}</strong></div>
                    <div style="font-size:0.8rem; color:var(--text-secondary)">${word.pos || ''}</div>
                </td>
                <td>
                    <div>${word.meaning}</div>
                    <div style="font-size:0.75rem; color:#1cb0f6; max-width:200px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${word.example || ''}</div>
                </td>
                <td>
                    <span class="badge badge-lesson">${word.lesson}</span>
                    <span class="badge badge-hsk">${word.hsk || 'HSK'}</span>
                </td>
                <td>
                    <div class="review-info" style="color: ${isOverdue ? '#ea2b2b' : 'var(--text-primary)'}">${timeString}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary)">Đã ôn: ${word.reviewCount} lần</div>
                </td>
                <td>
                    <button class="action-btn" onclick="toggleFavoriteVocab(${word.id})" title="Yêu thích">${word.favorite ? '⭐' : '☆'}</button>
                    <button class="action-btn" onclick="toggleLearnedVocab(${word.id})" title="Đổi trạng thái học">${word.learned ? '🔄' : '✅'}</button>
                    <button class="action-btn" onclick="openVocabModal(${word.id})" title="Sửa">✏️</button>
                    <button class="action-btn" onclick="deleteVocabulary(${word.id})" title="Xóa">🗑️</button>
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
        if (word.learned) {
            stats.vocabLearnedToday++;
            word.reviewCount = 1;
            word.nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
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
            let examplesHTML = item.examples.map(ex => `
                <div class="example-item">
                    <div class="ex-zh">${ex.zh}</div>
                    <div class="ex-py">${ex.py}</div>
                    <div class="ex-vi">${ex.vi}</div>
                </div>
            `).join('');

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

// --- FLASHCARDS CONTROLLER (SRS LOGIC) ---
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
        document.getElementById('card-front-details').innerText = "";
        document.getElementById('card-back-pinyin').innerText = "";
        document.getElementById('card-back-meaning').innerText = "Hãy bổ sung thêm từ vựng.";
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

document.querySelectorAll('#smr-box .btn').forEach(btn => {
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

            let daysToAdd = 1;
            if (score === 2) daysToAdd = 2 * mainVocabItem.reviewCount;
            if (score === 3) daysToAdd = 4 * mainVocabItem.reviewCount;
            if (score === 4) daysToAdd = 7 * mainVocabItem.reviewCount;
            
            if (score === 1) {
                mainVocabItem.nextReview = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 phút sau
            } else {
                mainVocabItem.nextReview = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
            }
        }
        
        if (stats.vocabLearnedToday === 0 && stats.cardsReviewedToday === 1) {
            stats.streak += 1;
        }

        saveToStorage();
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
        alert("Cần có ít nhất 4 từ vựng để tạo bài trắc nghiệm mẫu!");
        return;
    }
    quizScore = 0; currentQuizIdx = 0;
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
        return { question: `Ý nghĩa của chữ Hán "${word.hanzi}" là gì?`, correctAnswer: word.meaning, options: options };
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
        btn.className = 'option-btn'; btn.innerText = opt;
        btn.onclick = () => selectOption(btn, opt, qData.correctAnswer);
        container.appendChild(btn);
    });
}

function selectOption(selectedBtn, chosenOpt, correctOpt) {
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    if (chosenOpt === correctOpt) {
        selectedBtn.classList.add('correct'); quizScore++;
    } else {
        selectedBtn.classList.add('wrong');
        document.querySelectorAll('.option-btn').forEach(b => { if (b.innerText === correctOpt) b.classList.add('correct'); });
    }
    setTimeout(() => {
        currentQuizIdx++;
        if (currentQuizIdx < quizQuestions.length) showQuizQuestion();
        else showQuizResult();
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
        noteForm.reset(); document.getElementById('note-id').value = '';
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
        saveToStorage(); closeModal(); renderNotes();
    };
}

function renderNotes() {
    const container = document.getElementById('notes-grid');
    if(!container) return;
    container.innerHTML = '';
    const query = noteSearch.value.toLowerCase();

    notes.forEach(note => {
        if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
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
    if (confirm("Bạn có chắc muốn xóa ghi chú này?")) { notes = notes.filter(n => n.id !== id); saveToStorage(); renderNotes(); }
}

// Khởi chạy
updateDashboard();
