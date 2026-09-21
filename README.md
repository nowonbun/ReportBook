# ReportBook

독서 기록을 관리하는 TypeScript 웹 애플리케이션입니다. 데이터는 SQLite에 저장하며 Docker로 실행할 수 있습니다.

## 빠른 시작

```powershell
cd D:\work\ReportBook\src
docker compose up --build -d
```

브라우저에서 [http://127.0.0.1:5173](http://127.0.0.1:5173)을 엽니다.

## 개발 및 테스트

```powershell
cd D:\work\ReportBook\src
npm run dev
npm test
```

SQLite 파일은 `src/data/reportbook.sqlite`에 생성됩니다. Docker 실행 시에도 같은 호스트 경로를 컨테이너의 `/app/data`에 연결해 데이터를 유지합니다.

## 프로젝트 구조

```text
src/client/   브라우저 TypeScript, HTML, CSS
src/server/   HTTP API와 SQLite 저장소
src/scripts/  빌드 스크립트
src/test/     자동화 테스트
src/data/     실행 중 생성되는 SQLite 데이터
```

세부 실행 방법, Docker 중지 방법 및 테스트 범위는 [src/README.md](src/README.md)를 참고하세요.
