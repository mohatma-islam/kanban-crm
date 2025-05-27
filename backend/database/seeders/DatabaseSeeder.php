<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\Customer;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        
        // Create additional users
        $user1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
        ]);
        
        $user2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
        ]);
        
        // Create customers
        $customers = [
            [
                'name' => 'Acme Corporation',
                'email' => 'info@acme.com',
                'phone' => '555-123-4567',
                'address' => '123 Business St, Innovation City',
                'company' => 'Acme Corporation',
                'notes' => 'Key client with multiple projects',
            ],
            [
                'name' => 'Tech Innovators',
                'email' => 'contact@techinnovators.com',
                'phone' => '555-987-6543',
                'address' => '456 Tech Ave, Silicon Valley',
                'company' => 'Tech Innovators Inc.',
                'notes' => 'Technology consulting firm',
            ],
            [
                'name' => 'Global Retail',
                'email' => 'support@globalretail.com',
                'phone' => '555-456-7890',
                'address' => '789 Commerce Blvd, Market Town',
                'company' => 'Global Retail Group',
                'notes' => 'Large retail chain with international presence',
            ],
        ];
        
        foreach ($customers as $customerData) {
            Customer::create($customerData);
        }
        
        // Create a board
        $board = Board::create([
            'name' => 'Main Project Board',
            'description' => 'Our main kanban board for all projects',
        ]);
        
        // Create columns
        $columns = [
            ['name' => 'To Do', 'order' => 0],
            ['name' => 'In Progress', 'order' => 1],
            ['name' => 'In Review', 'order' => 2],
            ['name' => 'Done', 'order' => 3],
        ];
        
        $createdColumns = [];
        foreach ($columns as $columnData) {
            $createdColumns[] = BoardColumn::create([
                'board_id' => $board->id,
                'name' => $columnData['name'],
                'order' => $columnData['order'],
            ]);
        }
        
        // Create tasks in each column
        $tasks = [
            [
                'title' => 'Design new CRM homepage',
                'description' => 'Create mockups for the new CRM homepage with improved UX',
                'column_id' => $createdColumns[0]->id, // To Do
                'customer_id' => 1,
                'user_id' => $user1->id,
                'due_date' => now()->addDays(7),
                'order' => 0,
            ],
            [
                'title' => 'Database optimization',
                'description' => 'Optimize database queries for better performance',
                'column_id' => $createdColumns[1]->id, // In Progress
                'customer_id' => 2,
                'user_id' => $admin->id,
                'due_date' => now()->addDays(3),
                'order' => 0,
            ],
            [
                'title' => 'API endpoints for mobile app',
                'description' => 'Implement necessary API endpoints for the mobile application',
                'column_id' => $createdColumns[1]->id, // In Progress
                'customer_id' => 3,
                'user_id' => $user2->id,
                'due_date' => now()->addDays(5),
                'order' => 1,
            ],
            [
                'title' => 'Update user documentation',
                'description' => 'Update the user guide with new features',
                'column_id' => $createdColumns[2]->id, // In Review
                'customer_id' => 1,
                'user_id' => $user1->id,
                'due_date' => now()->addDays(2),
                'order' => 0,
            ],
            [
                'title' => 'Security audit',
                'description' => 'Conduct security audit of the application',
                'column_id' => $createdColumns[3]->id, // Done
                'customer_id' => 2,
                'user_id' => $admin->id,
                'due_date' => now()->subDays(1),
                'order' => 0,
            ],
        ];
        
        $createdTasks = [];
        foreach ($tasks as $taskData) {
            $createdTasks[] = Task::create($taskData);
        }
        
        // Add comments to tasks
        $comments = [
            [
                'task_id' => $createdTasks[0]->id,
                'user_id' => $admin->id,
                'content' => 'Let\'s make sure we incorporate the new brand guidelines in the design.',
            ],
            [
                'task_id' => $createdTasks[0]->id,
                'user_id' => $user1->id,
                'content' => 'I\'ll prepare some initial concepts by tomorrow.',
            ],
            [
                'task_id' => $createdTasks[1]->id,
                'user_id' => $admin->id,
                'content' => 'Found several slow queries that need optimization.',
            ],
            [
                'task_id' => $createdTasks[2]->id,
                'user_id' => $user2->id,
                'content' => 'Authentication endpoints are now complete.',
            ],
            [
                'task_id' => $createdTasks[2]->id,
                'user_id' => $admin->id,
                'content' => 'Great progress! Let\'s review the implementation tomorrow.',
            ],
        ];
        
        foreach ($comments as $commentData) {
            TaskComment::create($commentData);
        }
    }
} 