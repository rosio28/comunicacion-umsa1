<?php
// ============================================================
// DocentesController.php
// ============================================================
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../utils/Response.php';

class DocentesController {
    public function index(): void {
        $db   = Database::getConnection();
        $stmt = $db->query("SELECT d.*, array_agg(m.nombre) FILTER (WHERE m.nombre IS NOT NULL) AS materias
            FROM docentes d LEFT JOIN docente_materias dm ON d.id=dm.docente_id
            LEFT JOIN materias m ON dm.materia_id=m.id WHERE d.activo=true
            GROUP BY d.id ORDER BY d.nombre_completo");
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['nombre_completo'])) Response::error('Nombre requerido');
        $db   = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO docentes (nombre_completo,foto_url,titulo_academico,especialidad,email,bio_corta,tipo)
            VALUES (?,?,?,?,?,?,?) RETURNING id");
        $stmt->execute([$data['nombre_completo'],$data['foto_url']??null,$data['titulo_academico']??null,
            $data['especialidad']??null,$data['email']??null,$data['bio_corta']??null,$data['tipo']??'titular']);
        Response::success($stmt->fetch(), 'Docente creado', 201);
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db   = Database::getConnection();
        $db->prepare("UPDATE docentes SET nombre_completo=COALESCE(?,nombre_completo),foto_url=?,titulo_academico=?,
            especialidad=?,email=?,bio_corta=?,tipo=COALESCE(?,tipo) WHERE id=?")
           ->execute([$data['nombre_completo']??null,$data['foto_url']??null,$data['titulo_academico']??null,
               $data['especialidad']??null,$data['email']??null,$data['bio_corta']??null,$data['tipo']??null,$id]);
        Response::success(null, 'Docente actualizado');
    }
    public function destroy(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        Database::getConnection()->prepare("UPDATE docentes SET activo=false WHERE id=?")->execute([$id]);
        Response::success(null, 'Docente desactivado');
    }
}
