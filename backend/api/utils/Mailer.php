<?php
require_once __DIR__ . '/../config/config.php';
// Requiere: composer require phpmailer/phpmailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class Mailer {
    public static function send(string $toEmail, string $toName, string $subject, string $htmlBody): bool {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = MAIL_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = MAIL_USER;
            $mail->Password   = MAIL_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = MAIL_PORT;
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom(MAIL_USER, MAIL_FROM_NAME);
            $mail->addReplyTo(MAIL_REPLY_TO, MAIL_FROM_NAME);
            $mail->addAddress($toEmail, $toName);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = self::wrapHtml($subject, $htmlBody);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("PHPMailer error: " . $e->getMessage());
            return false;
        }
    }

    private static function wrapHtml(string $title, string $body): string {
        return "<!DOCTYPE html><html><head><meta charset='utf-8'>
        <style>body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;}
        .container{background:#fff;max-width:600px;margin:0 auto;padding:30px;border-radius:8px;}
        .header{background:#C0392B;color:#fff;padding:20px;text-align:center;border-radius:8px 8px 0 0;}
        .footer{background:#1A5276;color:#fff;padding:15px;text-align:center;font-size:12px;border-radius:0 0 8px 8px;}
        h1{margin:0;font-size:20px;}</style></head><body>
        <div class='container'>
          <div class='header'><h1>Comunicación Social — UMSA</h1></div>
          <div style='padding:20px;'>$body</div>
          <div class='footer'>Universidad Mayor de San Andrés · La Paz, Bolivia</div>
        </div></body></html>";
    }
}
