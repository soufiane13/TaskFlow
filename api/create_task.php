<?php
//  Inclure notre fichier de connexion
include 'db.php';

//  Récupérer les données envoyées par le JavaScript

$data = json_decode(file_get_contents('php://input'), true);

//  Récupérer les données de la tâche
$title = $data['title'];
$description = $data['description'];
$due_date = $data['due_date'] ? $data['due_date'] : null; 
$priority = $data['priority'];
$user_id = $data['user_id']; 

// Validation
if (empty($title) || empty($user_id)) {
    echo json_encode(['error' => 'Titre et ID utilisateur requis']);
    exit;
}


pg_query($db_conn, "BEGIN");

try {
    // 5. Insérer dans la table 'tasks'
    $query_tasks = "INSERT INTO tasks (title, description, due_date, priority, created_by) 
                    VALUES ($1, $2, $3, $4, $5) 
                    RETURNING id"; 

    $result_tasks = pg_query_params($db_conn, $query_tasks, [
        $title, 
        $description, 
        $due_date, 
        $priority, 
        $user_id
    ]);

    if (!$result_tasks) {
        throw new Exception(pg_last_error());
    }

    
    $new_task_id = pg_fetch_result($result_tasks, 0, 'id');

    //  Insérer dans 'task_assignments' pour lier la tâche au créateur
    $query_assign = "INSERT INTO task_assignments (task_id, user_id, permission) 
                     VALUES ($1, $2, 'créateur')";
    
    $result_assign = pg_query_params($db_conn, $query_assign, [
        $new_task_id,
        $user_id
    ]);

    if (!$result_assign) {
        throw new Exception(pg_last_error());
    }

    //   tout a réussi, on valide la transaction
    pg_query($db_conn, "COMMIT");
    
    //  renvoie un succès avec le nouvel ID
    echo json_encode(['success' => true, 'new_task_id' => $new_task_id]);

} catch (Exception $e) {
    //  S'il y a eu une erreur, on annule tout 
    pg_query($db_conn, "ROLLBACK");
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

// Fermer la connexion
pg_close($db_conn);

?>