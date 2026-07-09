// --- SAMPLE INITIAL DATA ---
const vocabularyData = [
  {
    id: 1,
    hanzi: "觉得",
    pinyin: "juéde",
    meaning: "cảm thấy",
    hsk: 3,
    lesson: 1,
    pos: "Động từ",
    radical: "觉",
    structure: "Trên-dưới",
    example: "我觉得这个电影很好看。",
    tags: ["cảm xúc", "giao tiếp"],
    notes: "Thường dùng để nêu ý kiến cá nhân",
    learned: false,
    favorite: false
  },
  {
    id: 2,
    hanzi: "机会",
    pinyin: "jīhuì",
    meaning: "cơ hội",
    hsk: 4,
    lesson: 1,
    pos: "Danh từ",
    radical: "隹",
    structure: "Trái-phải",
    example: "这是一个很好的机会。",
    tags: ["công việc", "cuộc sống"],
    notes: "",
    learned: false,
    favorite: false
  },
  {
    id: 3,
    hanzi: "越来越",
    pinyin: "yuèláiyuè",
    meaning: "càng ngày càng",
    hsk: 4,
    lesson: 2,
    pos: "Cấu trúc",
    radical: "",
    structure: "",
    example: "天气越来越热了。",
    tags: ["ngữ pháp"],
    notes: "Thường đi cùng tính từ hoặc động từ",
    learned: false,
    favorite: false
  }
];

const sampleGrammar = [
    {
        id: 1,
        pattern: "Subject + 是 + Object",
        explanation: "Dùng để khẳng định cái gì là cái gì (tương tự 'to be' trong tiếng Anh).",
        examples: [
            { zh: "我是越南人。", py: "Wǒ shì Yuènán rén.", vi: "Tôi là người Việt Nam." },
            { zh: "他是我的老师。", py: "Tā shì wǒ de lǎoshī.", vi: "Thầy ấy là giáo viên của tôi." }
        ],
        bookmarked: true
    },
    {
        id: 2,
        pattern: "Subject + 太 + Adj + 了",
        explanation: "Biểu thị mức độ cao hoặc cảm thán (Quá, lắm...).",
        examples: [
            { zh: "太好了！", py: "Tài hǎo le!", vi: "Quá tốt rồi / Tuyệt quá!" },
            { zh: "这个苹果太大了。", py: "Zhège píngguǒ tài dà le.", vi: "Quả táo này to quá." }
        ],
        bookmarked: false
    }
];

// --- APP STATE INITIALIZATION ---
let vocabulary = JSON.parse(localStorage.getItem('zh_vocab')) || sampleVocabulary;
let grammar = JSON.parse(localStorage.getItem('zh_grammar')) || sampleGrammar;
let notes = JSON.parse(localStorage.getItem('zh_notes')) || [];
let stats = JSON.parse(localStorage.getItem('zh_stats')) || {
    streak: 1,
    lastStudyDate: new Date().toDateString(),
    vocabLearnedToday: 2,
    cardsReviewedToday: 0,
    grammarStudiedToday: 1
};

// Save helper
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
        const target = item.getAttribute('data-target');
        navigateTo(target);
    });
});

