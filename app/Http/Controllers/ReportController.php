<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;

class ReportController extends Controller
{
    public function getSummaryReport($currentUser)
    {
        // Get the current month's start and end dates
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        // Initialize the query
        $query = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('order_status', 'Completed');

        // Apply team visibility if the user is not an admin
        if (!$currentUser->is_admin) {
            $role = $currentUser->roles->first();
            if ($role->apply_team_visibility) {
                $query = $this->addTeamVisibility($query, $currentUser);
            }
            if ($currentUser->can('view_owner_orders')) {
                $query = $this->addOwnerVisibility($query, $currentUser);
            }
        }

        // Get the total orders in the current month
        $totalOrders = $query->count();

        // Get the total sales in the current month
        $totalSales = $query->sum('order_total');

        // Get the total customers created in the current month
        $totalCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])->count();

        // Get the total orders by source (online/offline)
        $ordersBySource = $query->selectRaw('source, COUNT(*) as total_orders')
            ->groupBy('source')
            ->pluck('total_orders', 'source')
            ->toArray();

        // Ensure that 'Online' and 'Offline' keys exist in the array
        $totalOrderOnline = isset($ordersBySource['Online']) ? intVal($ordersBySource['Online']) : 0;
        $totalOrderOffline = isset($ordersBySource['Offline']) ? intVal($ordersBySource['Offline']) : 0;

        // Return the summary report
        return [
            'total_orders' => intVal($totalOrders),
            'total_sales' => intVal($totalSales),
            'total_customers' => intVal($totalCustomers),
            'total_orders_online' => $totalOrderOnline,
            'total_orders_offline' => $totalOrderOffline,
        ];
    }

    private function addOwnerVisibility($query, $currentUser)
    {
        return $query->where('created_by', $currentUser->id);
    }

    private function addTeamVisibility($query, $currentUser)
    {
        return $query->where('team_id', $currentUser->team_id)
            ->orWhere('team_id', '1'); // Allow access to team_id = 1 (if applicable)
    }

    public function getOrdersByMonth($currentUser)
    {
        // Initialize the query
        $query = Order::query();

        // Apply team visibility if the user is not an admin
        if (!$currentUser->is_admin) {
            $role = $currentUser->roles->first();
            if ($role->apply_team_visibility) {
                $query = $this->addTeamVisibility($query, $currentUser);
            }
            if ($currentUser->can('view_owner_orders')) {
                $query = $this->addOwnerVisibility($query, $currentUser);
            }
        }

        // Get the total orders for each month
        $ordersByMonth = $query->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total_orders')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total_orders', 'month')
            ->toArray();

        // Return the result
        return [
            'orders_by_month' => $ordersByMonth,
        ];
    }
    public function getOrdersByWeek($currentUser)
    {
        // Initialize the query
        $query = Order::query();

        // Apply team visibility if the user is not an admin
        if (!$currentUser->is_admin) {
            $role = $currentUser->roles->first();
            if ($role->apply_team_visibility) {
                $query = $this->addTeamVisibility($query, $currentUser);
            }
            if ($currentUser->can('view_owner_orders')) {
                $query = $this->addOwnerVisibility($query, $currentUser);
            }
        }
        // Get the total orders for each week
        $ordersByWeek = $query->selectRaw('YEARWEEK(created_at, 3) as week, COUNT(*) as total_orders')
            ->groupBy('week')
            ->orderBy('week')
            ->pluck('total_orders', 'week')
            ->toArray();

        // Return the result
        return [
            'orders_by_week' => $ordersByWeek,
        ];
    }
}
