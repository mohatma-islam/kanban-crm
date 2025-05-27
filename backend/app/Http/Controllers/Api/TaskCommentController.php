<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Task $task)
    {
        return $task->comments()->with('user')->latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $comment = $task->comments()->create([
            'content' => $validated['content'],
            'user_id' => $request->user()->id
        ]);

        return response()->json($comment->load('user'), 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task, TaskComment $comment)
    {
        // Ensure the comment belongs to the task
        if ($comment->task_id !== $task->id) {
            return response()->json(['message' => 'Comment does not belong to this task'], 403);
        }

        // Ensure the user owns the comment
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not have permission to edit this comment'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $comment->update([
            'content' => $validated['content']
        ]);

        return response()->json($comment->load('user'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Task $task, TaskComment $comment)
    {
        // Ensure the comment belongs to the task
        if ($comment->task_id !== $task->id) {
            return response()->json(['message' => 'Comment does not belong to this task'], 403);
        }

        // Ensure the user owns the comment
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You do not have permission to delete this comment'], 403);
        }

        $comment->delete();

        return response()->json(null, 204);
    }
} 