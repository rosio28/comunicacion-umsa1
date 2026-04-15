<?php
// ============================================================
// CONFIGURACIÓN GLOBAL DEL BACKEND
// Copiar este archivo como config.php y rellenar los valores
// ============================================================
ini_set('display_errors', 1);
error_reporting(E_ALL);

define('DB_HOST',     '127.0.0.1');
define('DB_NAME',     'comunicacion_umsa');
define('DB_USER',     'ccs_user');
define('DB_PASS',     '123456'); //CAMBIA_ESTA_CONTRASEÑA
define('DB_PORT',     '5432');

define('JWT_SECRET',  '12345678901234567890123456789012');
define('JWT_EXPIRY',  28800); // 8 horas en segundos

define('FRONTEND_URL', 'http://localhost:5173'); // Cambiar en producción

define('MAIL_HOST',      'smtp.gmail.com');
define('MAIL_PORT',      587);
define('MAIL_USER',      'noreply.ccs.umsa@gmail.com');
define('MAIL_PASS',      'TU_APP_PASSWORD_GMAIL');
define('MAIL_FROM_NAME', 'Comunicación Social UMSA');
define('MAIL_REPLY_TO',  'comunicasocialumsa@gmail.com');
define('ADMIN_EMAIL',    'comunicasocialumsa@gmail.com');

define('CLOUDINARY_CLOUD_NAME', 'TU_CLOUD_NAME');
define('CLOUDINARY_API_KEY',    'TU_API_KEY');
define('CLOUDINARY_API_SECRET', 'TU_API_SECRET');

define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