function navigateTo(targetPageId) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
    
    const activeNav = document.querySelector(`.nav-item[data-target="${targetPageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) targetPage.classList.add('active');

    // Context execution upon loading page
    if (targetPageId === 'dashboard') updateDashboard();
    if (targetPageId === 'vocabulary') renderVocabulary();
    if (targetPageId === 'grammar') renderGrammar();
    if (targetPageId === 'flashcards') initFlashcards();
    if (targetPageId === 'quiz') resetQuizUI();
    if (targetPageId === 'notebook') renderNotes();
}

// --- DASHBOARD CONTROLLER ---
function updateDashboard() {
    // Check Streak
    const today = new Date().toDateString();
    if (stats.lastStudyDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (stats.lastStudyDate === yesterday.toDateString()) {
            // Consecutive day
            stats.streak += 0; // maintain until action resets it, or increment on dynamic interaction
        } else {
            // Streak broken if expired past a whole day without loading or resetting
        }
        // Reset daily tallies if new calendar day
        stats.vocabLearnedToday = vocabulary.filter(v => v.learned).length; // simple approximation
        stats.cardsReviewedToday = 0;
        stats.grammarStudiedToday = grammar.filter(g => g.bookmarked).length;
        stats.lastStudyDate = today;
        saveToStorage();
    }

    document.getElementById('streak-count').innerText = stats.streak;
    document.getElementById('stat-vocab-today').innerText = stats.vocabLearnedToday;
    document.getElementById('stat-cards-today').innerText = stats.cardsReviewedToday;
    document.getElementById('stat-grammar-today').innerText = stats.grammarStudiedToday;
}

// --- VOCABULARY CONTROLLER ---
const vocabSearch = document.getElementById('vocab-search');
const vocabFilterLesson = document.getElementById('vocab-filter-lesson');

if (vocabSearch) vocabSearch.addEventListener('input', renderVocabulary);
if (vocabFilterLesson) vocabFilterLesson.addEventListener('change', renderVocabulary);

function renderVocabulary() {
    const tbody = document.getElementById('vocab-list');
    tbody.innerHTML = '';
    const query = vocabSearch.value.toLowerCase();
    const lessonFilter = vocabFilterLesson.value;

    vocabulary.forEach(word => {
        const matchesSearch = word.hanzi.includes(query) || word.pinyin.toLowerCase().includes(query) || word.meaning.toLowerCase().includes(query);
        const matchesLesson = lessonFilter === 'all' || word.lesson === lessonFilter;

        if (matchesSearch && matchesLesson) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="hanzi-text">${word.hanzi}</td>
                <td>${word.pinyin}</td>
                <td>${word.meaning}</td>
                <td><span class="badge badge-lesson">${word.lesson}</span></td>
                <td>
                    <span class="badge ${word.learned ? 'badge-status' : 'badge-unlearned'}">
                        ${word.learned ? 'Đã thuộc' : 'Chưa thuộc'}
                    </span>
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
        if (word.learned) stats.vocabLearnedToday++;
        saveToStorage();
        renderVocabulary();
    }
}

// --- GRAMMAR CONTROLLER ---
const grammarSearch = document.getElementById('grammar-search');
if (grammarSearch) grammarSearch.addEventListener('input', renderGrammar);

function renderGrammar() {
    const container = document.getElementById('grammar-list');
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
                <div class="grammar-examples">
                    ${examplesHTML}
                </div>
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

// --- FLASHCARDS CONTROLLER ---
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
    activeDeck = [...vocabulary];
    currentCardIndex = 0;
    showCard();
}

function showCard() {
    if (activeDeck.length === 0) {
        document.getElementById('card-front-text').innerText = "Trống";
        document.getElementById('card-back-pinyin').innerText = "";
        document.getElementById('card-back-meaning').innerText = "Hãy thêm từ vựng để học.";
        return;
    }
    cardElement.classList.remove('flipped');
    document.getElementById('smr-box').style.display = 'none';

    const currentCard = activeDeck[currentCardIndex];
    document.getElementById('card-front-text').innerText = currentCard.hanzi;
    document.getElementById('card-back-pinyin').innerText = currentCard.pinyin;
    document.getElementById('card-back-meaning').innerText = currentCard.meaning;
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

document.querySelectorAll('.smr-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid re-flipping card
        stats.cardsReviewedToday++;
        saveToStorage();
        
        // Advance automatically
        currentCardIndex = (currentCardIndex + 1) % activeDeck.length;
        showCard();
    });
});

// --- QUIZ CONTROLLER ---
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
        alert("Bạn cần có ít nhất 4 từ vựng trong kho dữ liệu để làm trắc nghiệm!");
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
    // Pick 5 random words
    let shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    let chosenWords = shuffled.slice(0, Math.min(5, vocabulary.length));
    
    return chosenWords.map(word => {
        // Construct options: 1 correct + 3 wrong options
        let wrongOptions = vocabulary
            .filter(v => v.id !== word.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(v => v.meaning);
            
        let options = [word.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        return {
            question: `Ý nghĩa của chữ Hán "${word.hanzi}" (${word.pinyin}) là gì?`,
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
    // Disable all options
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    
    if (chosenOpt === correctOpt) {
        selectedBtn.classList.add('correct');
        quizScore++;
    } else {
        selectedBtn.classList.add('wrong');
        // highlight correct option
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
    }, 1500);
}

function showQuizResult() {
    document.getElementById('quiz-play-screen').style.display = 'none';
    document.getElementById('quiz-result-screen').style.display = 'block';
    document.getElementById('quiz-score-text').innerText = `${quizScore} / ${quizQuestions.length}`;
}

// --- STUDY NOTEBOOK CONTROLLER ---
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

function closeModal() {
    noteModal.style.display = 'none';
}

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
            // Edit mode
            const index = notes.findIndex(n => n.id == id);
            if (index !== -1) {
                notes[index] = { ...notes[index], title, tags, content, date: dateString };
            }
        } else {
            // Creative mode
            const newNote = {
                id: Date.now(),
                title,
                tags,
                content,
                date: dateString
            };
            notes.push(newNote);
        }
        
        saveToStorage();
        closeModal();
        renderNotes();
    };
}

function renderNotes() {
    const container = document.getElementById('notes-grid');
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
    if (confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
        notes = notes.filter(n => n.id !== id);
        saveToStorage();
        renderNotes();
    }
}

// Initial Boot Run
updateDashboard();
