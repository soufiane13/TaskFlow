<?php
include 'db.php';

// Récupérer l'ID de l'utilisateur
if (!isset($_GET['user_id'])) {
    echo json_encode(['error' => 'ID utilisateur manquant']);
    exit;
}
$user_id = $_GET['user_id'];

// On prépare notre JSON de réponse
$response = [
    'stats_by_status' => [],
    'urgent_tasks' => [],
    'late_tasks' => []
];

try {
    // Requête 1: Nombre de tâches par statut
    $query_status = "
        SELECT status, COUNT(*) as count 
        FROM tasks t
        JOIN task_assignments ta ON t.id = ta.task_id
        WHERE ta.user_id = $1 AND t.status != 'Terminé'
        GROUP BY t.status
    ";
    $result_status = pg_query_params($db_conn, $query_status, [$user_id]);
    $response['stats_by_status'] = pg_fetch_all($result_status) ?: [];

    
    $query_urgent = "
        SELECT t.id, t.title 
        FROM tasks t
        JOIN task_assignments ta ON t.id = ta.task_id
        WHERE ta.user_id = $1 AND t.priority = 'Élevée' AND t.status != 'Terminé'
        ORDER BY t.due_date ASC
        LIMIT 5
    ";
    $result_urgent = pg_query_params($db_conn, $query_urgent, [$user_id]);
    if (!$result_urgent) throw new Exception("Erreur requête urgente: " . pg_last_error());
    $response['urgent_tasks'] = pg_fetch_all($result_urgent) ?: [];

    $query_late = "
        SELECT t.id, t.title, t.due_date
        FROM tasks t
        JOIN task_assignments ta ON t.id = ta.task_id
        WHERE ta.user_id = $1 AND t.due_date < now()::date AND t.status != 'Terminé'
        ORDER BY t.due_date DESC
        LIMIT 5
    ";
    $result_late = pg_query_params($db_conn, $query_late, [$user_id]);
    if (!$result_late) throw new Exception("Erreur requête en retard: " . pg_last_error());
    $response['late_tasks'] = pg_fetch_all($result_late) ?: [];

    //  Renvoyer tout le JSON
    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>