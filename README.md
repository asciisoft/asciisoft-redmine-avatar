# asciisoft_redmine_avatar (v1.0.0)
Redmine 7.0 에서 프로필 사진을 올리고, 사용자 아이콘 자리에 표시하는 플러그인입니다.

## 기능
- 내 계정 아이콘 또는 "프로필 사진" 링크 → /my/avatar 에서 사진 선택, 끌기·확대로 자르기, 저장, 삭제
- 256x256 정사각형 JPEG 로 저장, 화면에는 원형으로 표시 (모양 변경: assets/stylesheets/asciisoft_avatar.css 의 border-radius)
- 사진이 없는 사용자는 Redmine 기본 아이콘(이니셜 또는 Gravatar) 그대로

## 저장 위치
`files/asciisoft_avatars/<사용자ID>.jpg` (Redmine 첨부파일 저장소 안, Docker 의 files 볼륨과 백업에 함께 포함)
- 파일 이름이 사용자 ID 라 다른 사용자와 겹치지 않음, 교체하면 이전 파일 삭제, 사용자 삭제 시 함께 삭제
- DB 를 쓰지 않아 마이그레이션 없음
- 특정 사용자의 사진을 관리자가 지우려면 해당 파일을 삭제

## 설치 (Docker)
```bash
cp -r asciisoft_redmine_avatar /srv/redmine/plugins/
cd /srv/redmine && docker compose restart redmine
```
삭제: 폴더를 지우고 재시작, 필요하면 files/asciisoft_avatars 폴더도 삭제

## 보안
- 파일 앞부분(매직 넘버)으로 JPEG/PNG 만 허용, 2MB 이하, 파일 이름은 서버가 정함(사용자 입력 경로 없음)
- 이미지 응답에 X-Content-Type-Options: nosniff, Content-Security-Policy(sandbox) 적용
- 저장/삭제는 로그인 + CSRF 토큰 필수, 본인 사진만 변경 가능
- 잠긴 사용자의 사진은 관리자 외에는 표시하지 않음

라이선스: GPL-2.0-or-later (LICENSE)
