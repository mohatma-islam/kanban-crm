<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardColumn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BoardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Board::with('columns')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $board = Board::create($validated);

        // Create default columns
        $defaultColumns = ['To Do', 'In Progress', 'Done'];
        foreach ($defaultColumns as $i => $name) {
            BoardColumn::create([
                'board_id' => $board->id,
                'name' => $name,
                'order' => $i,
            ]);
        }

        return response()->json($board, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Board $board)
    {
        return $board->load(['columns.tasks.user', 'columns.tasks.customer', 'columns.tasks.comments']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $board->update($validated);

        return response()->json($board);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Board $board)
    {
        // delete all columns and tasks
        $board->columns()->each(function ($column) {
            $column->tasks()->each(function ($task) {
                $task->comments()->delete();
                $task->delete();
            });
            $column->delete();
        });

        $board->delete();

        return response()->json(null, 204);
    }

    /**
     * Get all columns for a board.
     */
    public function columns(Board $board)
    {
        return $board->columns;
    }

    /**
     * Add a new column to a board.
     */
    public function addColumn(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $maxOrder = $board->columns()->max('order') ?? -1;
        
        $column = $board->columns()->create([
            'name' => $validated['name'],
            'order' => $maxOrder + 1,
        ]);

        return response()->json($column, 201);
    }

    /**
     * Update a board column.
     */
    public function updateColumn(Request $request, Board $board, BoardColumn $column)
    {
        if ($column->board_id !== $board->id) {
            return response()->json(['message' => 'Column does not belong to this board'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $column->update($validated);

        return response()->json($column);
    }

    /**
     * Delete a board column.
     */
    public function deleteColumn(Board $board, BoardColumn $column)
    {
        if ($column->board_id !== $board->id) {
            return response()->json(['message' => 'Column does not belong to this board'], 403);
        }

        // Don't allow deletion if it's the last column
        if ($board->columns()->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the last column'], 400);
        }

        // Find another column to move tasks to
        $anotherColumn = $board->columns()
            ->where('id', '!=', $column->id)
            ->first();

        // Move all tasks to another column
        DB::transaction(function () use ($column, $anotherColumn) {
            $column->tasks()->update(['column_id' => $anotherColumn->id]);
            $column->delete();
        });

        return response()->json(null, 204);
    }

    /**
     * Reorder columns in a board.
     */
    public function reorderColumns(Request $request, Board $board)
    {
        $request->validate([
            'columns' => 'required|array',
            'columns.*' => 'required|integer|exists:board_columns,id',
        ]);

        $columnIds = $request->input('columns');
        
        // Verify all columns belong to this board
        $count = $board->columns()
            ->whereIn('id', $columnIds)
            ->count();
            
        if ($count !== count($columnIds)) {
            return response()->json(['message' => 'All columns must belong to this board'], 400);
        }

        // Update order of columns
        DB::transaction(function () use ($columnIds) {
            foreach ($columnIds as $index => $columnId) {
                BoardColumn::where('id', $columnId)->update(['order' => $index]);
            }
        });

        return response()->json(['message' => 'Columns reordered successfully']);
    }
} 