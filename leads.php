<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// For this no-database version, we'll store data in a JSON file
$data_file = __DIR__ . '/leads.json';

// Initialize data file if it doesn't exist
if (!file_exists($data_file)) {
    file_put_contents($data_file, json_encode([]));
}

// Get the action parameter
$action = $_GET['action'] ?? '';

if ($action === 'get_leads') {
    // Read existing leads
    $leads = json_decode(file_get_contents($data_file), true) ?: [];
    
    // Filter approved leads
    $approved_leads = array_filter($leads, function($lead) {
        return ($lead['status'] ?? 'approved') === 'approved';
    });
    
    // Calculate today's leads (last 24 hours)
    $twenty_four_hours_ago = date('Y-m-d H:i:s', strtotime('-24 hours'));
    $today_leads = array_filter($approved_leads, function($lead) use ($twenty_four_hours_ago) {
        return $lead['datetime'] >= $twenty_four_hours_ago;
    });
    
    // Prepare response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'total_leads' => count($approved_leads),
            'today_leads' => count($today_leads),
            'recent_leads' => array_slice(array_reverse($approved_leads), 0, 50)
        ]
    ]);
}
elseif ($action === 'postback') {
    // Validate required parameters
    $required = ['offer_id', 'offer_name', 'datetime', 'geo'];
    $missing = [];
    
    foreach ($required as $field) {
        if (empty($_GET[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required parameters',
            'missing' => $missing
        ]);
        exit;
    }
    
    // Read existing leads
    $leads = json_decode(file_get_contents($data_file), true) ?: [];
    
    // Add new lead
    $leads[] = [
        'offer_id' => $_GET['offer_id'],
        'offer_name' => $_GET['offer_name'],
        'datetime' => $_GET['datetime'],
        'country' => $_GET['geo'],
        'status' => 'approved',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    // Save back to file
    if (file_put_contents($data_file, json_encode($leads))) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Lead recorded successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to save lead'
        ]);
    }
}
else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid action specified',
        'valid_actions' => ['get_leads', 'postback']
    ]);
}
?>