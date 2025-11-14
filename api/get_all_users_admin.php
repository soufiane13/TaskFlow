<?php
include 'db.php';

// La requête SQL (Admin)

$query = "
    SELECT 
        p.id, 
        p.full_name, 
        p.role, 
        u.email, 
        u.created_at AS joined_at
    FROM 
        profiles p
    JOIN 
        auth.users u ON p.id = u.id
    ORDER BY 
        u.created_at DESC
";

try {
    //  Exécuter la requête
    $result = pg_query($db_conn, $query);

    if (!$result) {
        throw new Exception(pg_last_error());
    }

    $users = pg_fetch_all($result);
    if ($users === false) {
        $users = [];
    }

    //  Renvoyer la liste
    echo json_encode($users);

} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur de base de données: ' . $e->getMessage()]);
}

pg_close($db_conn);
?>