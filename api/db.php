<?php
$host = 'db.nlrihcskrztcqkmfjcxp.supabase.co';
$port = '5432';
$database = 'postgres';
$user = 'postgres';
$password = '@Soufianeingetis'; 

// Chaîne de connexion
$conn_string = "host=$host port=$port dbname=$database user=$user password=$password";

// Connexion à la base de données PostgreSQL
$db_conn = pg_connect($conn_string);

if (!$db_conn) {
    // la connexion échoue, 
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Connexion à la base de données échouée']);
    exit;
}

// assure que notre API parle en JSON et autorise les appels
header('Content-Type: application/json');

?>