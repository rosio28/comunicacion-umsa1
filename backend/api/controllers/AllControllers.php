<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Mailer.php';
require_once __DIR__ . '/../config/config.php';

// ============================================================
class EventosController {
    public function index(): void {
        $db = Database::getConnection();
        $params = [];
        $where = "WHERE publicado=true";
        if (!empty($_GET['start'])) { $where .= " AND fecha_inicio >= ?"; $params[] = $_GET['start']; }
        if (!empty($_GET['end']))   { $where .= " AND fecha_inicio <= ?"; $params[] = $_GET['end']; }
        $stmt = $db->prepare("SELECT * FROM eventos $where ORDER BY fecha_inicio");
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['titulo']) || empty($data['fecha_inicio'])) Response::error('Título y fecha requeridos');
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO eventos (titulo,descripcion,tipo,fecha_inicio,fecha_fin,lugar,enlace_virtual,color,autor_id,publicado)
            VALUES (?,?,?,?,?,?,?,?,?,?) RETURNING id");
        $stmt->execute([$data['titulo'],$data['descripcion']??null,$data['tipo']??'otro',$data['fecha_inicio'],
            $data['fecha_fin']??null,$data['lugar']??null,$data['enlace_virtual']??null,$data['color']??'#C0392B',
            $payload['id'],$data['publicado']??true]);
        Response::success($stmt->fetch(), 'Evento creado', 201);
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("UPDATE eventos SET titulo=COALESCE(?,titulo),descripcion=?,tipo=COALESCE(?,tipo),
            fecha_inicio=COALESCE(?,fecha_inicio),fecha_fin=?,lugar=?,enlace_virtual=?,color=COALESCE(?,color),publicado=COALESCE(?,publicado) WHERE id=?")
           ->execute([$data['titulo']??null,$data['descripcion']??null,$data['tipo']??null,
               $data['fecha_inicio']??null,$data['fecha_fin']??null,$data['lugar']??null,
               $data['enlace_virtual']??null,$data['color']??null,
               isset($data['publicado']) ? (int)$data['publicado'] : null,$id]);
        Response::success(null, 'Evento actualizado');
    }
    public function destroy(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        Database::getConnection()->prepare("DELETE FROM eventos WHERE id=?")->execute([$id]);
        Response::success(null, 'Evento eliminado');
    }
}

// ============================================================
class WhatsappController {
    public function index(): void {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM grupos_whatsapp WHERE activo=true ORDER BY semestre, gestion DESC");
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['materia_nombre'])||empty($data['enlace_wa'])||empty($data['gestion'])) Response::error('Datos incompletos');
        $db = Database::getConnection();
        $db->prepare("INSERT INTO grupos_whatsapp (materia_nombre,semestre,gestion,enlace_wa,actualizado_por) VALUES (?,?,?,?,?)")
           ->execute([$data['materia_nombre'],$data['semestre']??1,$data['gestion'],$data['enlace_wa'],$payload['id']]);
        Response::success(null, 'Grupo agregado', 201);
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("UPDATE grupos_whatsapp SET materia_nombre=COALESCE(?,materia_nombre),enlace_wa=COALESCE(?,enlace_wa),
            gestion=COALESCE(?,gestion),semestre=COALESCE(?,semestre),activo=COALESCE(?,activo),
            actualizado_por=?,actualizado_en=NOW() WHERE id=?")
           ->execute([$data['materia_nombre']??null,$data['enlace_wa']??null,$data['gestion']??null,
               $data['semestre']??null,isset($data['activo'])?(int)$data['activo']:null,$payload['id'],$id]);
        Response::success(null, 'Grupo actualizado');
    }
    public function destroy(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        Database::getConnection()->prepare("UPDATE grupos_whatsapp SET activo=false WHERE id=?")->execute([$id]);
        Response::success(null, 'Grupo desactivado');
    }
}

