<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ModuleController extends BaseController
{
    public function index(Request $request, $module)
    {
        try {
            $module_name = rtrim($module, 's');
            if(array_key_exists($module, $this->specific_module)) {
                $module_name = $this->specific_module[$module];
            }
            // Dynamically resolve the model name based on the module
            $modelName = 'App\\Models\\' . ucfirst($module_name);

            // Check if the model exists
            if (!class_exists($modelName)) {
                return response()->json(['error' => 'Model not found'], 404);
            }

            // Parse the request for conditions (you can customize this based on your query needs)
            $query = $modelName::query();

            // Example: if you want to filter by conditions passed in the request
            if ($request->has('filter')) {
                $filters = $request->input('filter');
                foreach ($filters as $key => $value) {
                    $query->where($key, $value);
                }
            }
            $current_user = $request->user();
            if(!$current_user->is_admin) {
                $role = $current_user->roles->first();
                if($role->apply_team_visibility) {
                    $query = $this->addTeamVisibility($query, $current_user);
                }
                if($current_user->can('view_owner_' . strtolower($module))) {
                    $query = $this->addOwnerVisibility($query, $current_user);
                }
            }
            $query->orderBy('created_at', 'desc');
            // Execute the query and get the data
            $data = $query->get();
            $data->map(function ($item) {
                // Assuming `created_by` stores the user's ID
                $user = \App\Models\User::find($item->created_by); // Get the user by ID
                $team = \App\Models\Team::find($item->team_id); // Get the user by ID

                // Map the created_by_name attribute
                $item->created_by_name = $user ? $user->name : null; // Assign the user's name, or null if the user doesn't exist
                $item->team_name = $team ? $team->name : null; // Assign the user's name, or null if the user doesn't exist

                return $item;
            });

            // Retrieve and map custom fields
            $data = $this->retrieveCustomField($module, $data);

            return $this->sendResponse($data, 'Retrieve data successfully');
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }
    private function retrieveCustomField($module, $data)
    {
        try {
            $module_name = rtrim($module, 's');
            // Dynamically resolve the controller name based on the module
            $controllerName = 'App\\Http\\Controllers\\' . ucfirst($module_name) . 'Controller';

            // Check if the controller exists
            if (!class_exists($controllerName)) {
                return $data; // If the controller doesn't exist, return the data as is
            }

            // Instantiate the controller
            $controller = app($controllerName);

            // Check if the method exists in the controller
            if (!method_exists($controller, 'getCustomFields')) {
                return $data; // If the method doesn't exist, return the data as is
            }

            // Call the method and get the custom fields
            $customFields = app()->call([$controller, 'getCustomFields'], ['data' => $data]);

            // Map the custom fields to the data
            foreach ($data as $item) {
                if (isset($customFields[$item->id])) {
                    $item->custom_fields = $customFields[$item->id];
                } else {
                    $item->custom_fields = [];
                }
            }

            return $data;
        } catch (\Exception $e) {
            // Log the error or handle it as needed
            return $data; // Return the data as is in case of an error
        }
    }
    private $specific_module = [
        'categories' => 'category',
    ];
    private function addOwnerVisibility($query, $current_user) {
        return $query->where('created_by', $current_user->id);
    }
    private function addTeamVisibility($query, $current_user) {
        return $query->where('team_id', $current_user->team_id)
            ->orWhere('team_id', '1');
    }
    public function save(Request $request, $module, $id = null)
    {
        try {
            //Check the request is POST or PUT
            $method = '';
            if ($request->isMethod('post')) {
                $method = 'store';
            } else if ($request->isMethod('put')) {
                $method = 'update';
            }
            $curr_user = $request->user();
            if(!$curr_user->is_admin) {
                if(!$this->hasPermission($module, $method, $curr_user)) {
                    return response()->json(['error' => 'Dont have permission to take this action'], 402);
                }
            }
            $module_name = rtrim($module, 's');
            // Dynamically resolve the controller name based on the module
            $controllerName = 'App\\Http\\Controllers\\' . ucfirst($module_name) . 'Controller';

            // Check if the controller exists
            if (!class_exists($controllerName)) {
                return response()->json(['error' => 'Controller not found'], 404);
            }

            // Instantiate the controller
            $controller = app($controllerName);

            if (!method_exists($controller, $method)) {
                return response()->json(['error' => 'Method not found in controller'], 404);
            }

            // Call the method and pass the request
            $args = $method == 'update' ? ['request' => $request, 'id' => $id] : ['request' => $request];
            return app()->call([$controller, $method], $args);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    private function hasPermission($module, $action, $current_user) {
        if($action == "store") {
            $permission_to_check = 'create_' . strtolower($module);
            return $current_user->can($permission_to_check);
        } else if($action == "update") {
            $permission_all = 'edit_all_' . strtolower($module);
            $permission_owner = 'edit_owner_' . strtolower($module);
            return $current_user->can($permission_all) || $current_user->can($permission_owner);
        }
        return false;
    }
    public function show(Request $request, $module, $id)
    {
        try {
            $method = 'show';
            $curr_user = $request->user();
            if(!$curr_user->is_admin) {
                if(!$this->hasPermission($module, $method, $curr_user)) {
                    return response()->json(['error' => 'Dont have permission to take this action'], 402);
                }
            }
            $module_name = rtrim($module, 's');
            // Dynamically resolve the controller name based on the module
            $controllerName = 'App\\Http\\Controllers\\' . ucfirst($module_name) . 'Controller';

            // Check if the controller exists
            if (!class_exists($controllerName)) {
                return response()->json(['error' => 'Controller not found'], 404);
            }

            // Instantiate the controller
            $controller = app($controllerName);

            if (!method_exists($controller, $method)) {
                return response()->json(['error' => 'Method not found in controller'], 404);
            }

            // Call the method and pass the request
            return app()->call([$controller, $method], ['request' => $request, 'id' => $id]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function delete(Request $request, $module)
    {
        try {
            $method = 'destroy';
            $curr_user = $request->user();
            if(!$curr_user->is_admin) {
                if(!$this->hasPermission($module, $method, $curr_user)) {
                    return response()->json(['error' => 'Dont have permission to take this action'], 402);
                }
            }
            $module_name = rtrim($module, 's');
            // Dynamically resolve the controller name based on the module
            $controllerName = 'App\\Http\\Controllers\\' . ucfirst($module_name) . 'Controller';

            // Check if the controller exists
            if (!class_exists($controllerName)) {
                return response()->json(['error' => 'Controller not found'], 404);
            }

            // Instantiate the controller
            $controller = app($controllerName);

            if (!method_exists($controller, $method)) {
                return response()->json(['error' => 'Method not found in controller'], 404);
            }

            // Call the method and pass the request
            return app()->call([$controller, $method], ['request' => $request]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}
