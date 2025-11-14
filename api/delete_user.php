<?php
include 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$user_id_to_delete = $data['user_id'];

if (empty($user_id_to_delete)) {
    echo json_encode(['error' => 'ID utilisateur manquant']);
    exit;
}

try {
    // supprime de la table 'profiles'.
    $query = "DELETE FROM profiles WHERE id = $1";
    $result = pg_query_params($db_conn, $query, [$user_id_to_delete]);

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>