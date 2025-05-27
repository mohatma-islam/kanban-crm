<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoardColumn;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Task::with(['column.board', 'user', 'customer', 'comments']);
        
        if ($request->has('column_id')) {
            $query->where('column_id', $request->input('column_id'));
        }
        
        return $query->orderBy('order')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'column_id' => 'required|exists:board_columns,id',
            'customer_id' => 'nullable|exists:customers,id',
            'user_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        // Get the maximum order in the column
        $column = BoardColumn::findOrFail($validated['column_id']);
        $maxOrder = $column->tasks()->max('order') ?? -1;
        $validated['order'] = $maxOrder + 1;

        $task = Task::create($validated);

        return response()->json($task->load(['column.board', 'user', 'customer']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        return $task->load(['column.board', 'user', 'customer', 'comments.user']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'customer_id' => 'nullable|exists:customers,id',
            'user_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return response()->json($task->load(['column.board', 'user', 'customer']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->comments()->delete();
        $task->delete();

        return response()->json(null, 204);
    }

    /**
     * Move a task to a different column.
     */
    public function moveTask(Request $request, Task $task)
    {
        $validated = $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'order' => 'required|integer|min:0',
        ]);

        $oldColumnId = $task->column_id;
        $newColumnId = $validated['column_id'];
        $newOrder = $validated['order'];

        DB::transaction(function () use ($task, $oldColumnId, $newColumnId, $newOrder) {
            // If moving to a different column
            if ($oldColumnId != $newColumnId) {
                // Make space in the target column
                Task::where('column_id', $newColumnId)
                    ->where('order', '>=', $newOrder)
                    ->increment('order');
                
                // Update the task with new column and order
                $task->update([
                    'column_id' => $newColumnId,
                    'order' => $newOrder
                ]);
                
                // Reorder the old column to remove gaps
                $this->reorderTasksInColumn($oldColumnId);
            } else {
                // Moving within the same column
                $oldOrder = $task->order;
                
                if ($oldOrder < $newOrder) {
                    // Moving down: decrement tasks in between
                    Task::where('column_id', $newColumnId)
                        ->whereBetween('order', [$oldOrder + 1, $newOrder])
                        ->decrement('order');
                } else if ($oldOrder > $newOrder) {
                    // Moving up: increment tasks in between
                    Task::where('column_id', $newColumnId)
                        ->whereBetween('order', [$newOrder, $oldOrder - 1])
                        ->increment('order');
                }
                
                // Update task order
                $task->update(['order' => $newOrder]);
            }
        });

        return response()->json($task->fresh()->load(['column.board', 'user', 'customer']));
    }

    /**
     * Reorder tasks in a column.
     */
    public function reorderTasks(Request $request)
    {
        // dd($request->all());
        $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'tasks' => 'required|array',
            'tasks.*' => 'required|integer|exists:tasks,id',
        ]);

        $columnId = $request->input('column_id');
        $taskIds = $request->input('tasks');
        
        // Verify all tasks belong to this column
        $count = Task::where('column_id', $columnId)
            ->whereIn('id', $taskIds)
            ->count();
            
        if ($count !== count($taskIds)) {
            return response()->json(['message' => 'All tasks must belong to the specified column'], 400);
        }

        // Update order of tasks
        DB::transaction(function () use ($taskIds) {
            foreach ($taskIds as $index => $taskId) {
                Task::where('id', $taskId)->update(['order' => $index]);
            }
        });

        return response()->json(['message' => 'Tasks reordered successfully']);
    }

    /**
     * Get tasks for calendar view.
     */
    public function calendar()
    {
        return Task::whereNotNull('due_date')
            ->with(['column.board', 'user', 'customer'])
            ->get();
    }

    /**
     * Helper method to reorder tasks in a column, removing gaps in order.
     */
    private function reorderTasksInColumn($columnId)
    {
        $tasks = Task::where('column_id', $columnId)
            ->orderBy('order')
            ->get();
            
        foreach ($tasks as $index => $task) {
            if ($task->order !== $index) {
                $task->update(['order' => $index]);
            }
        }
    }
} 