<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Program extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'program_code',
        'title',
        'slug',
        'category_id',
        'campaigner_type',
        'campaigner_profile_id',
        'created_by',
        'verified_by',
        'target_amount',
        'collected_amount',
        'deadline',
        'story',
        'cover_image',
        'video_url',
        'status',
        'rejection_notes',
        'published_at',
        'closed_at',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'collected_amount' => 'decimal:2',
        'deadline' => 'date',
        'published_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function campaignerProfile()
    {
        return $this->belongsTo(CampaignerProfile::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function galleries()
    {
        return $this->hasMany(ProgramGallery::class);
    }

    public function documents()
    {
        return $this->hasMany(ProgramDocument::class);
    }

    public function disbursements()
    {
        return $this->hasMany(Disbursement::class);
    }

    public function updates()
    {
        return $this->hasMany(ProgramUpdate::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