// ============================================================
class InstitucionalController {
    public function show(string $clave): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM contenido_institucional WHERE clave=?");
        $stmt->execute([$clave]);
        $item = $stmt->fetch();
        if (!$item) Response::error('Contenido no encontrado', 404);
        Response::success($item);
    }
    public function update(string $clave): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['contenido'])) Response::error('Contenido requerido');
        $db = Database::getConnection();
        $db->prepare("UPDATE contenido_institucional SET titulo=COALESCE(?,titulo),contenido=?,actualizado_por=?,actualizado_en=NOW() WHERE clave=?")
           ->execute([$data['titulo']??null,$data['contenido'],$payload['id'],$clave]);
        Response::success(null, 'Contenido actualizado');
    }
}

// ============================================================
class ContactoController {
    public function enviar(): void {
        $data    = json_decode(file_get_contents('php://input'), true);
        $nombre  = htmlspecialchars(trim($data['nombre'] ?? ''));
        $email   = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $mensaje = htmlspecialchars(trim($data['mensaje'] ?? ''));
        if (!$nombre || !$email || !$mensaje) Response::error('Todos los campos son requeridos');
        $body = "<p><strong>Nombre:</strong> $nombre</p>
                 <p><strong>Correo:</strong> $email</p>
                 <p><strong>Mensaje:</strong><br>$mensaje</p>";
        Mailer::send(ADMIN_EMAIL, 'CCS UMSA', "Nuevo mensaje desde la página web — $nombre", $body);
        Response::success(null, 'Mensaje enviado correctamente');
    }
}

// ============================================================
class UsuariosController {
    public function index(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['superadmin']);
        $db = Database::getConnection();
        $stmt = $db->query("SELECT id,nombre,email,rol,activo,avatar_url,horas_trabajo,creado_en FROM usuarios ORDER BY creado_en DESC");
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['nombre'])||empty($data['email'])||empty($data['rol'])) Response::error('Datos incompletos');
        $tempPass = bin2hex(random_bytes(6));
        $hash     = password_hash($tempPass, PASSWORD_BCRYPT, ['cost' => 12]);
        $db = Database::getConnection();
        try {
            $stmt = $db->prepare("INSERT INTO usuarios (nombre,email,password_hash,rol) VALUES (?,?,?,?) RETURNING id");
            $stmt->execute([$data['nombre'],$data['email'],$hash,$data['rol']]);
            $nuevo = $stmt->fetch();
            Mailer::send($data['email'],$data['nombre'],'Bienvenido al panel — CCS UMSA',
                "<p>Hola <strong>{$data['nombre']}</strong>,</p>
                 <p>Se ha creado tu cuenta en el panel de administración de la página web de Comunicación Social UMSA.</p>
                 <p><strong>Email:</strong> {$data['email']}<br>
                    <strong>Contraseña temporal:</strong> $tempPass</p>
                 <p>Por favor inicia sesión y cambia tu contraseña inmediatamente en: <a href='".FRONTEND_URL."/admin'>".FRONTEND_URL."/admin</a></p>");
            Response::success(['id' => $nuevo['id']], 'Usuario creado y correo enviado', 201);
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'unique')) Response::error('El email ya existe');
            Response::error('Error al crear usuario', 500);
        }
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("UPDATE usuarios SET nombre=COALESCE(?,nombre),rol=COALESCE(?,rol),activo=COALESCE(?,activo),actualizado_en=NOW() WHERE id=?")
           ->execute([$data['nombre']??null,$data['rol']??null,isset($data['activo'])?(int)$data['activo']:null,$id]);
        Response::success(null, 'Usuario actualizado');
    }
    public function destroy(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['superadmin']);
        Database::getConnection()->prepare("UPDATE usuarios SET activo=false WHERE id=?")->execute([$id]);
        Response::success(null, 'Usuario desactivado');
    }
}

