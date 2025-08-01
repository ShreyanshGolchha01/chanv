<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Allow both GET and POST requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only GET and POST methods allowed']);
    exit;
}

// Database configuration
require_once 'db.php';

try {

    // Get parameters
    $searchTerm = '';
    $patientTypeFilter = '';
    $serviceTypeFilter = '';
    $limit = 50;
    $offset = 0;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $searchTerm = $input['searchTerm'] ?? '';
            $patientTypeFilter = $input['patientTypeFilter'] ?? '';
            $serviceTypeFilter = $input['serviceTypeFilter'] ?? '';
            $limit = $input['limit'] ?? 50;
            $offset = $input['offset'] ?? 0;
        }
    } else {
        $searchTerm = $_GET['searchTerm'] ?? '';
        $patientTypeFilter = $_GET['patientTypeFilter'] ?? '';
        $serviceTypeFilter = $_GET['serviceTypeFilter'] ?? '';
        $limit = $_GET['limit'] ?? 50;
        $offset = $_GET['offset'] ?? 0;
    }

    // Build the main query
    $whereConditions = [];
    $params = [];

    // Search term condition
    if (!empty($searchTerm)) {
        $whereConditions[] = "(
            u.fullname LIKE ? OR 
            u.phoneNumber LIKE ? OR 
            r.fullName LIKE ? OR 
            r.phoneNumber LIKE ? OR 
            o.fullname LIKE ? OR 
            o.phonenumber LIKE ? OR
            s.service_type LIKE ? OR
            s.service_detail LIKE ?
        )";
        $searchParam = "%$searchTerm%";
        $params = array_merge($params, array_fill(0, 8, $searchParam));
    }

    // Patient type filter
    if (!empty($patientTypeFilter)) {
        if ($patientTypeFilter === 'employee') {
            $whereConditions[] = "s.u_id IS NOT NULL";
        } elseif ($patientTypeFilter === 'relative') {
            $whereConditions[] = "s.r_id IS NOT NULL";
        } elseif ($patientTypeFilter === 'outsider') {
            $whereConditions[] = "s.o_id IS NOT NULL";
        }
    }

    // Service type filter
    if (!empty($serviceTypeFilter)) {
        $whereConditions[] = "s.service_type LIKE ?";
        $params[] = "%$serviceTypeFilter%";
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Main query to get service records with patient details
    $query = "
        SELECT 
            s.id,
            s.service_type,
            s.service_detail,
            CASE 
                WHEN s.u_id IS NOT NULL THEN 'employee'
                WHEN s.r_id IS NOT NULL THEN 'relative'
                WHEN s.o_id IS NOT NULL THEN 'outsider'
                ELSE 'unknown'
            END as patient_type,
            CASE 
                WHEN s.u_id IS NOT NULL THEN u.fullname
                WHEN s.r_id IS NOT NULL THEN r.fullName
                WHEN s.o_id IS NOT NULL THEN o.fullname
                ELSE 'Unknown'
            END as patient_name,
            CASE 
                WHEN s.u_id IS NOT NULL THEN u.phoneNumber
                WHEN s.r_id IS NOT NULL THEN r.phoneNumber
                WHEN s.o_id IS NOT NULL THEN o.phonenumber
                ELSE 'N/A'
            END as patient_phone,
            CASE 
                WHEN s.u_id IS NOT NULL THEN u.age
                WHEN s.r_id IS NOT NULL THEN TIMESTAMPDIFF(YEAR, r.dateOfBirth, CURDATE())
                WHEN s.o_id IS NOT NULL THEN o.age
                ELSE NULL
            END as patient_age,
            CASE 
                WHEN s.u_id IS NOT NULL THEN u.gender
                WHEN s.r_id IS NOT NULL THEN r.gender
                WHEN s.o_id IS NOT NULL THEN o.gender
                ELSE 'unknown'
            END as patient_gender,
            CASE 
                WHEN s.r_id IS NOT NULL THEN r.relation
                ELSE NULL
            END as relation_type,
            CASE 
                WHEN s.r_id IS NOT NULL THEN emp.fullname
                ELSE NULL
            END as employee_name
        FROM services s
        LEFT JOIN users u ON s.u_id = u.id
        LEFT JOIN relatives r ON s.r_id = r.r_id
        LEFT JOIN users emp ON r.id = emp.id
        LEFT JOIN outsiders o ON s.o_id = o.p_id
        $whereClause
        ORDER BY s.id DESC
        LIMIT ? OFFSET ?
    ";

    $params[] = (int)$limit;
    $params[] = (int)$offset;

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rawRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process records to handle JSON service data
    $records = [];
    foreach ($rawRecords as $record) {
        // Parse JSON service data
        $serviceTypes = json_decode($record['service_type'], true);
        $serviceDetails = json_decode($record['service_detail'], true);
        
        // If not JSON (old format), treat as single service
        if (!is_array($serviceTypes)) {
            $serviceTypes = [$record['service_type']];
        }
        if (!is_array($serviceDetails)) {
            $serviceDetails = [$record['service_detail']];
        }
        
        // Add processed record
        $records[] = [
            'id' => $record['id'],
            'service_types' => $serviceTypes,
            'service_details' => $serviceDetails,
            'service_count' => count($serviceTypes),
            'patient_type' => $record['patient_type'],
            'patient_name' => $record['patient_name'],
            'patient_phone' => $record['patient_phone'],
            'patient_age' => $record['patient_age'],
            'patient_gender' => $record['patient_gender'],
            'relation_type' => $record['relation_type'],
            'employee_name' => $record['employee_name']
        ];
    }

    // Get total count for pagination
    $countQuery = "
        SELECT COUNT(DISTINCT s.id) as total
        FROM services s
        LEFT JOIN users u ON s.u_id = u.id
        LEFT JOIN relatives r ON s.r_id = r.r_id
        LEFT JOIN users emp ON r.id = emp.id
        LEFT JOIN outsiders o ON s.o_id = o.p_id
        $whereClause
    ";

    $countParams = array_slice($params, 0, -2); // Remove limit and offset
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($countParams);
    $totalRecords = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get statistics
    $statsQuery = "
        SELECT 
            COUNT(*) as total_services,
            COUNT(CASE WHEN s.u_id IS NOT NULL THEN 1 END) as employee_services,
            COUNT(CASE WHEN s.r_id IS NOT NULL THEN 1 END) as relative_services,
            COUNT(CASE WHEN s.o_id IS NOT NULL THEN 1 END) as outsider_services,
            COUNT(DISTINCT 
                CASE 
                    WHEN s.u_id IS NOT NULL THEN s.u_id
                    WHEN s.r_id IS NOT NULL THEN s.r_id
                    WHEN s.o_id IS NOT NULL THEN s.o_id
                END
            ) as unique_patients
        FROM services s
    ";

    $statsStmt = $pdo->prepare($statsQuery);
    $statsStmt->execute();
    $statistics = $statsStmt->fetch(PDO::FETCH_ASSOC);

    // Format the response
    echo json_encode([
        'success' => true,
        'data' => [
            'records' => $records,
            'pagination' => [
                'total' => (int)$totalRecords,
                'limit' => (int)$limit,
                'offset' => (int)$offset,
                'has_more' => ($offset + $limit) < $totalRecords
            ],
            'statistics' => [
                'totalServices' => (int)$statistics['total_services'],
                'employeeServices' => (int)$statistics['employee_services'],
                'relativeServices' => (int)$statistics['relative_services'],
                'outsiderServices' => (int)$statistics['outsider_services'],
                'uniquePatients' => (int)$statistics['unique_patients']
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
