# String Photo Project

## 설치 및 설정

### 1. 데이터베이스 설정

1. `config/database.example.php` 파일을 `config/database.php`로 복사
2. `config/database.php` 파일에서 실제 데이터베이스 정보 입력:

```php
$config = [
    'host' => 'localhost',
    'user' => 'your_username',      // 실제 사용자명
    'pass' => 'your_password',      // 실제 비밀번호
    'dbname' => 'your_database'     // 실제 데이터베이스명
];
```

### 2. Dothome 호스팅 설정

Dothome 호스팅을 사용하는 경우:
- 호스트: `localhost`
- 사용자명: `stringphotokr` (또는 계정명)
- 데이터베이스명: `stringphotokr` (또는 계정명)

### 3. 로컬 개발 환경

로컬에서 개발할 때는 자동으로 로컬 데이터베이스 설정이 적용됩니다.

## 주의사항

- `config/database.php` 파일은 `.gitignore`에 포함되어 GitHub에 업로드되지 않습니다
- 실제 데이터베이스 정보는 절대 GitHub에 업로드하지 마세요
- 프로덕션 환경에서는 환경변수 사용을 권장합니다

## 파일 구조

```
stringphoto/
├── config/
│   ├── database.php          # 실제 DB 설정 (GitHub에 업로드 안됨)
│   └── database.example.php  # 설정 예시 파일
├── uploads/                  # 업로드된 파일들
├── guestbook.php            # 방명록 기능
├── resources.php            # 자료 관리 기능
└── README.md               # 이 파일
```