// ============================================================
class MultimediaController {
    public function index(): void {
        $db = Database::getConnection();
        $tipo = $_GET['tipo'] ?? null;
        $where = "WHERE publicado=true";
        $params = [];
        if ($tipo) { $where .= " AND tipo=?"; $params[] = $tipo; }
        $stmt = $db->prepare("SELECT * FROM multimedia_estudiantes $where ORDER BY creado_en DESC LIMIT 50");
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['editor','admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['titulo'])||empty($data['url_contenido'])||empty($data['autor_nombre'])) Response::error('Datos incompletos');
        $publicado = in_array($payload['rol'],['admin','superadmin']) ? ($data['publicado']??false) : false;
        $db = Database::getConnection();
        $db->prepare("INSERT INTO multimedia_estudiantes (titulo,tipo,descripcion,url_contenido,thumbnail_url,autor_nombre,materia_origen,gestion,destacado,publicado)
            VALUES (?,?,?,?,?,?,?,?,?,?)")
           ->execute([$data['titulo'],$data['tipo']??'otro',$data['descripcion']??null,$data['url_contenido'],
               $data['thumbnail_url']??null,$data['autor_nombre'],$data['materia_origen']??null,
               $data['gestion']??null,$data['destacado']??false,$publicado]);
        Response::success(null, 'Multimedia registrada', 201);
    }
    public function togglePublicar(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE multimedia_estudiantes SET publicado = NOT publicado WHERE id=? RETURNING publicado");
        $stmt->execute([$id]);
        Response::success($stmt->fetch(), 'Estado actualizado');
    }
}

// ============================================================
class GaleriaController {
    public function albumes(): void {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT a.*, COUNT(g.id) AS total_imagenes FROM albumes a
            LEFT JOIN galeria_imagenes g ON a.id=g.album_id AND g.publicado=true
            WHERE a.publicado=true GROUP BY a.id ORDER BY a.id DESC");
        Response::success($stmt->fetchAll());
    }
    public function crearAlbum(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['nombre'])) Response::error('Nombre requerido');
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO albumes (nombre,descripcion,portada_url,publicado) VALUES (?,?,?,?) RETURNING id");
        $stmt->execute([$data['nombre'],$data['descripcion']??null,$data['portada_url']??null,$data['publicado']??false]);
        Response::success($stmt->fetch(), 'Álbum creado', 201);
    }
    public function imagenes(int $albumId): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM galeria_imagenes WHERE album_id=? AND publicado=true ORDER BY creado_en DESC");
        $stmt->execute([$albumId]);
        Response::success($stmt->fetchAll());
    }
    public function subirImagen(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['editor','admin','superadmin']);

        if (empty($_FILES['imagen'])) {
            // Registrar por URL
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['url'])) Response::error('URL o archivo requerido');
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT INTO galeria_imagenes (titulo,url,thumbnail_url,album_id,subido_por,publicado) VALUES (?,?,?,?,?,?) RETURNING id");
            $stmt->execute([$data['titulo']??null,$data['url'],$data['thumbnail_url']??$data['url'],
                $data['album_id']??null,$payload['id'],true]);
            Response::success($stmt->fetch(), 'Imagen registrada', 201);
            return;
        }

        $file = $_FILES['imagen'];
        $allowed = ['image/jpeg','image/png','image/webp'];
        if (!in_array($file['type'], $allowed)) Response::error('Solo se aceptan JPG, PNG o WebP');
        if ($file['size'] > MAX_FILE_SIZE) Response::error('Archivo demasiado grande (máx 10MB)');

        // Subir a Cloudinary si está configurado, si no guardar local
        if (defined('CLOUDINARY_CLOUD_NAME') && CLOUDINARY_CLOUD_NAME !== 'TU_CLOUD_NAME') {
            require_once __DIR__ . '/../../../vendor/autoload.php';
            \Cloudinary\Configuration\Configuration::instance([
                'cloud' => ['cloud_name' => CLOUDINARY_CLOUD_NAME, 'api_key' => CLOUDINARY_API_KEY, 'api_secret' => CLOUDINARY_API_SECRET]
            ]);
            $uploader = new \Cloudinary\Api\Upload\UploadApi();
            $result   = $uploader->upload($file['tmp_name'], ['folder' => 'ccs-umsa/galeria']);
            $url      = $result['secure_url'];
            $thumb    = str_replace('/upload/', '/upload/w_400,h_300,c_fill/', $url);
        } else {
            $filename = uniqid() . '_' . basename($file['name']);
            move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $filename);
            $url   = FRONTEND_URL . '/uploads/' . $filename;
            $thumb = $url;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO galeria_imagenes (titulo,url,thumbnail_url,album_id,subido_por,publicado) VALUES (?,?,?,?,?,?) RETURNING id,url,thumbnail_url");
        $stmt->execute([$_POST['titulo']??null,$url,$thumb,$_POST['album_id']??null,$payload['id'],true]);
        Response::success($stmt->fetch(), 'Imagen subida', 201);
    }
    public function eliminarImagen(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        Database::getConnection()->prepare("DELETE FROM galeria_imagenes WHERE id=?")->execute([$id]);
        Response::success(null, 'Imagen eliminada');
    }
}

