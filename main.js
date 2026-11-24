'use strict';

// 예화 탐색기 v0.3.0 — 목회자 공통 프론트매터 표준 v1.2 (2026-10-16) 대응
// 새로 쓰는 속성: theme · topics(118) · core_message · type(이야기/자료) · tone · season · caution · 성경 약자

const { Plugin, Modal, Notice, PluginSettingTab, Setting, MarkdownView, normalizePath } = require('obsidian');

const DEFAULT_SETTINGS = {
  folder: '예화',
  booksFolder: '도서',
};

// 표준 2항 — 큰 주제 13개와 주제 118개
const THEMES = {
  '복음과 구원': ['은혜', '하나님의 사랑', '십자가', '부활', '거듭남', '구원의 확신', '하나님의 자녀', '영접과 결단', '하나님 나라', '예수 그리스도'],
  '죄와 회개': ['죄', '유혹', '욕심', '거짓', '회개', '죄 사함', '양심', '영적 싸움'],
  '믿음과 신뢰': ['믿음의 결단', '의심과 확신', '맡김', '섭리', '기적', '염려와 두려움', '하나님의 약속', '창조주 하나님', '하나님의 성품', '신앙과 세계관', '하나님의 인도와 분별'],
  '성결과 성화': ['성결', '성품 변화', '순종', '정직', '절제', '경건 훈련', '말과 혀', '성숙', '그리스도와의 동행'],
  '성령과 치유': ['성령 충만', '성령의 열매', '은사', '신유', '마음의 상처와 치유', '질병과 건강'],
  '재림과 영생': ['죽음', '천국', '재림', '심판', '영원한 소망', '이별과 장례', '인생의 마지막 준비'],
  '사랑과 화해': ['이웃 사랑', '원수 사랑', '서로 용서', '화해', '관계 회복', '우정', '하나됨', '친절과 배려'],
  '겸손과 섬김': ['겸손', '교만', '섬김', '희생', '나눔과 구제', '충성', '봉사', '헌신'],
  '고난과 위로': ['고난의 의미', '시련 극복', '인내', '위로', '상실과 슬픔', '낙심과 절망', '외로움', '실패와 재기', '기다림'],
  '기도와 예배': ['기도 응답', '끈질긴 기도', '중보기도', '기도의 삶', '예배', '찬양', '감사', '말씀 묵상', '주일과 안식', '헌금과 십일조'],
  '제자도와 사명': ['제자의 길', '소명과 사명', '전도', '선교', '순교와 박해', '용기', '비전', '부흥', '섬기는 리더십'],
  '교회와 가정': ['교회', '성도의 교제', '부부', '자녀교육', '부모 공경', '가정 신앙', '노년', '다음 세대', '목회자', '설교와 말씀 사역'],
  '삶과 지혜': ['지혜', '시간', '물질과 재정', '일과 직장', '청지기', '정의와 공의', '나라와 사회', '정체성과 자존감', '습관', '성공과 실패', '행복과 만족', '창조세계와 환경', '참된 복과 기복'],
};

// 표준 4항 — 예화 type
const STORY_TYPES = ['실화', '인물', '역사', '간증', '우화', '비유', '유머', '시'];
const MATERIAL_TYPES = ['성경배경', '인용', '교훈'];
const TONES = ['감동', '위로', '도전', '경고', '웃음', '깨달음'];
const SEASONS = ['신년', '사순절', '고난주간', '부활절', '어버이주일', '성령강림절', '맥추감사절', '추수감사절', '종교개혁주일', '성탄절', '송년'];

// 예화가 아닌 노트(허브·목록·안내문 등)는 색인에서 뺀다
const NON_ILLUSTRATION_TYPES = new Set([
  '아이디어노트', 'idea', '인용문모음', '예화허브', 'index-note', '예화인덱스', '예화집',
  'deprecated', '주석', '설교자료', 'README', '메타노트',
]);

