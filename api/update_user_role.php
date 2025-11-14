<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$user_id_to_update = $data['user_id'];
$new_role = $data['new_role'];

if (empty($user_id_to_update) || empty($new_role)) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}
// On vérifie que le rôle est valide
if ($new_role !== 'admin' && $new_role !== 'utilisateur') {
    echo json_encode(['error' => 'Rôle non valide']);
    exit;
}

try {
    // On met à jour la table 'profiles'
    $query = "UPDATE profiles SET role = $1 WHERE id = $2";
    $result = pg_query_params($db_conn, $query, [$new_role, $user_id_to_update]);

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    echo json_encode(['success' => true, 'new_role' => $new_role]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>