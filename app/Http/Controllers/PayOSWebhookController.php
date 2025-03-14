<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use PayOS\PayOS;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PayOSWebhookController extends Controller
{
    public function handlePayOSWebhook(Request $request): \Illuminate\Http\JsonResponse
    {
        Log::debug('PayOS Webhook test received');
        $body = json_decode($request->getContent(), true);
        // Handle webhook test
        if (in_array($body["data"]["description"], ["Ma giao dich thu nghiem", "VQRIO123"])) {
            return response()->json([
                "error" => 0,
                "message" => "Ok",
                "data" => $body["data"]
            ]);
        }

        // Log the data
        $orderNumber = 'ORD'.$body['data']["orderCode"];
        $order = Order::where('order_number', $orderNumber)->first();
        if($order->payment_status == 'paid') {
            return response()->json([
                "error" => 0,
                "message" => "Ok",
                "data" => $body["data"]
            ]);
        }

        $order->payment_status = 'paid';
        $order->order_status = 'In Progress';
        $order->save();
        $this->sendSocket($order);
        return response()->json([
            "error" => 0,
            "message" => "Ok",
            "data" => $body["data"]
        ]);
    }

    public function sendSocket($order)
    {
        // Define the URL
        $url = 'https://socket.dotb.cloud/send-event-phenikaa';

        // Prepare the request body
        $body = [
            "to" => 'triggerPaymentStatus/'.$order->id,
            "data" => [
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'amount' => $order->order_total,
                    'order_number' => $order->order_number,
                ],
            ],
        ];

        // Send the POST request
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $body);

        // Get the HTTP status code
        $httpCode = $response->status();

        // Check the response
        if ($response->successful()) {
            // Success
            return $response->json();
        } else {
            // Handle errors
            return [
                'status' => 'error',
                'message' => 'Failed to send event to Phenikaa socket server',
                'http_code' => $httpCode,
                'response' => $response->body(),
            ];
        }
    }
}
