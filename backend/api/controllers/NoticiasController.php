<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/Auth.php';
require_once __DIR__ . '/../utils/Response.php';

class NoticiasController {
    public function index(): void {
        $db     = Database::getConnection();
        $page   = max(1, (int)($_GET['page'] ?? 1));
        $limit  = min(50, max(1, (int)($_GET['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        $catId  = isset($_GET['categoria']) ? (int)$_GET['categoria'] : null;
        $search = isset($_GET['q']) ? '%' . $_GET['q'] . '%' : null;

        // Público: solo publicadas; Admin: todas
        $isAdmin = false;
        $header  = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (str_starts_with($header, 'Bearer ')) {
            $payload = JWT::verify(substr($header, 7));
            if ($payload && in_array($payload['rol'], ['admin','superadmin','editor'])) $isAdmin = true;
        }

        $where = $isAdmin ? '' : 'WHERE n.publicado = true';
        $params = [];
        if ($catId) { $where .= ($where ? ' AND' : 'WHERE') . ' n.categoria_id = ?'; $params[] = $catId; }
        if ($search) { $where .= ($where ? ' AND' : 'WHERE') . ' (n.titulo ILIKE ? OR n.resumen ILIKE ?)'; $params[] = $search; $params[] = $search; }

        $count = $db->prepare("SELECT COUNT(*) FROM noticias n $where");
        $count->execute($params);
        $total = (int)$count->fetchColumn();

        $stmt = $db->prepare("SELECT n.id, n.titulo, n.slug, n.resumen, n.imagen_url, n.publicado, n.destacado,
            n.vistas, n.publicado_en, n.creado_en, c.nombre AS categoria, c.color_hex,
            u.nombre AS autor FROM noticias n
            LEFT JOIN categorias c ON n.categoria_id = c.id
            LEFT JOIN usuarios u ON n.autor_id = u.id
            $where ORDER BY n.publicado_en DESC NULLS LAST, n.creado_en DESC LIMIT ? OFFSET ?");
        $stmt->execute([...$params, $limit, $offset]);
        Response::paginated($stmt->fetchAll(), $total, $page, $limit);
    }

    public function show(string $slug): void {
        $db   = Database::getConnection();
        $stmt = $db->prepare("SELECT n.*, c.nombre AS categoria, c.color_hex, u.nombre AS autor
            FROM noticias n LEFT JOIN categorias c ON n.categoria_id=c.id
            LEFT JOIN usuarios u ON n.autor_id=u.id WHERE n.slug=?");
        $stmt->execute([$slug]);
        $noticia = $stmt->fetch();
        if (!$noticia) Response::error('Noticia no encontrada', 404);
        // Incrementar vistas
        $db->prepare("UPDATE noticias SET vistas = vistas + 1 WHERE slug=?")->execute([$slug]);
        Response::success($noticia);
    }

    public function store(): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['editor','admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $titulo    = trim($data['titulo'] ?? '');
        $contenido = trim($data['contenido'] ?? '');
        if (!$titulo || !$contenido) Response::error('Título y contenido requeridos');

        $slug = $this->generateSlug($titulo);
        $db   = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO noticias (titulo,slug,resumen,contenido,imagen_url,categoria_id,autor_id,publicado,destacado,publicado_en)
            VALUES (?,?,?,?,?,?,?,?,?,?) RETURNING id,slug");
        $publicado = in_array($payload['rol'], ['admin','superadmin']) ? (bool)($data['publicado'] ?? false) : false;
        $stmt->execute([$titulo, $slug, $data['resumen'] ?? null, $contenido, $data['imagen_url'] ?? null,
            $data['categoria_id'] ?? null, $payload['id'], $publicado, $data['destacado'] ?? false,
            $publicado ? date('Y-m-d H:i:s') : null]);
        Response::success($stmt->fetch(), 'Noticia creada', 201);
    }

    public function update(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['editor','admin','superadmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db   = Database::getConnection();

        // Editores solo pueden editar sus propias noticias
        if ($payload['rol'] === 'editor') {
            $check = $db->prepare("SELECT autor_id FROM noticias WHERE id=?");
            $check->execute([$id]);
            $n = $check->fetch();
            if (!$n || $n['autor_id'] != $payload['id']) Response::error('Sin permiso', 403);
        }

        $stmt = $db->prepare("UPDATE noticias SET titulo=?,resumen=?,contenido=?,imagen_url=?,categoria_id=?,
            destacado=?,actualizado_en=NOW() WHERE id=? RETURNING id");
        // noticias no tiene actualizado_en en el schema, lo omitimos
        $stmt = $db->prepare("UPDATE noticias SET titulo=COALESCE(?,titulo),resumen=?,contenido=COALESCE(?,contenido),
            imagen_url=?,categoria_id=?,destacado=? WHERE id=?");
        $stmt->execute([$data['titulo'] ?? null, $data['resumen'] ?? null, $data['contenido'] ?? null,
            $data['imagen_url'] ?? null, $data['categoria_id'] ?? null, $data['destacado'] ?? false, $id]);
        Response::success(null, 'Noticia actualizada');
    }

    public function togglePublicar(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $db   = Database::getConnection();
        $stmt = $db->prepare("UPDATE noticias SET publicado = NOT publicado,
            publicado_en = CASE WHEN publicado = false THEN NOW() ELSE publicado_en END WHERE id=? RETURNING publicado");
        $stmt->execute([$id]);
        $r = $stmt->fetch();
        Response::success(['publicado' => $r['publicado']], 'Estado actualizado');
    }

    public function destroy(int $id): void {
        $payload = Auth::requireAuth();
        Auth::requireRole($payload, ['admin','superadmin']);
        $db = Database::getConnection();
        $db->prepare("DELETE FROM noticias WHERE id=?")->execute([$id]);
        Response::success(null, 'Noticia eliminada');
    }

    private function generateSlug(string $text): string {
        $slug = mb_strtolower(trim($text));
        $slug = preg_replace('/[\s]+/', '-', $slug);
        $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $base = substr($slug, 0, 100);
        $db   = Database::getConnection();
        $test = $base;
        $i    = 1;
        while (true) {
            $s = $db->prepare("SELECT id FROM noticias WHERE slug=?");
            $s->execute([$test]);
            if (!$s->fetch()) break;
            $test = $base . '-' . $i++;
        }
        return $test;
    }
}