// 개역개정 약자 → 전체 이름
const BOOKS = [
  ['창세기', '창'], ['출애굽기', '출'], ['레위기', '레'], ['민수기', '민'], ['신명기', '신'],
  ['여호수아', '수'], ['사사기', '삿'], ['룻기', '룻'], ['사무엘상', '삼상'], ['사무엘하', '삼하'],
  ['열왕기상', '왕상'], ['열왕기하', '왕하'], ['역대상', '대상'], ['역대하', '대하'], ['에스라', '스'],
  ['느헤미야', '느'], ['에스더', '에'], ['욥기', '욥'], ['시편', '시'], ['잠언', '잠'],
  ['전도서', '전'], ['아가', '아'], ['이사야', '사'], ['예레미야', '렘'], ['예레미야애가', '애'],
  ['에스겔', '겔'], ['다니엘', '단'], ['호세아', '호'], ['요엘', '욜'], ['아모스', '암'],
  ['오바댜', '옵'], ['요나', '욘'], ['미가', '미'], ['나훔', '나'], ['하박국', '합'],
  ['스바냐', '습'], ['학개', '학'], ['스가랴', '슥'], ['말라기', '말'],
  ['마태복음', '마'], ['마가복음', '막'], ['누가복음', '눅'], ['요한복음', '요'], ['사도행전', '행'],
  ['로마서', '롬'], ['고린도전서', '고전'], ['고린도후서', '고후'], ['갈라디아서', '갈'], ['에베소서', '엡'],
  ['빌립보서', '빌'], ['골로새서', '골'], ['데살로니가전서', '살전'], ['데살로니가후서', '살후'],
  ['디모데전서', '딤전'], ['디모데후서', '딤후'], ['디도서', '딛'], ['빌레몬서', '몬'], ['히브리서', '히'],
  ['야고보서', '약'], ['베드로전서', '벧전'], ['베드로후서', '벧후'], ['요한일서', '요일'], ['요한이서', '요이'],
  ['요한삼서', '요삼'], ['유다서', '유'], ['요한계시록', '계'],
];
const BOOK_FULL = new Map();
for (const [full, abbr] of BOOKS) {
  BOOK_FULL.set(full, full);
  BOOK_FULL.set(abbr, full);
}
BOOK_FULL.set('계시록', '요한계시록');
BOOK_FULL.set('요한1서', '요한일서');
BOOK_FULL.set('요한2서', '요한이서');
BOOK_FULL.set('요한3서', '요한삼서');

function asArray(v) {
  if (Array.isArray(v)) return v.filter((x) => x !== null && x !== undefined && x !== '').map(String);
  if (v === null || v === undefined || v === '') return [];
  return [String(v)];
}

function usagePointTexts(up) {
  const out = [];
  if (Array.isArray(up)) {
    for (const item of up) {
      if (item && typeof item === 'object') {
        for (const [k, v] of Object.entries(item)) out.push(`${k}: ${v}`);
      } else if (typeof item === 'string') {
        out.push(item);
      }
    }
  } else if (typeof up === 'string' && up) {
    out.push(up);
  }
  return out;
}

function stripFrontmatter(raw) {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? raw.slice(m[0].length) : raw;
}

// "마 5:3-12" → { book: '마태복음', start: 5, end: 5 }
// "마태복음 5:1-7:29" → { start: 5, end: 7 } / "마 5-7" → { start: 5, end: 7 }
function parseRef(s) {
  const m = String(s).trim().match(/^([1-3]?[가-힣]+)\s*(\d.*)?$/);
  if (!m) return null;
  const book = BOOK_FULL.get(m[1]);
  if (!book) return null;
  const rest = (m[2] || '').trim();
  if (!rest) return { book, start: null, end: null };
  const r = rest.match(/^(\d+)(?::[\d,\s]+)?(?:\s*[-–~]\s*(\d+)(:\d+)?)?/);
  if (!r) return { book, start: null, end: null };
  const start = parseInt(r[1], 10);
  let end = start;
  if (r[2]) {
    const firstHasColon = /^\d+:/.test(rest);
    // "5:3-12" → 같은 장 / "5:1-7:29" · "5-7" → 장 범위
    if (r[3] || !firstHasColon) end = parseInt(r[2], 10);
  }
  return { book, start, end };
}