// ============================================================
class MejoresAlumnosController {
    public function index(): void {
        $db = Database::getConnection();
        $gestion = $_GET['gestion'] ?? null;
        $where = "WHERE publicado=true";
        $params = [];
        if ($gestion) { $where .= " AND gestion=?"; $params[] = $gestion; }
        $stmt = $db->prepare("SELECT * FROM mejores_estudiantes $where ORDER BY promedio DESC");
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO mejores_estudiantes (nombre_completo,foto_url,promedio,semestre_actual,gestion,logros,publicado) VALUES (?,?,?,?,?,?,?) RETURNING id");
        $stmt->execute([$data['nombre_completo'],$data['foto_url']??null,$data['promedio'],$data['semestre_actual']??null,$data['gestion'],$data['logros']??null,$data['publicado']??true]);
        Response::success($stmt->fetch(), 'Alumno agregado', 201);
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("UPDATE mejores_estudiantes SET nombre_completo=COALESCE(?,nombre_completo),foto_url=?,promedio=COALESCE(?,promedio),gestion=COALESCE(?,gestion),logros=?,publicado=COALESCE(?,publicado) WHERE id=?")
           ->execute([$data['nombre_completo']??null,$data['foto_url']??null,$data['promedio']??null,$data['gestion']??null,$data['logros']??null,isset($data['publicado'])?(int)$data['publicado']:null,$id]);
        Response::success(null, 'Actualizado');
    }
    public function destroy(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        Database::getConnection()->prepare("DELETE FROM mejores_estudiantes WHERE id=?")->execute([$id]);
        Response::success(null, 'Eliminado');
    }
}

