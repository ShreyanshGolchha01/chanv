<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
    exit;
}

// Database configuration
require_once 'db.php';

try {

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!$input) {
        throw new Exception('Invalid JSON data');
    }

    $patientType = $input['patientType'] ?? '';
    $services = $input['services'] ?? [];
    
    if (empty($patientType) || empty($services)) {
        throw new Exception('Patient type and services are required');
    }

    // Start transaction
    $pdo->beginTransaction();

    try {
        // Determine which patient ID to use based on type
        $u_id = null;
        $r_id = null;
        $o_id = null;

        if ($patientType === 'employee') {
            $u_id = $input['patientId'] ?? null;
            if (!$u_id) {
                throw new Exception('Employee ID is required for employee records');
            }
        } elseif ($patientType === 'relative') {
            $r_id = $input['relativeId'] ?? null;
            if (!$r_id) {
                throw new Exception('Relative ID is required for relative records');
            }
        } elseif ($patientType === 'outsider') {
            $o_id = $input['patientId'] ?? null;
            if (!$o_id) {
                throw new Exception('Outsider ID is required for outsider records');
            }
        } else {
            throw new Exception('Invalid patient type');
        }

        // Insert each service record
        $stmt = $pdo->prepare("
            INSERT INTO services (u_id, r_id, o_id, service_type, service_detail)
            VALUES (?, ?, ?, ?, ?)
        ");

        // Prepare all services as JSON data for single entry
        $allServiceTypes = [];
        $allServiceDetails = [];
        
        foreach ($services as $service) {
            $serviceType = $service['type'] ?? '';
            $serviceDetail = $service['detail'] ?? '';
            
            if (empty($serviceType)) {
                throw new Exception('Service type is required for all services');
            }

            $allServiceTypes[] = $serviceType;
            $allServiceDetails[] = $serviceDetail;
        }

        // Store all services as JSON in single record
        $serviceTypesJson = json_encode($allServiceTypes, JSON_UNESCAPED_UNICODE);
        $serviceDetailsJson = json_encode($allServiceDetails, JSON_UNESCAPED_UNICODE);

        $stmt->execute([$u_id, $r_id, $o_id, $serviceTypesJson, $serviceDetailsJson]);
        
        $insertedRecord = [
            'id' => $pdo->lastInsertId(),
            'service_types' => $allServiceTypes,
            'service_details' => $allServiceDetails,
            'total_services' => count($services)
        ];

        // Commit transaction
        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Service records added successfully',
            'data' => [
                'inserted_count' => 1,
                'total_services' => count($services),
                'record' => $insertedRecord
            ]
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $pdo->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
