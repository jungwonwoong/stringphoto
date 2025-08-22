<?php
// DB 연결 정보
$host = 'localhost';
$user = 'stringphoto';
$pass = 'J28482848j!';
$dbname = 'stringphoto';

$conn = new mysqli($host, $user, $pass, $dbname);
$conn->set_charset("utf8");

// 업로드 폴더
$upload_dir = 'uploads/';
if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);

// POST: 자료 업로드/링크 등록
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $conn->real_escape_string($_POST['title'] ?? '');
    $desc = $conn->real_escape_string($_POST['description'] ?? '');
    $uploader = $conn->real_escape_string($_POST['uploader'] ?? '익명');
    $category = $conn->real_escape_string($_POST['category'] ?? 'machine'); // 카테고리 추가
    $is_notice = isset($_POST['is_notice']) ? 1 : 0;

    // 파일 업로드
    if (!empty($_FILES['file']['name'])) {
        $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
        $type = 'file';
        if (in_array($ext, ['jpg','jpeg','png','gif','bmp','webp'])) $type = 'image';
        if (in_array($ext, ['mp4','webm','mov','avi','mkv'])) $type = 'video';
        $filename = uniqid('res_').'.'.$ext;
        $filepath = $upload_dir . $filename;
        move_uploaded_file($_FILES['file']['tmp_name'], $filepath);
        $url = $filepath;
    }
    // 링크 등록
    else if (!empty($_POST['link'])) {
        $type = 'link';
        $url = $conn->real_escape_string($_POST['link']);
    } else {
        http_response_code(400);
        echo json_encode(['error'=>'파일 또는 링크 필요']);
        exit;
    }

    $sql = "INSERT INTO resources (type, title, description, url, uploader, category, is_notice) VALUES ('$type', '$title', '$desc', '$url', '$uploader', '$category', $is_notice)";
    $conn->query($sql);
    echo json_encode(['success'=>true]);
    exit;
}

// GET: 자료 리스트 반환 (카테고리별)
$category = $_GET['category'] ?? 'all';
$notice = null;
$list = [];

// 공지사항 (모든 카테고리에서 표시)
$res = $conn->query("SELECT * FROM resources WHERE is_notice=1 ORDER BY uploaded_at DESC LIMIT 1");
if ($row = $res->fetch_assoc()) $notice = $row;

// 카테고리별 자료 리스트
if ($category === 'all') {
    $res = $conn->query("SELECT * FROM resources WHERE is_notice=0 ORDER BY uploaded_at DESC");
} else {
    $category = $conn->real_escape_string($category);
    $res = $conn->query("SELECT * FROM resources WHERE is_notice=0 AND category='$category' ORDER BY uploaded_at DESC");
}

while ($row = $res->fetch_assoc()) $list[] = $row;

echo json_encode([
    'notice' => $notice,
    'list' => $list,
    'category' => $category
]);