<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class GHNController extends Controller
{
    /**
     * Get wards for a specific district from GHN API.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */

    public function getProvinces(Request $request): \Illuminate\Http\JsonResponse
    {
        // GHN API endpoint
        $url = "https://online-gateway.ghn.vn/shiip/public-api/master-data/province";

        // Initialize Guzzle client
        $client = new Client();

        $token = config('services.ghn.api_token');

        try {
            // Make the API request to GHN
            $response = $client->get($url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Token' => $token, // Use your GHN API token from .env
                ],
            ]);

            // Decode the JSON response
            $data = json_decode($response->getBody(), true);

            // Return the response data
            return response()->json($data);
        } catch (\Exception $e) {
            // Handle errors
            Log::error('Error fetching provinces from GHN API: ' . $e->getMessage());

            return response()->json([
                'success' => 'Failed to fetch data from GHN API',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getDistricts(Request $request)
    {
        // Validate the request
        $request->validate([
            'province_id' => 'required|integer',
        ]);

        // Get the province ID from the request
        $provinceId = $request->input('province_id');

        // GHN API endpoint
        $url = "https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id={$provinceId}";

        // Initialize Guzzle client
        $client = new Client();

        $token = config('services.ghn.api_token');

        try {
            // Make the API request to GHN
            $response = $client->get($url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Token' => $token, // Use your GHN API token from .env
                ],
            ]);

            // Decode the JSON response
            $data = json_decode($response->getBody(), true);

            // Return the response data
            return response()->json($data);
        } catch (\Exception $e) {
            // Handle errors
            return response()->json([
                'error' => 'Failed to fetch data from GHN API',
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    public function getWards(Request $request)
    {
        // Validate the request
        $request->validate([
            'district_id' => 'required|integer',
        ]);

        // Get the district ID from the request
        $districtId = $request->input('district_id');

        // GHN API endpoint
        $url = "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id={$districtId}";

        // Initialize Guzzle client
        $client = new \GuzzleHttp\Client();

        $token = config('services.ghn.api_token');

        try {
            // Make the API request to GHN
            $response = $client->get($url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Token' => $token, // Use your GHN API token from .env
                ],
            ]);

            // Decode the JSON response
            $data = json_decode($response->getBody(), true);

            // Return the response data
            return response()->json($data);
        } catch (\Exception $e) {
            // Handle errors
            return response()->json([
                'error' => 'Failed to fetch data from GHN API',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    public function getShippingFee(Request $request)
    {
        $request->validate([
            'team_id' => 'required|string',
            'to_district_id' => 'required|string',
            'to_ward_code' => 'required|string',
            'insurance_value' => 'required',
        ]);

        $client = new Client();
        $url = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';
        $team = Team::find($request->input('team_id'));
        try {
            $json = [
                'from_district_id' => (int) $team->state,
                'from_ward_code' => $team->ward,
                'service_id' => 53320,
                'service_type_id' => null,
                'to_district_id' => (int) $request->input('to_district_id'),
                'to_ward_code' => (string) "21109",
                "height"=>50,
                "length"=>20,
                "weight"=>200,
                "width"=>20,
                'insurance_value' => (int) $request->input('insurance_value'),
                'cod_failed_amount' => 1000,
                'coupon' => null,
                "items" => [
                    [
                        "name"=> "TEST1",
                      "quantity"=> 1,
                      "height"=> 16,
                      "weight"=> 16,
                      "length"=> 15,
                      "width"=> 15
                    ]
              ]
            ];
            $response = $client->post($url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Token' => env('GHN_API_TOKEN'),
                    'ShopId' => '5530810',
                ],
                'json' => $json,
            ]);

            $data = json_decode($response->getBody(), true);
            $data['data']['total'] += rand(1000, 5000);
            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch shipping fee',
                'message' => $e->getMessage(),
            ], 500);
        }
    }}
