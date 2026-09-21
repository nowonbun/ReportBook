# 나의 독서기록

제공된 세 가지 시안을 바탕으로 만든 TypeScript 웹사이트입니다. 대시보드, 도서 목록, 독서 기록 작성 외에 카테고리·검색·통계·메모·설정 화면을 포함합니다.

## 소스 구조

```text
client/   HTML, CSS, 브라우저 TypeScript, 클라이언트 이미지
server/   HTTP 서버, API, SQLite 저장소
scripts/  TypeScript 빌드 스크립트
test/     DB, API, 프런트엔드 및 빌드 테스트
data/     실행 중 생성되는 SQLite 파일
dist/     빌드 결과물
```

## 실행

Node.js 25 환경에서 확인했습니다. Docker는 Node.js 24 공식 이미지를 사용합니다. 외부 npm 패키지 설치는 필요하지 않습니다.

```powershell
cd D:\work\ReportBook\src
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다. `npm run build`는 `dist` 폴더에 실행 파일을 만듭니다.

## 테스트

```powershell
npm test
```

`test/db.test.mjs`는 SQLite 파일의 재연결·CRUD·입력 검증을, `test/api.test.mjs`는 HTTP API를, `test/frontend.test.mjs`는 화면의 API 읽기·저장 및 빈 상태를 검사합니다. 새 기능은 실패하는 테스트를 먼저 추가한 뒤 구현합니다.

## Docker

```powershell
cd D:\work\ReportBook\src
docker compose up --build -d
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다. 중지는 `docker compose down`입니다. SQLite 파일은 호스트의 `D:\work\ReportBook\src\data\reportbook.sqlite`에 저장되며, 컨테이너에서는 `/app/data/reportbook.sqlite`로 연결됩니다.

## 데이터

독서 기록은 SQLite에 저장되며 새 데이터베이스는 빈 상태에서 시작합니다. 설정 화면에서 JSON 백업을 다운로드할 수 있습니다. 임시저장 초안만 현재 브라우저의 `localStorage`에 저장됩니다.
