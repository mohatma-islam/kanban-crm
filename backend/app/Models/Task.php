<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'column_id',
        'customer_id',
        'user_id',
        'due_date',
        'order',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    public function column(): BelongsTo
    {
        return $this->belongsTo(BoardColumn::class, 'column_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }
} 