<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('category.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Category $category): bool
    {
        return $user->hasPermissionTo('category.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only Administrator should create categories in general
        return $user->hasRole('Administrator');
    }

    /**
     * Determine whether the user can update the model (Full update).
     */
    public function update(User $user, Category $category): bool
    {
        // Only Administrator can perform full updates (changing platform_fee_percent, etc.)
        return $user->hasRole('Administrator');
    }

    /**
     * Determine whether the user can update the pillar fields (is_focus_program, pillar_image).
     */
    public function updatePillar(User $user, Category $category): bool
    {
        // Both Administrator and Content Editor can update pillar settings
        return $user->hasRole('Administrator') || $user->hasPermissionTo('category.view');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Category $category): bool
    {
        return $user->hasRole('Administrator');
    }
}