// ============================================================
class EgresadosController {
    public function index(): void {
        $db = Database::getConnection();
        Response::success($db->query("SELECT * FROM egresados WHERE publicado=true ORDER BY anio_egreso DESC")->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO egresados (nombre_completo,foto_url,anio_egreso,ocupacion_actual,empresa_institucion,testimonio,linkedin_url,publicado) VALUES (?,?,?,?,?,?,?,?) RETURNING id");
        $stmt->execute([$data['nombre_completo'],$data['foto_url']??null,$data['anio_egreso']??null,$data['ocupacion_actual']??null,$data['empresa_institucion']??null,$data['testimonio']??null,$data['linkedin_url']??null,$data['publicado']??true]);
        Response::success($stmt->fetch(), 'Egresado agregado', 201);
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("UPDATE egresados SET nombre_completo=COALESCE(?,nombre_completo),foto_url=?,anio_egreso=?,ocupacion_actual=?,empresa_institucion=?,testimonio=?,linkedin_url=?,publicado=COALESCE(?,publicado) WHERE id=?")
           ->execute([$data['nombre_completo']??null,$data['foto_url']??null,$data['anio_egreso']??null,$data['ocupacion_actual']??null,$data['empresa_institucion']??null,$data['testimonio']??null,$data['linkedin_url']??null,isset($data['publicado'])?(int)$data['publicado']:null,$id]);
        Response::success(null, 'Actualizado');
    }
}

// ============================================================
class MateriasController {
    public function index(): void {
        $db = Database::getConnection();
        $pensum = $_GET['pensum'] ?? '2023';
        $stmt = $db->prepare("SELECT * FROM materias WHERE pensum=? AND activa=true ORDER BY semestre,nombre");
        $stmt->execute([$pensum]);
        Response::success($stmt->fetchAll());
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("UPDATE materias SET nombre=COALESCE(?,nombre),creditos=COALESCE(?,creditos),area=COALESCE(?,area),tipo=COALESCE(?,tipo) WHERE id=?")
           ->execute([$data['nombre']??null,$data['creditos']??null,$data['area']??null,$data['tipo']??null,$id]);
        Response::success(null, 'Materia actualizada');
    }
}

// ============================================================
class TramitesController {
    public function index(): void {
        $db = Database::getConnection();
        Response::success($db->query("SELECT * FROM tramites WHERE activo=true ORDER BY nombre")->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("INSERT INTO tramites (nombre,descripcion,pasos,archivo_url,contacto) VALUES (?,?,?,?,?)")
           ->execute([$data['nombre'],$data['descripcion']??null,
               isset($data['pasos'])?json_encode($data['pasos']):null,$data['archivo_url']??null,$data['contacto']??null]);
        Response::success(null, 'Trámite creado', 201);
    }
    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("UPDATE tramites SET nombre=COALESCE(?,nombre),descripcion=?,pasos=COALESCE(?,pasos::text)::jsonb,archivo_url=?,contacto=?,activo=COALESCE(?,activo) WHERE id=?")
           ->execute([$data['nombre']??null,$data['descripcion']??null,isset($data['pasos'])?json_encode($data['pasos']):null,$data['archivo_url']??null,$data['contacto']??null,isset($data['activo'])?(int)$data['activo']:null,$id]);
        Response::success(null, 'Trámite actualizado');
    }
}

// ============================================================
class ConvocatoriasController {
    public function index(): void {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM convocatorias WHERE publicado=true ORDER BY creado_en DESC");
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("INSERT INTO convocatorias (titulo,tipo,descripcion,fecha_limite,archivo_url,publicado,autor_id) VALUES (?,?,?,?,?,?,?)")
           ->execute([$data['titulo'],$data['tipo']??'otro',$data['descripcion'],$data['fecha_limite']??null,$data['archivo_url']??null,$data['publicado']??false,$payload['id']]);
        Response::success(null, 'Convocatoria creada', 201);
    }
}

// ============================================================
class StreamingController {
    public function index(): void {
        $db = Database::getConnection();
        Response::success($db->query("SELECT * FROM canales_streaming WHERE activo=true")->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $db->prepare("INSERT INTO canales_streaming (nombre,plataforma,url_canal,embed_id) VALUES (?,?,?,?)")
           ->execute([$data['nombre'],$data['plataforma']??'youtube',$data['url_canal'],$data['embed_id']??null]);
        Response::success(null, 'Canal agregado', 201);
    }
}

// ============================================================
class CategoriasController {
    public function index(): void {
        $tipo = $_GET['tipo'] ?? null;
        $db = Database::getConnection();
        if ($tipo) {
            $stmt = $db->prepare("SELECT * FROM categorias WHERE tipo=? ORDER BY nombre");
            $stmt->execute([$tipo]);
        } else {
            $stmt = $db->query("SELECT * FROM categorias ORDER BY nombre");
        }
        Response::success($stmt->fetchAll());
    }
    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO categorias (nombre,color_hex,tipo) VALUES (?,?,?) RETURNING id");
        $stmt->execute([$data['nombre'],$data['color_hex']??'#1A5276',$data['tipo']??'noticias']);
        Response::success($stmt->fetch(), 'Categoría creada', 201);
    }
}
