<?php
// Database configuration
$host = 'localhost';
$dbname = 'lets-connect';
$user = 'root';
$pass = '';

// Create a new PDO connection
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Read JSON file
$jsonFile = 'http://localhost:4001/getData';
$jsonData = file_get_contents($jsonFile);
$workshops = json_decode($jsonData, true);

if (!$workshops) {
    die("Error decoding JSON.");
}

$arrayIds = [];
// Insert data into the database
foreach ($workshops["Titles"] as $workshop) {
    // Insert workshop into the 'workshops' table
    $stmt = $pdo->prepare("INSERT INTO workshops (name) VALUES (:name)");
    $stmt->execute([
        'name' => $workshop
        
    ]);
    array_push($arrayIds, $pdo->lastInsertId());
}

$i = 0;
foreach ($workshops["Descriptions"] as $element) {

    $completeOmschrijving = "";
    foreach ( $element["description"] as $description) {
            $completeOmschrijving .= " ". $description;
    }

//    preg_match('/maximaal\s+(\d+)\s+personen/i',$completeOmschrijving, $matches);
    preg_match('/maximaal[\s\x{a0}]+(\d+)[\s\x{a0}]+personen/u', $completeOmschrijving, $matches);


    // var_dump($matches);
    $maxPersonen = $matches[1];

    $stmt = $pdo->prepare("UPDATE  workshops SET full_description=:co , capacity=:capacity WHERE id=:workshop_id");
    $stmt->execute([
        ':workshop_id' => $arrayIds[$i],
        ':co' => $completeOmschrijving,
        ':capacity' =>  $maxPersonen
    ]);
    $i++;
}

$i = 0;
foreach ($workshops["Images"] as $element) {

    $imageUrl = "";
    foreach ( $element["image"] as $description) {
            $imageUrl =  $description;
    }

    // var_dump($imageUrl);

    $stmt = $pdo->prepare("UPDATE  workshops SET image_url=:iu  WHERE id=:workshop_id");
    $stmt->execute([
        ':workshop_id' => $arrayIds[$i],
        ':iu' => $imageUrl,
    ]);
    $i++;
}
echo "Import successful!";
?>
