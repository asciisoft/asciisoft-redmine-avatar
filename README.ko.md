# asciisoft_redmine_avatar (v1.0.1)

[English](README.md)

Redmine 7.0 에서 프로필 사진을 올리고, Redmine 이 사용자 아이콘을 보여 주는 모든 자리에 표시하는 플러그인입니다.

## 기능
- 내 계정 → 사용자 아이콘 또는 "프로필 사진" 링크 → `/my/avatar` 에서 사진 선택, 끌기·확대로 자르기, 저장, 삭제
- 256x256 정사각형 JPEG 로 저장, 화면에는 원형으로 표시 (모양 변경: `assets/stylesheets/asciisoft_avatar.css` 의 `border-radius`)
- 사진이 없는 사용자는 Redmine 기본 아이콘(이니셜 또는 Gravatar) 그대로

## 요구 사항
Redmine 7.0 이상

## 설치 (Docker)
### Git 으로 설치 (권장)
```bash
cd /srv/redmine/plugins
git clone https://github.com/asciisoft/asciisoft-redmine-avatar.git asciisoft_redmine_avatar
cd /srv/redmine && docker compose restart redmine
```
- 저장소 이름은 하이픈(`asciisoft-redmine-avatar`)이지만, 받을 폴더 이름은 플러그인 ID 와 같아야 하므로
  **언더스코어(`asciisoft_redmine_avatar`)** 로 지정해야 합니다. `git clone` 끝에 폴더 이름을 꼭 붙이세요.
- 비공개 저장소라면 `git clone` 할 때 GitHub 계정 인증(토큰 또는 SSH 키)이 필요합니다.

업데이트:
```bash
cd /srv/redmine/plugins/asciisoft_redmine_avatar && git pull
cd /srv/redmine && docker compose restart redmine
```

### 압축 파일로 설치
```bash
cd /srv/redmine/plugins && unzip ~/asciisoft_redmine_avatar.zip
cd /srv/redmine && docker compose restart redmine
```

### 설치 후
관리 > 플러그인에서 "ASCII SOFT 프로필 사진"을 확인합니다. DB 마이그레이션은 필요 없습니다.
삭제: 폴더를 지우고 재시작합니다. 사진도 필요 없으면 `files/asciisoft_avatars` 폴더를 지웁니다.

## 저장 위치
`files/asciisoft_avatars/<사용자ID>.jpg` (Redmine 첨부파일 저장소 안이라 Docker 의 files 볼륨과 백업에 함께 포함)
- 파일 이름이 사용자 ID 라 다른 사용자와 겹치지 않음
- 새 사진을 올리면 이전 파일은 삭제되고, 사용자를 삭제하면 사진도 함께 삭제
- 관리자가 특정 사용자의 사진을 지우려면 해당 파일을 삭제

## 보안
- 파일 앞부분(매직 넘버)으로 JPEG/PNG 만 허용, 2MB 이하, 파일 이름은 서버가 정함
- 이미지 응답에 `X-Content-Type-Options: nosniff`, `Content-Security-Policy`(sandbox) 적용
- 저장과 삭제는 로그인과 CSRF 토큰 필수, 본인 사진만 변경 가능
- 잠긴 사용자의 사진은 관리자에게만 표시

라이선스: GPL-2.0-or-later (LICENSE)
