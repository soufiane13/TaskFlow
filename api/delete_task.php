<?php
include 'db.php';

// 1. Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);
$task_id = $data['task_id'];
$user_id = $data['user_id'];

if (empty($task_id) || empty($user_id)) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

try {
    
    $query_check = "SELECT permission FROM task_assignments 
                    WHERE task_id = $1 AND user_id = $2";
    $result_check = pg_query_params($db_conn, $query_check, [$task_id, $user_id]);
    
    $assignment = pg_fetch_assoc($result_check);

    //  l'utilisateur n'est pas le 'créateur', on refuse
    if (!$assignment || $assignment['permission'] !== 'créateur') {
        echo json_encode(['error' => 'Permission refusée. Seul le créateur peut supprimer.']);
        pg_close($db_conn);
        exit;
    }

    // la vérification est bonne, on supprime
    $query_delete = "DELETE FROM tasks WHERE id = $1";
    $result_delete = pg_query_params($db_conn, $query_delete, [$task_id]);

    if (!$result_delete) {
        throw new Exception(pg_last_error());
    }

    // 5. Renvoyer un succès
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>