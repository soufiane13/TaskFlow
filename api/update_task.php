<?php
include 'db.php';

// Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);

$task_id = $data['task_id'];
$user_id = $data['user_id'];
$title = $data['title'];
$description = $data['description'];
$due_date = $data['due_date'] ? $data['due_date'] : null;
$priority = $data['priority'];
$status = $data['status'];

if (empty($task_id) || empty($user_id) || empty($title)) {
    echo json_encode(['error' => 'Données manquantes (id, user, title)']);
    exit;
}

try {
    // Vérification de sécurité 
    $query_check = "SELECT permission FROM task_assignments 
                    WHERE task_id = $1 AND user_id = $2";
    $result_check = pg_query_params($db_conn, $query_check, [$task_id, $user_id]);
    
    $assignment = pg_fetch_assoc($result_check);

    //  l'utilisateur n'est pas assigné à la tâche, on refuse
    if (!$assignment) {
        echo json_encode(['error' => 'Permission refusée. Vous n\'êtes pas sur cette tâche.']);
        pg_close($db_conn);
        exit;
    }

    //  Si la vérification est bonne, on met à jour
    $query_update = "
        UPDATE tasks 
        SET title = $1, description = $2, due_date = $3, priority = $4, status = $5
        WHERE id = $6
    ";
    
    $result_update = pg_query_params($db_conn, $query_update, [
        $title,
        $description,
        $due_date,
        $priority,
        $status,
        $task_id
    ]);

    if (!$result_update) {
        throw new Exception(pg_last_error());
    }

    //  Renvoyer un succès
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>