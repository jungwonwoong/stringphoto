<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
// DB 정보
$host = 'localhost';
$user = 'stringphoto';
$pass = 'J28482848j!';
$dbname = 'stringphoto';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success'=>false, 'error'=>'DB 연결 실패']));
}
$conn->set_charset('utf8mb4');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $conn->real_escape_string($_POST['name'] ?? '익명');
    $msg = $conn->real_escape_string($_POST['msg'] ?? '');
    if ($msg) {
        $now = date('Y-m-d H:i:s');
        $conn->query("INSERT INTO guestbook (name, msg, date) VALUES ('$name', '$msg', '$now')");
    }
    echo json_encode(['success'=>true]);
    exit;
} else {
    $result = $conn->query("SELECT name, msg, date FROM guestbook ORDER BY date DESC LIMIT 30");
    $entries = [];
    while ($row = $result->fetch_assoc()) $entries[] = $row;
    echo json_encode($entries);
    exit;
}
?> 