<?php
include 'db.php';

//  Récupérer l'ID de l'utilisateur *actuel*
if (!isset($_GET['current_user_id'])) {
    echo json_encode(['error' => 'ID utilisateur actuel manquant']);
    exit;
}
$current_user_id = $_GET['current_user_id'];

// Récupérer tous les *autres* utilisateurs
$query = "
    SELECT id, full_name 
    FROM profiles
    WHERE id != $1
    ORDER BY full_name
";

try {
    $result = pg_query_params($db_conn, $query, [$current_user_id]);

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    $users = pg_fetch_all($result);
    if ($users === false) {
        $users = [];
    }

    //  Renvoyer la liste au format JSON
    echo json_encode($users);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>