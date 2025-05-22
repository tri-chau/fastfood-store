<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVoucherRequest;
use App\Http\Requests\UpdateVoucherRequest;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends BaseController
{
    /**
     * Display a listing of vouchers.
     */
    public function index()
    {
        $vouchers = Voucher::all();
        return response()->json($vouchers);
    }

    /**
     * Store a newly created voucher in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vourcher_code' => 'required|string|unique:vouchers|max:255',
            'status' => 'required|in:active,inactive',
            'start_date' => 'required|date|before:end_date',
            'end_date' => 'required|date|after:start_date',
            'discount_type' => 'required|in:percent,fixed',
            'discount_amount' => 'required_if:discount_type,fixed|numeric|min:0',
            'discount_percent' => 'required_if:discount_type,percent|numeric|min:0|max:100',
            'limit' => 'required|integer|min:1',
            'teams_id' => 'required|array|min:1', // Ensure it's a list
            'teams_id.*' => 'exists:teams,id',
            'apply_type' => 'required|in:shipping_fee,discount',
            'limit_per_order' => 'nullable|numeric|min:0',
            'minimum' => 'nullable|numeric|min:0',
        ]);
        $validated['config'] = '{}';
        $voucher = Voucher::create($validated);
        $voucher->teams()->attach($validated['teams_id']);

        return response()->json(['message' => 'Voucher created successfully.', 'data' => $voucher], 201);
    }
    /**
     * Load vouchers based on current date and team_id.
     */
    public function loadVouchersByDateAndTeam(Request $request)
    {
        // Validate the request to ensure team_id is provided
        $validated = $request->validate([
            'team_id' => 'required|uuid|exists:teams,id',
        ]);

        // Get the current date
        $currentDate = now()->toDateString();

        // Fetch vouchers that are active, within the current date range, and associated with the provided team_id
        $vouchers = Voucher::where('status', 'active')
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->whereHas('teams', function ($query) use ($validated) {
                $query->where('teams.id', $validated['team_id']);
            })
            ->get();

        $return_data = [];
        foreach($vouchers as $voucher) {
            $return_data[$voucher['apply_type']][] = [
                'id' => $voucher['id'],
                'voucher_code' => $voucher['vourcher_code'],
                'discount_type' => $voucher['discount_type'],
                'discount_amount' => $voucher['discount_amount'],
                'discount_percent' => $voucher['discount_percent'],
                'limit' => $voucher['limit'],
                'limit_per_order' => $voucher['limit_per_order'],
                'minimum' => $voucher['minimum'],
                'apply_type' => $voucher['apply_type'],
                'remaining' => $voucher['limit'] - $this->calculateUsedVouchers($voucher),
            ];
        }
        return response()->json([
            'success' => true,
            'data' => $return_data
        ], 200);
    }
    public function loadVouchersByDateAndUser(Request $request)
    {
        // Get the current date
        $currentDate = now()->toDateString();
        $curren_user = auth()->user();
        // Fetch vouchers that are active, within the current date range, and associated with the provided team_id
        $vouchers = Voucher::where('status', 'active')
            ->where('apply_type', 'discount')
            ->whereDate('start_date', '<=', $currentDate)
            ->whereDate('end_date', '>=', $currentDate)
            ->whereHas('teams', function ($query) use ($curren_user) {
                $query->where('teams.id', $curren_user->team_id)
                    ->orWhere('teams.id', '1');
            })
            ->get();

        $return_data = [];
        foreach($vouchers as $voucher) {
            $return_data[] = [
                'id' => $voucher['id'],
                'voucher_code' => $voucher['vourcher_code'],
                'discount_type' => $voucher['discount_type'],
                'discount_amount' => $voucher['discount_amount'],
                'discount_percent' => $voucher['discount_percent'],
                'limit' => $voucher['limit'],
                'limit_per_order' => $voucher['limit_per_order'],
                'minimum' => $voucher['minimum'],
                'apply_type' => $voucher['apply_type'],
                'remaining' => $voucher['limit'] - $this->calculateUsedVouchers($voucher),
            ];
        }
        return response()->json([
            'success' => true,
            'data' => $return_data
        ], 200);
    }
    public function calculateUsedVouchers($voucher)
    {
        return 0;
    }
    /**
     * Display the specified voucher.
     */
    public function show(string $id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher['teams_id'] = $voucher->teams()->pluck('id');
        $voucher['minimum'] = (int) $voucher->minimum;
        $voucher['limit_per_order'] = (int) $voucher->limit_per_order;
        return response()->json([
            'success' => true,
            'data' => $voucher
        ], 200);
    }

    /**
     * Update the specified voucher in storage.
     */
    public function update(Request $request, string $id)
    {

        $validated = $request->validate([
            'vourcher_code' => 'nullable|string|unique:vouchers,vourcher_code,' . $id . '|max:255',
            'status' => 'nullable|in:active,inactive',
            'start_date' => 'nullable|date|before:end_date',
            'end_date' => 'nullable|date|after:start_date',
            'discount_type' => 'nullable|in:percent,fixed',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'limit' => 'nullable|integer|min:1',
            'apply_type' => 'required|in:shipping_fee,discount',
            'limit_per_order' => 'nullable|integer|min:1',
            'minimum' => 'nullable|integer|min:1',
            'config' => 'nullable|json',
            'teams_id' => 'nullable'
        ]);
        try {
            $voucher = Voucher::findOrFail($id);
            $voucher->update($validated);
            $voucher->teams()->sync($validated['teams_id']);

            return response()->json(['message' => 'Voucher updated successfully.', 'data' => $voucher]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified voucher from storage.
     */
    public function destroy(string $id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return response()->json(['message' => 'Voucher deleted successfully.']);
    }
}
