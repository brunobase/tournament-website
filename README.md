# 프로젝트 이름
멸망전

## 프로젝트 소개
이 프로젝트는 친구들과 멸망전을 하기 위해서 만들었습니다.
참가자의 라이엇 아이디로 api를 통해 랭크의 정보를 가져와서 등록할 수 있고 제한 점수안에서 팀을 구성해서 경기를 진행할 수 있도록 만들었습니다.

## 사용 기술

### 프론트엔드
- HTML / CSS / JavaScript

### 벡엔드
- Supabase — 데이터베이스, 인증(로그인/회원가입/비밀번호 재설정)
- Supabase Edge Functions (Deno + TypeScript) — 점수 계산 서버 로직

### 외부 API
- Riot Games API — 소환사 랭크 정보 조회

## 주요 기능
- 참가자 등록
- api를 통한 점수 등록
- 제한 점수 이내 팀 등록

## 프로젝트 구조
```
멸망전/
├── .gitignore
├── config.js
├── index.html
├── login.html
├── signup.html
├── find-pw.html
├── update-password.html
├── profile.html
├── team.html
├── css/
│   ├── auth.css
│   ├── main.css
│   ├── profile.css
│   └── team.css
├── js/
│   ├── auth.js
│   └── main.js
├── image/
│   ├── top.svg
│   ├── bottom.svg
│   ├── mid.svg
│   ├── jungle.svg
│   └── support.svg
└── supabase/
    ├── config.toml
    └── functions/
        └── calculate-score/
            ├── index.ts
            ├── deno.json
            └── .npmrc
```

## 실행 방법
index.html 파일을 브라우저에서 실행하면 사용할 수 있습니다.

## 배운 점
이 프로젝트를 통해 HTML, CSS, JavaScript를 사용해서 웹사이트를 직접 만들어보는 경험을 할 수 있었습니다. 아이디어를 실제로 구현해내면서 개발에 대한 더 많은 관심을 가지게 되었습니다.