function normRefLabel(s) {
  const m = String(s).trim().match(/^([1-3]?[가-힣]+)\s*(.*)$/);
  if (!m) return String(s);
  const full = BOOK_FULL.get(m[1]);
  return full ? (m[2] ? `${full} ${m[2]}` : full) : String(s);
}

// 검색어에서 성경 본문 찾기: "마 5", "마태복음 5:3", "롬8"
function extractRefQuery(query) {
  const re = /([1-3]?[가-힣]+)\s*(\d+)(?::(\d+))?/g;
  let m;
  while ((m = re.exec(query)) !== null) {
    const book = BOOK_FULL.get(m[1]);
    if (book) {
      return {
        ref: { book, chapter: parseInt(m[2], 10) },
        rest: (query.slice(0, m.index) + ' ' + query.slice(m.index + m[0].length)).trim(),
      };
    }
  }
  return { ref: null, rest: query };
}

class IllustrationModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.shown = 40;
    this.results = [];
  }

  addSelect(parent, placeholder) {
    const sel = parent.createEl('select');
    sel.createEl('option', { text: placeholder, value: '' });
    return sel;
  }

  onOpen() {
    const { contentEl } = this;
    const P = this.plugin;
    contentEl.empty();
    contentEl.addClass('sif-modal');
    this.modalEl.addClass('sif-modal-wide');
    contentEl.createEl('h3', { text: '예화 탐색' });

    // 1줄: 검색어 + 지금 노트 본문으로 + 찾기
    const row1 = contentEl.createDiv({ cls: 'sif-filter-row' });
    this.inputEl = row1.createEl('input', {
      type: 'text',
      placeholder: '검색어 (주제·키워드·핵심 문장·본문 예: 마 5, 로마서 8:28)',
    });
    const fromNoteBtn = row1.createEl('button', { text: '지금 노트 본문으로' });
    fromNoteBtn.setAttr('title', '열린 노트의 bible_refs·bible_book과 큰 주제로 찾습니다');
    const searchBtn = row1.createEl('button', { text: '찾기', cls: 'mod-cta' });

    // 2줄: 큰 주제 · 주제 · 유형 · 분위기
    const row2 = contentEl.createDiv({ cls: 'sif-filter-row sif-filter-wrap' });
    this.themeSelect = this.addSelect(row2, '큰 주제 전체');
    for (const th of Object.keys(THEMES)) {
      const c = P.counts.theme.get(th) || 0;
      this.themeSelect.createEl('option', { text: `${th} (${c})`, value: th });
    }
    this.topicSelect = this.addSelect(row2, '주제 전체');
    this.fillTopics('');

    this.typeSelect = this.addSelect(row2, '유형 전체');
    this.typeSelect.createEl('option', { text: '— 이야기만', value: '@이야기' });
    this.typeSelect.createEl('option', { text: '— 자료만', value: '@자료' });
    const addTypeGroup = (label, list) => {
      const g = this.typeSelect.createEl('optgroup');
      g.setAttr('label', label);
      for (const t of list) {
        const c = P.counts.type.get(t) || 0;
        if (c) g.createEl('option', { text: `${t} (${c})`, value: t });
      }
    };
    addTypeGroup('이야기', STORY_TYPES);
    addTypeGroup('자료', MATERIAL_TYPES);
    const others = Array.from(P.counts.type.keys())
      .filter((t) => !STORY_TYPES.includes(t) && !MATERIAL_TYPES.includes(t))
      .sort();
    if (others.length) addTypeGroup('기타(표준 밖)', others);

    this.toneSelect = null;
    const toneTotal = TONES.reduce((s, t) => s + (P.counts.tone.get(t) || 0), 0);
    if (toneTotal > 0) {
      this.toneSelect = this.addSelect(row2, '분위기 전체');
      for (const t of TONES) {
        const c = P.counts.tone.get(t) || 0;
        if (c) this.toneSelect.createEl('option', { text: `${t} (${c})`, value: t });
      }
    }

    // 3줄: 대상 · 절기 · 출처 · 주의 빼기
    const row3 = contentEl.createDiv({ cls: 'sif-filter-row sif-filter-wrap' });
    this.audienceSelect = this.addSelect(row3, '대상 전체');
    const audGroups = new Map();
    for (const [a, c] of P.counts.audience.entries()) {
      if (a === '전체') continue;
      const g = a.includes('/') ? a.split('/')[0] : '기타';
      if (!audGroups.has(g)) audGroups.set(g, []);
      audGroups.get(g).push([a, c]);
    }
    for (const g of ['연령', '신앙', '상황', '자리', '기타']) {
      const list = (audGroups.get(g) || [])
        .filter(([, c]) => c >= (g === '기타' ? 5 : 1))
        .sort((x, y) => y[1] - x[1]);
      if (!list.length) continue;
      const og = this.audienceSelect.createEl('optgroup');
      og.setAttr('label', g);
      for (const [a, c] of list.slice(0, 25)) {
        og.createEl('option', { text: `${a.replace(/^[^/]+\//, '')} (${c})`, value: a });
      }
    }

    this.seasonSelect = this.addSelect(row3, '절기 전체');
    for (const s of SEASONS) {
      const c = P.counts.season.get(s) || 0;
      if (c) this.seasonSelect.createEl('option', { text: `${s} (${c})`, value: s });
    }

    this.sourceSelect = this.addSelect(row3, '출처 전체');
    for (const [v, label] of [['예화자료', '예화자료 폴더'], ['책예화', '책 예화 (04)'], ['책인용', '책 인용문 (05)'], ['카리스예화', '카리스 주석 예화']]) {
      this.sourceSelect.createEl('option', { text: `${label} (${P.counts.source.get(v) || 0})`, value: v });
    }

    const cautionLabel = row3.createEl('label', { cls: 'sif-check' });
    this.cautionCheck = cautionLabel.createEl('input', { type: 'checkbox' });
    cautionLabel.appendText(' 주의 표시 빼기');

    this.countEl = contentEl.createEl('p', { cls: 'sif-count' });
    this.resultsEl = contentEl.createDiv({ cls: 'sif-results' });

    const run = () => {
      this.shown = 40;
      this.runSearch();
    };
    searchBtn.addEventListener('click', run);
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') run();
    });
    this.themeSelect.addEventListener('change', () => {
      this.fillTopics(this.themeSelect.value);
      run();
    });
    for (const s of [this.topicSelect, this.typeSelect, this.toneSelect, this.audienceSelect, this.seasonSelect, this.sourceSelect, this.cautionCheck]) {
      if (s) s.addEventListener('change', run);
    }
    fromNoteBtn.addEventListener('click', () => this.fillFromActiveNote());

    this.inputEl.focus();
  }

  fillTopics(theme) {
    const P = this.plugin;
    const sel = this.topicSelect;
    const keep = sel.value;
    sel.querySelectorAll('optgroup').forEach((g) => g.remove());
    const themes = theme ? [theme] : Object.keys(THEMES);
    for (const th of themes) {
      const g = sel.createEl('optgroup');
      g.setAttr('label', th);
      for (const tp of THEMES[th]) {
        const c = P.counts.topic.get(tp) || 0;
        g.createEl('option', { text: `${tp} (${c})`, value: tp });
      }
    }
    if (keep && Array.from(sel.options).some((o) => o.value === keep)) sel.value = keep;
    else sel.value = '';
  }

  fillFromActiveNote() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice('열린 노트가 없습니다.');
      return;
    }
    const fm = (this.app.metadataCache.getFileCache(file) || {}).frontmatter || {};
    const refs = asArray(fm.bible_refs).length ? asArray(fm.bible_refs) : asArray(fm.bible_reference);
    let q = '';
    for (const r of refs) {
      const p = parseRef(r);
      if (p) {
        q = p.start ? `${p.book} ${p.start}` : p.book;
        break;
      }
    }
    if (!q && fm.bible_book) {
      const b = BOOK_FULL.get(String(fm.bible_book).trim());
      if (b) q = b;
    }
    const theme = asArray(fm.theme).find((t) => THEMES[t]);
    if (!q && !theme) {
      new Notice('이 노트에는 본문(bible_refs·bible_book)이나 큰 주제(theme)가 없습니다.');
      return;
    }
    this.inputEl.value = q;
    this.themeSelect.value = theme || '';
    this.fillTopics(this.themeSelect.value);
    this.shown = 40;
    this.runSearch();
    new Notice(`찾는 중: ${[q, theme].filter(Boolean).join(' · ')}`);
  }

  runSearch() {
    const filters = {
      theme: this.themeSelect.value,
      topic: this.topicSelect.value,
      type: this.typeSelect.value,
      tone: this.toneSelect ? this.toneSelect.value : '',
      audience: this.audienceSelect.value,
      season: this.seasonSelect.value,
      source: this.sourceSelect.value,
      noCaution: this.cautionCheck.checked,
    };
    const results = this.plugin.search(this.inputEl.value, filters);

    this.resultsEl.empty();
    if (results === null) {
      this.results = [];
      this.countEl.setText('검색어를 넣거나 거르기를 하나 이상 고르세요.');
      return;
    }
    this.results = results;
    this.countEl.setText(results.length === 0 ? '검색 결과가 없습니다.' : `${results.length}건`);
    this.renderSome();
  }

  renderSome() {
    this.resultsEl.querySelectorAll('.sif-more').forEach((el) => el.remove());
    const from = this.resultsEl.querySelectorAll('.sif-card').length;
    for (const r of this.results.slice(from, this.shown)) this.renderCard(r);
    if (this.results.length > this.shown) {
      const more = this.resultsEl.createEl('button', {
        text: `더 보기 (${this.results.length - this.shown}건 남음)`,
        cls: 'sif-more',
      });
      more.addEventListener('click', () => {
        this.shown += 40;
        this.renderSome();
      });
    }
  }

  renderCard(r) {
    const { entry } = r;
    const card = this.resultsEl.createDiv({ cls: 'sif-card' });

    const titleRow = card.createDiv({ cls: 'sif-title-row' });
    const titleEl = titleRow.createEl('span', { text: entry.title, cls: 'sif-title' });
    titleEl.setAttr('title', '클릭하면 [[링크]]를 삽입합니다');
    titleEl.addEventListener('click', () => this.insertLink(entry));

    if (entry.core_message) card.createDiv({ text: entry.core_message, cls: 'sif-core' });

    const metaEl = card.createDiv({ cls: 'sif-meta' });
    if (entry.bible_refs.length) {
      metaEl.createEl('span', { text: '📖 ' + entry.bible_refs.slice(0, 3).join(', '), cls: 'sif-chip' });
    }
    if (entry.theme) metaEl.createEl('span', { text: entry.theme, cls: 'sif-chip sif-chip-theme' });
    if (entry.type) metaEl.createEl('span', { text: entry.type, cls: 'sif-chip' });
    for (const t of entry.tone) metaEl.createEl('span', { text: t, cls: 'sif-chip' });
    for (const s of entry.season) metaEl.createEl('span', { text: '📅 ' + s, cls: 'sif-chip' });
    for (const a of entry.audience.filter((x) => x !== '전체').slice(0, 3)) {
      metaEl.createEl('span', { text: a.replace(/^[^/]+\//, ''), cls: 'sif-chip sif-chip-audience' });
    }
    for (const c of entry.caution.slice(0, 2)) {
      const chip = metaEl.createEl('span', {
        text: '⚠ ' + (c.length > 14 ? c.slice(0, 14) + '…' : c),
        cls: 'sif-chip sif-chip-warn',
      });
      chip.setAttr('title', c);
    }
    if (entry.book) metaEl.createEl('span', { text: '📚 ' + entry.book, cls: 'sif-chip' });

    if (entry.topics.length) card.createDiv({ text: '주제: ' + entry.topics.join(', '), cls: 'sif-topics' });

    const upTexts = r.upTexts && r.upTexts.length ? r.upTexts : usagePointTexts(entry.usage_points);
    for (const up of upTexts.slice(0, 3)) {
      const upRow = card.createDiv({ cls: 'sif-usage' });
      upRow.createSpan({ text: '· ' + up });
      const btn = upRow.createEl('button', { text: '삽입', cls: 'sif-mini-btn' });
      btn.addEventListener('click', () => this.insertText(up));
    }

    const actionRow = card.createDiv({ cls: 'sif-actions' });
    const linkBtn = actionRow.createEl('button', { text: '링크 삽입' });
    linkBtn.addEventListener('click', () => this.insertLink(entry));
    const bodyBtn = actionRow.createEl('button', { text: '본문 삽입' });
    bodyBtn.addEventListener('click', () => this.insertBody(entry));
    const openBtn = actionRow.createEl('button', { text: '열기' });
    openBtn.addEventListener('click', () => {
      this.app.workspace.openLinkText(entry.file.path, '', false);
      this.close();
    });
  }

  insertLink(entry) {
    const link = this.app.fileManager.generateMarkdownLink(entry.file, this.plugin.activePath() || '');
    this.insertText(link);
  }

  async insertBody(entry) {
    const raw = await this.app.vault.cachedRead(entry.file);
    this.insertText(stripFrontmatter(raw).trim());
  }

  insertText(text) {
    const editor = this.plugin.getActiveEditor();
    if (!editor) {
      new Notice('삽입할 노트가 열려 있지 않습니다.');
      return;
    }
    editor.replaceSelection(text);
    this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}

class SIFSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: '예화 탐색기 설정' });

    new Setting(containerEl)
      .setName('예화자료 폴더')
      .setDesc('예화 노트가 들어 있는 폴더. 예: 예화')
      .addText((text) =>
        text.setValue(this.plugin.settings.folder).onChange(async (value) => {
          this.plugin.settings.folder = value.trim();
          await this.plugin.saveSettings();
          this.plugin.scheduleIndex();
        })
      );

    new Setting(containerEl)
      .setName('책 폴더')
      .setDesc('책마다 04 예화 · 05 인용문을 함께 찾습니다. 예: 도서')
      .addText((text) =>
        text.setValue(this.plugin.settings.booksFolder).onChange(async (value) => {
          this.plugin.settings.booksFolder = value.trim();
          await this.plugin.saveSettings();
          this.plugin.scheduleIndex();
        })
      );

    new Setting(containerEl).addButton((btn) =>
      btn.setButtonText('색인 새로고침').onClick(() => {
        this.plugin.buildIndex();
        new Notice(`예화 ${this.plugin.index.length}건 색인 완료`);
        this.display();
      })
    );

    containerEl.createEl('p', {
      text: `현재 색인: ${this.plugin.index ? this.plugin.index.length : 0}건 (예화가 아닌 허브·목록 노트 ${this.plugin.skipped || 0}건 제외)`,
      cls: 'setting-item-description',
    });
    containerEl.createEl('p', {
      text: '단축키는 옵시디언 설정 → 단축키(Hotkeys)에서 "예화 탐색" 명령을 검색해 지정하세요.',
      cls: 'setting-item-description',
    });
  }
}

