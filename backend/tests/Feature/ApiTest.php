<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private $token;
    private $user;

    public function setUp(): void
    {
        parent::setUp();
        
        // Seed the database
        $this->artisan('db:seed');
        
        // Login and get token
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password'
        ]);
        
        $response->assertStatus(200);
        $data = $response->json();
        
        $this->token = $data['token'];
        $this->user = $data['user'];
    }

    public function test_user_endpoint()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/user');
        
        $response->assertStatus(200);
        $response->assertJson([
            'id' => $this->user['id'],
            'email' => 'admin@example.com',
        ]);
    }

    public function test_users_endpoint()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/users');
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['*' => ['id', 'name', 'email']]);
    }

    public function test_customers_endpoints()
    {
        // List customers
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/customers');
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['*' => ['id', 'name', 'email']]);
        
        // Get specific customer
        $customerId = $response->json()[0]['id'];
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/customers/{$customerId}");
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['id', 'name', 'email']);
        
        // Create customer
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/customers', [
            'name' => 'Test Customer',
            'email' => 'test@customer.com',
            'phone' => '555-555-5555',
            'company' => 'Test Company',
            'address' => 'Test Address',
            'notes' => 'Test Notes'
        ]);
        
        $response->assertStatus(201);
        $newCustomerId = $response->json()['id'];
        
        // Update customer
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/customers/{$newCustomerId}", [
            'name' => 'Updated Customer',
            'email' => 'updated@customer.com',
            'phone' => '555-555-1234',
            'company' => 'Updated Company',
            'address' => 'Updated Address',
            'notes' => 'Updated Notes'
        ]);
        
        $response->assertStatus(200);
        $response->assertJson(['name' => 'Updated Customer']);
        
        // Delete customer
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/customers/{$newCustomerId}");
        
        $response->assertStatus(200);
    }

    public function test_boards_endpoints()
    {
        // List boards
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/boards');
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['*' => ['id', 'name', 'description']]);
        
        $boardId = $response->json()[0]['id'];
        
        // Get specific board
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/boards/{$boardId}");
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['id', 'name', 'description']);
        
        // Get board columns
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/boards/{$boardId}/columns");
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['*' => ['id', 'name', 'order']]);
        
        // Create a new board
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/boards', [
            'name' => 'Test Board',
            'description' => 'This is a test board'
        ]);
        
        $response->assertStatus(201);
        $newBoardId = $response->json()['id'];
        
        // Add column to the new board
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson("/api/boards/{$newBoardId}/columns", [
            'name' => 'Test Column',
            'order' => 0
        ]);
        
        $response->assertStatus(201);
        $columnId = $response->json()['id'];
        
        // Update column
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/boards/{$newBoardId}/columns/{$columnId}", [
            'name' => 'Updated Column',
            'order' => 1
        ]);
        
        $response->assertStatus(200);
        
        // Add another column to test reordering
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson("/api/boards/{$newBoardId}/columns", [
            'name' => 'Another Column',
            'order' => 1
        ]);
        
        $response->assertStatus(201);
        $column2Id = $response->json()['id'];
        
        // Reorder columns
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/boards/{$newBoardId}/columns/reorder", [
            'columns' => [
                ['id' => $column2Id, 'order' => 0],
                ['id' => $columnId, 'order' => 1]
            ]
        ]);
        
        $response->assertStatus(200);
        
        // Delete column
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/boards/{$newBoardId}/columns/{$columnId}");
        
        $response->assertStatus(200);
        
        // Update board
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/boards/{$newBoardId}", [
            'name' => 'Updated Board',
            'description' => 'This is an updated board'
        ]);
        
        $response->assertStatus(200);
        
        // Delete board
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/boards/{$newBoardId}");
        
        $response->assertStatus(200);
    }

    public function test_tasks_endpoints()
    {
        // Get all tasks
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/tasks');
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['*' => ['id', 'title', 'description']]);
        
        // Get first task info
        $taskId = $response->json()[0]['id'];
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/tasks/{$taskId}");
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['id', 'title', 'description', 'column_id', 'user_id', 'customer_id']);
        $columnId = $response->json()['column_id'];
        
        // Get boards to find a column for new task
        $boardsResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/boards');
        
        $boardId = $boardsResponse->json()[0]['id'];
        
        $columnsResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/boards/{$boardId}/columns");
        
        $newColumnId = $columnsResponse->json()[0]['id'];
        
        // Create a new task
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/tasks', [
            'title' => 'Test Task',
            'description' => 'This is a test task',
            'column_id' => $newColumnId,
            'user_id' => $this->user['id'],
            'customer_id' => 1,
            'due_date' => now()->addDays(5)->toDateString(),
        ]);
        
        $response->assertStatus(201);
        $newTaskId = $response->json()['id'];
        
        // Update task
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/tasks/{$newTaskId}", [
            'title' => 'Updated Task',
            'description' => 'This is an updated task',
            'due_date' => now()->addDays(7)->toDateString(),
        ]);
        
        $response->assertStatus(200);
        
        // Move task to different column
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/tasks/{$newTaskId}/move", [
            'column_id' => $columnId,
            'order' => 0
        ]);
        
        $response->assertStatus(200);
        
        // Get calendar view
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/tasks/calendar');
        
        $response->assertStatus(200);
        
        // Alternative calendar endpoint
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/calendar');
        
        $response->assertStatus(200);
        
        // Reorder tasks
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson('/api/tasks-reorder', [
            'tasks' => [
                ['id' => $taskId, 'order' => 1],
                ['id' => $newTaskId, 'order' => 0]
            ]
        ]);
        
        $response->assertStatus(200);
        
        // Delete task
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/tasks/{$newTaskId}");
        
        $response->assertStatus(200);
    }

    public function test_task_comments_endpoints()
    {
        // First get a task
        $tasksResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/tasks');
        
        $taskId = $tasksResponse->json()[0]['id'];
        
        // Get comments for task
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/tasks/{$taskId}/comments");
        
        $response->assertStatus(200);
        
        // Create a comment
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson("/api/tasks/{$taskId}/comments", [
            'content' => 'This is a test comment'
        ]);
        
        $response->assertStatus(201);
        $commentId = $response->json()['id'];
        
        // Update comment
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/tasks/{$taskId}/comments/{$commentId}", [
            'content' => 'This is an updated comment'
        ]);
        
        $response->assertStatus(200);
        
        // Delete comment
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/tasks/{$taskId}/comments/{$commentId}");
        
        $response->assertStatus(200);
    }

    public function test_logout()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/logout');
        
        $response->assertStatus(200);
        $response->assertJson(['message' => 'Logged out successfully']);
    }
} 