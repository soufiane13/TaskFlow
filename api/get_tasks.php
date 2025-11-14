<?php
//  Inclure notre fichier de connexion
include 'db.php';

// Récupérer l'ID de l'utilisateur
if (!isset($_GET['user_id'])) {
    echo json_encode(['error' => 'ID utilisateur manquant']);
    exit;
}
$user_id = $_GET['user_id'];

$query = "
    SELECT t.* FROM tasks t
    JOIN task_assignments ta ON t.id = ta.task_id
    WHERE ta.user_id = $1
    ORDER BY t.created_at DESC
";

try {
    $result = pg_query_params($db_conn, $query, [$user_id]);

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    // Récupérer tous les résultats sous forme de tableau associatif
    $tasks = pg_fetch_all($result);

    // Si $tasks est false 
    if ($tasks === false) {
        $tasks = [];
    }

    //  Renvoyer les tâches au format JSON
    echo json_encode($tasks);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

//  Fermer la connexion
pg_close($db_conn);

?>