module.exports = class SermonIllustrationFinderPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.index = [];
    this.skipped = 0;
    this.counts = this.emptyCounts();
    this.indexTimer = null;

    this.app.workspace.onLayoutReady(() => this.buildIndex());

    const onChange = (file) => {
      if (this.inScope(file && file.path)) this.scheduleIndex();
    };
    this.registerEvent(this.app.metadataCache.on('changed', onChange));
    this.registerEvent(this.app.vault.on('delete', onChange));
    this.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
        if (this.inScope(file.path) || this.inScope(oldPath)) this.scheduleIndex();
      })
    );

    this.addCommand({
      id: 'open',
      name: '예화 탐색',
      callback: () => new IllustrationModal(this.app, this).open(),
    });

    this.addCommand({
      id: 'reindex',
      name: '예화 색인 새로고침',
      callback: () => {
        this.buildIndex();
        new Notice(`예화 ${this.index.length}건 색인 완료`);
      },
    });

    this.addSettingTab(new SIFSettingTab(this.app, this));
  }

  onunload() {
    if (this.indexTimer) window.clearTimeout(this.indexTimer);
  }

  emptyCounts() {
    return {
      theme: new Map(), topic: new Map(), type: new Map(), tone: new Map(),
      audience: new Map(), season: new Map(), source: new Map(),
    };
  }

  // 여러 노트가 한꺼번에 바뀔 때 색인을 한 번만 다시 만든다
  scheduleIndex() {
    if (this.indexTimer) window.clearTimeout(this.indexTimer);
    this.indexTimer = window.setTimeout(() => {
      this.indexTimer = null;
      this.buildIndex();
    }, 2000);
  }

  sourceOf(p) {
    if (!p) return null;
    p = p.normalize('NFC'); // 맥에서 조합형(NFD)으로 저장된 폴더 이름도 같게 본다
    const folder = normalizePath(this.settings.folder).normalize('NFC') + '/';
    if (p.startsWith(folder)) return '예화자료';
    const books = normalizePath(this.settings.booksFolder || DEFAULT_SETTINGS.booksFolder).normalize('NFC') + '/';
    if (!p.startsWith(books)) return null;
    const name = p.split('/').pop();
    if (name.startsWith('📑') || /^\d\d_/.test(name)) return null;
    if (p.includes('/04 예화/')) return '책예화';
    if (p.includes('/05 인용문/')) return '책인용';
    return null;
  }

  // 카리스 주석 노트 중 section_kind: 예화 인 것은 폴더와 상관없이 예화로 읽는다
  isKarisIllust(fm) {
    return !!(fm && fm.section_kind === '예화' && String(fm.source || '').includes('카리스'));
  }

  inScope(p) {
    if (!p || !p.endsWith('.md')) return false;
    if (this.sourceOf(p)) return true;
    const f = this.app.vault.getAbstractFileByPath(p);
    const c = f && this.app.metadataCache.getFileCache(f);
    return this.isKarisIllust(c && c.frontmatter);
  }

  bookNameOf(p) {
    const m = p.normalize('NFC').match(/\/([^/]+)\/0[45] (?:예화|인용문)\//);
    return m ? m[1] : '';
  }

  buildIndex() {
    const counts = this.emptyCounts();
    const bump = (map, k) => map.set(k, (map.get(k) || 0) + 1);
    const index = [];
    let skipped = 0;

    for (const f of this.app.vault.getMarkdownFiles()) {
      const cache = this.app.metadataCache.getFileCache(f);
      const fm = (cache && cache.frontmatter) || {};
      let source = this.sourceOf(f.path);
      const karis = !source && this.isKarisIllust(fm);
      if (karis) source = '카리스예화';
      if (!source) continue;
      const type = karis ? (asArray(fm.illust_type)[0] || '') : (asArray(fm.type)[0] || '');
      if (!karis && NON_ILLUSTRATION_TYPES.has(type)) {
        skipped++;
        continue;
      }
      const bibleRefs = asArray(fm.bible_refs).length ? asArray(fm.bible_refs) : asArray(fm.bible_reference);
      const parsedRefs = bibleRefs.map(parseRef).filter(Boolean);
      const bibleBook = BOOK_FULL.get(String(fm.bible_book || '').trim()) || '';
      const entry = {
        file: f,
        source,
        book: source === '예화자료' ? '' : (karis ? String(fm.bible_book || '') : this.bookNameOf(f.path)),
        title: String(fm.title || f.basename),
        tags: asArray(fm.tags),
        type,
        theme: asArray(fm.theme)[0] || '',
        topics: asArray(fm.topics),
        keywords: asArray(fm.keywords),
        core_message: String(fm.core_message || ''),
        tone: asArray(fm.tone),
        season: asArray(fm.season),
        caution: asArray(fm.caution),
        bible_refs: bibleRefs,
        bible_norm: bibleRefs.map(normRefLabel),
        parsed_refs: parsedRefs,
        bible_books: new Set([...parsedRefs.map((r) => r.book), ...(bibleBook ? [bibleBook] : [])]),
        audience: asArray(fm.audience),
        usage_points: fm.usage_points || [],
        quote: String(fm.quote || ''),
        speaker: String(fm.speaker || fm.author || ''),
      };
      bump(counts.source, source);
      if (entry.theme) bump(counts.theme, entry.theme);
      if (entry.type) bump(counts.type, entry.type);
      for (const t of entry.topics) bump(counts.topic, t);
      for (const t of entry.tone) bump(counts.tone, t);
      for (const a of entry.audience) bump(counts.audience, a);
      for (const s of entry.season) bump(counts.season, s);
      index.push(entry);
    }

    this.index = index;
    this.counts = counts;
    this.skipped = skipped;
  }

  passFilters(entry, f) {
    if (f.source && entry.source !== f.source) return false;
    if (f.topic) {
      if (!entry.topics.includes(f.topic)) return false;
    } else if (f.theme && entry.theme !== f.theme) {
      return false;
    }
    if (f.type) {
      if (f.type === '@이야기') {
        if (!STORY_TYPES.includes(entry.type)) return false;
      } else if (f.type === '@자료') {
        if (!MATERIAL_TYPES.includes(entry.type)) return false;
      } else if (entry.type !== f.type) {
        return false;
      }
    }
    if (f.tone && !entry.tone.includes(f.tone)) return false;
    if (f.audience && !entry.audience.includes(f.audience)) return false;
    if (f.season && !entry.season.includes(f.season)) return false;
    if (f.noCaution && entry.caution.length) return false;
    return true;
  }

  // 결과 배열을 돌려준다. 검색어도 거르기도 없으면 null.
  search(query, f) {
    const anyFilter = !!(f.theme || f.topic || f.type || f.tone || f.audience || f.season || f.source);
    const { ref, rest } = extractRefQuery(query || '');
    const terms = rest
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => (t.length >= 2 && BOOK_FULL.get(t) ? BOOK_FULL.get(t) : t));
    if (!ref && !terms.length && !anyFilter) return null;

    const results = [];
    for (const entry of this.index) {
      if (!this.passFilters(entry, f)) continue;
      const upTexts = usagePointTexts(entry.usage_points);
      let score = 0;

      if (ref) {
        let hit = 0;
        for (const r of entry.parsed_refs) {
          if (r.book !== ref.book) continue;
          if (r.start !== null && ref.chapter >= r.start && ref.chapter <= r.end) hit = Math.max(hit, 8);
          else hit = Math.max(hit, 3);
        }
        if (!hit && entry.bible_books.has(ref.book)) hit = 2;
        if (!hit) continue; // 본문을 넣으면 그 책이 걸린 노트만
        score += hit;
      }

      let allTermsHit = true;
      let termScore = 0;
      for (const term of terms) {
        let s = 0;
        if (entry.title.includes(term)) s += 5;
        if (entry.bible_books.has(term)) s += 4;
        else if (entry.bible_norm.some((x) => x.includes(term))) s += 4;
        if (entry.core_message.includes(term)) s += 4;
        if (entry.topics.some((x) => x.includes(term))) s += 3;
        if (entry.keywords.some((x) => x.includes(term))) s += 3;
        if (entry.theme.includes(term)) s += 2;
        if (upTexts.some((x) => x.includes(term))) s += 2;
        if (entry.tags.some((x) => x.includes(term))) s += 1;
        if (entry.speaker && entry.speaker.includes(term)) s += 3;
        if (entry.quote && entry.quote.includes(term)) s += 2;
        if (entry.book && entry.book.includes(term)) s += 2;
        if (s === 0) allTermsHit = false;
        termScore += s;
      }
      if (terms.length && termScore === 0) continue;
      // 낱말이 여러 개면 모두 걸린 노트를 앞에 둔다
      if (terms.length > 1 && allTermsHit) termScore += 10;
      score += termScore;

      results.push({ entry, score, upTexts });
    }

    results.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'ko'));
    return results;
  }

  activePath() {
    const f = this.app.workspace.getActiveFile();
    return f ? f.path : '';
  }

  getActiveEditor() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    return view ? view.editor : null;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
};
