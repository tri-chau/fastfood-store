<?php

namespace App\Models\Concerns;

trait HasCreatedBy
{
    protected static function bootHasCreatedBy()
    {
        static::creating(function ($model) {
            $cur_user_id = auth()->id() ?? '1';
            $model->{'created_by'} = $cur_user_id;
            $modelName = class_basename($model);
//            if($model->team_id == null && $modelName != 'Team' && $modelName != 'Role' && $modelName != 'Permission') {
//                $model->{'team_id'} = '1';
//            }
        });
    }
}



?>
