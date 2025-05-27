<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestApi extends Command
{
    protected $signature = 'api:test';
    protected $description = 'Test API endpoints with admin credentials';

    public function handle()
    {
        $baseUrl = config('app.url') . '/api';
        
        $this->info("Testing API endpoints with admin credentials");
        $this->info("Base URL: $baseUrl");
        
        // Step 1: Test the public endpoint
        $this->info("\nTesting public endpoint: GET /api/test");
        $response = Http::get("$baseUrl/test");
        $this->outputResponse($response);
        
        // Step 2: Login
        $this->info("\nTesting login: POST /api/login");
        $loginResponse = Http::post("$baseUrl/login", [
            'email' => 'admin@example.com',
            'password' => 'password'
        ]);
        $this->outputResponse($loginResponse);
        
        if ($loginResponse->failed()) {
            $this->error("Login failed! Cannot proceed with testing protected routes.");
            return 1;
        }
        
        $token = $loginResponse->json('token');
        $this->info("Login successful! Token received.");
        
        // Create HTTP client with auth header
        $http = Http::withToken($token)->withHeaders([
            'Accept' => 'application/json'
        ]);
        
        // Step 3: Get authenticated user
        $this->info("\nTesting GET /api/user");
        $userResponse = $http->get("$baseUrl/user");
        $this->outputResponse($userResponse);
        
        // Step 4: Get users list
        $this->info("\nTesting GET /api/users");
        $usersResponse = $http->get("$baseUrl/users");
        $this->outputResponse($usersResponse);
        
        // Step 5: Get all boards
        $this->info("\nTesting GET /api/boards");
        $boardsResponse = $http->get("$baseUrl/boards");
        $this->outputResponse($boardsResponse);
        
        // Step 6: Get all customers
        $this->info("\nTesting GET /api/customers");
        $customersResponse = $http->get("$baseUrl/customers");
        $this->outputResponse($customersResponse);
        
        // Step 7: Get all tasks
        $this->info("\nTesting GET /api/tasks");
        $tasksResponse = $http->get("$baseUrl/tasks");
        $this->outputResponse($tasksResponse);
        
        // Step 8: Get calendar view
        $this->info("\nTesting GET /api/calendar");
        $calendarResponse = $http->get("$baseUrl/calendar");
        $this->outputResponse($calendarResponse);
        
        // Step 9: Logout
        $this->info("\nTesting POST /api/logout");
        $logoutResponse = $http->post("$baseUrl/logout");
        $this->outputResponse($logoutResponse);
        
        $this->info("\nAPI test completed!");
        return 0;
    }
    
    private function outputResponse($response)
    {
        $status = $response->status();
        $body = $response->json();
        
        $this->line("Status code: $status");
        
        if ($response->successful()) {
            $this->info("Response: " . json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->error("Error: " . json_encode($body, JSON_PRETTY_PRINT));
        }
    }
} 