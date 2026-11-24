# Sermon Illustration Finder

Search your sermon illustrations and quotes by theme, type, tone, audience, season or Bible passage, then insert a link, the full text or the application point straight into the note you are writing. Everything runs inside your vault: no network access, no AI.

> Source is viewable, but this is not open-source software. Free to install and use for personal, church and non-profit purposes. See [LICENSE](LICENSE).

## How it works

- Reads the properties of notes in your illustration folder (and, optionally, the `04 예화` / `05 인용문` notes inside each book folder): `theme`, `topics`, `type`, `tone`, `season`, `audience`, `bible_refs`, `usage_points`.
- The command 「예화 탐색」 (Find illustration) opens a search window with free-text search and filters. Bible passages can be typed with Korean abbreviations (for example `요 4:14`).
- For each result you can insert a `[[link]]`, one application line, the full text, or open the note.
- Notes that are hubs or lists rather than illustrations are skipped.

## Setup

1. Put your illustrations in one folder and set it in Settings → Sermon Illustration Finder (default `예화`). The book folder defaults to `도서`.
2. Add the properties above to your notes. A note with only a title and body is still found by free-text search.

The interface and the category lists (themes, types, seasons) are in Korean and follow the Pastor PKM Institute illustration standard.

Author: Myoungcheul Joo, https://pkm-institute.netlify.app

---

## 한국어 안내

예화·책 예화·인용문을 큰 주제·주제·유형·분위기·대상·절기·성경본문(약자 포함)으로 찾아 링크·본문·적용점을 노트에 삽입하는 플러그인입니다. 인터넷 연결과 AI를 쓰지 않습니다.

1. 설정에서 **예화자료 폴더**(기본 `예화`)와 **책 폴더**(기본 `도서`)를 자기 볼트에 맞게 정합니다.
2. 명령 팔레트에서 **「예화 탐색」**을 실행합니다. 단축키는 옵시디언 설정 → 단축키에서 지정합니다.
3. 노트 속성(`theme`·`topics`·`type`·`tone`·`season`·`audience`·`bible_refs`·`usage_points`)이 있으면 필터로 찾을 수 있습니다.

**0.3.0 바뀐 점:** 기본 폴더 이름이 일반 볼트용(`예화`·`도서`)으로 바뀌었습니다. 예전 폴더를 쓰던 분은 설정에서 폴더를 다시 지정해 주세요. 명령 ID가 짧아져서 단축키를 다시 지정해야 할 수 있습니다.

만든 이: 주명철 (목회자 PKM 연구소)
