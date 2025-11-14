<?php
include 'db.php';

//  prépare notre JSON de réponse
$response = [
    'total_users' => 0,
    'total_tasks' => 0,
    'total_comments' => 0
];

try {
    // Compter tous les utilisateurs (dans profiles)
    $result_users = pg_query($db_conn, "SELECT COUNT(*) FROM profiles");
    $response['total_users'] = pg_fetch_result($result_users, 0, 0);

    //  Compter toutes les tâches
    $result_tasks = pg_query($db_conn, "SELECT COUNT(*) FROM tasks");
    $response['total_tasks'] = pg_fetch_result($result_tasks, 0, 0);

    //  Compter tous les commentaires
    $result_comments = pg_query($db_conn, "SELECT COUNT(*) FROM comments");
    $response['total_comments'] = pg_fetch_result($result_comments, 0, 0);

    // Renvoyer le JSON
    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>