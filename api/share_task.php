<?php
include 'db.php';

// Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);
$task_id = $data['task_id'];
$user_to_share_with = $data['user_to_share_with'];
$current_user_id = $data['current_user_id']; 

if (empty($task_id) || empty($user_to_share_with) || empty($current_user_id)) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

try {
    // Vérification de sécurité 
    $query_check = "SELECT permission FROM task_assignments 
                    WHERE task_id = $1 AND user_id = $2";
    $result_check = pg_query_params($db_conn, $query_check, [$task_id, $current_user_id]);
    
    $assignment = pg_fetch_assoc($result_check);

    if (!$assignment || $assignment['permission'] !== 'créateur') {
        echo json_encode(['error' => 'Permission refusée. Seul le créateur peut partager.']);
        pg_close($db_conn);
        exit;
    }

    //  Vérifier que l'utilisateur n'est pas déjà assigné
    $query_check_existing = "SELECT id FROM task_assignments 
                             WHERE task_id = $1 AND user_id = $2";
    $result_existing = pg_query_params($db_conn, $query_check_existing, [$task_id, $user_to_share_with]);

    if (pg_num_rows($result_existing) > 0) {
        echo json_encode(['error' => 'Cet utilisateur est déjà sur cette tâche.']);
        pg_close($db_conn);
        exit;
    }

    //  Si tout est bon, on ajoute l'utilisateur comme 'contributeur'
    $query_share = "INSERT INTO task_assignments (task_id, user_id, permission) 
                    VALUES ($1, $2, 'contributeur')";
    
    $result_share = pg_query_params($db_conn, $query_share, [
        $task_id,
        $user_to_share_with
    ]);

    if (!$result_share) {
        throw new Exception(pg_last_error());
    }

    // Renvoyer un succès
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>