<?php
include 'db.php';

//  La requête SQL (Admin)

$query = "
    SELECT 
        t.*, 
        p.full_name AS creator_name
    FROM 
        tasks t
    JOIN 
        profiles p ON t.created_by = p.id
    ORDER BY 
        t.created_at DESC
";

try {
    //  Exécuter la requête
    $result = pg_query($db_conn, $query);

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    $tasks = pg_fetch_all($result);
    if ($tasks === false) {
        $tasks = [];
    }

    // Renvoyer la liste de toutes les tâches
    echo json_encode($tasks);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>