<?php
include 'db.php';

// 1. Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);
$task_id = $data['task_id'];
$user_id = $data['user_id']; // L'auteur du commentaire
$content = $data['content'];

if (empty($task_id) || empty($user_id) || empty($content)) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

try {
    // 2. Vérification de sécurité 
    //  On vérifie s'il est dans 'task_assignments'
    $query_check = "SELECT id FROM task_assignments 
                    WHERE task_id = $1 AND user_id = $2";
    $result_check = pg_query_params($db_conn, $query_check, [$task_id, $user_id]);
    
    // Si on ne trouve aucune ligne, l'utilisateur n'est pas sur la tâche
    if (pg_num_rows($result_check) === 0) {
        echo json_encode(['error' => 'Permission refusée. Vous ne faites pas partie de cette tâche.']);
        pg_close($db_conn);
        exit;
    }

    //  Si tout est bon
    $query_insert = "INSERT INTO comments (content, task_id, user_id) 
                     VALUES ($1, $2, $3)";
    
    $result_insert = pg_query_params($db_conn, $query_insert, [
        $content,
        $task_id,
        $user_id
    ]);

    if (!$result_insert) {
        throw new Exception(pg_last_error());
    }

    //  Renvoyer un succès
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>