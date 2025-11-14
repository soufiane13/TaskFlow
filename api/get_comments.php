<?php
include 'db.php';

// Récupérer l'ID de la tâche
if (!isset($_GET['task_id'])) {
    echo json_encode(['error' => 'ID de tâche manquant']);
    exit;
}
$task_id = $_GET['task_id'];

$query = "
    SELECT 
        c.content, 
        c.created_at, 
        p.full_name AS author_name
    FROM comments c
    JOIN profiles p ON c.user_id = p.id
    WHERE c.task_id = $1
    ORDER BY c.created_at ASC
"; 

try {
    $result = pg_query_params($db_conn, $query, [$task_id]);

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    $comments = pg_fetch_all($result);
    if ($comments === false) {
        $comments = []; 
    }

    // Renvoyer les commentaires
    echo json_encode($comments);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>