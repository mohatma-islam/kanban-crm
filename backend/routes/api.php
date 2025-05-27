<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/test', function () {
    return response()->json(['message' => 'API is running']);
});


// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Users
    Route::apiResource('users', UserController::class);
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Customers
    Route::apiResource('customers', CustomerController::class);
    
    // Boards
    Route::apiResource('boards', BoardController::class);
    Route::get('/boards/{board}/columns', [BoardController::class, 'columns']);
    Route::post('/boards/{board}/columns', [BoardController::class, 'addColumn']);
    Route::put('/boards/{board}/columns/{column}', [BoardController::class, 'updateColumn']);
    Route::delete('/boards/{board}/columns/{column}', [BoardController::class, 'deleteColumn']);
    Route::put('/boards/{board}/columns/reorder', [BoardController::class, 'reorderColumns']);
    
    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::put('/tasks/{task}/move', [TaskController::class, 'moveTask']);
    // Route::put('/tasks-reorder', [TaskController::class, 'reorderTasks']);
    // Route::get('/tasks/calendar', [TaskController::class, 'calendar']);
    Route::get('calendar', [TaskController::class, 'calendar']);
    Route::put('reorder', [TaskController::class, 'reorderTasks']);


    
    // Task comments
    Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::put('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);
}); 