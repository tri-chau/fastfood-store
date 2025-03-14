<?php

namespace App\Http\Controllers;

use App\Models\Order;
use AWS\CRT\Log;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Label\Label;
use Endroid\QrCode\Logo\Logo;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;
use PayOS\PayOS;
use Endroid\QrCode\QrCode;

class PayOSController extends Controller
{
    private $payos = null;
    public function __construct()
    {
        $this->payos = new PayOS(
            config('services.payos.client_id'),
            config('services.payos.api_key'),
            config('services.payos.checksum_key')
        );
    }
    public function createPayment(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_id' => 'required|string',
            ]);
        } catch (\Throwable $th) {
            return [
                "success" => false,
                "message" => $th->getMessage(),
            ];
        }

        try {
            $order = Order::findOrfail($validated['order_id']);
            if(!$order) {
                return response()->json([
                    "error" => 1,
                    "message" => "Order not found",
                ]);
            }

            if($order->payment_link) {
                return response()->json([
                    "error" => 0,
                    "message" => "Success",
                    "checkoutUrl" => $order->payment_link
                ]);
            }

            // Initialize PayOS with your credentials
            $orderCode = intVal(str_replace('ORD', '', $order->order_number));
            // Prepare payment data
            $paymentData = [
                'orderCode' => $orderCode, // Unique order code
                'amount' => intval($order->order_total), // Payment amount
                'description' => '#' . $order->order_number, // Payment description
                'returnUrl' => 'https://b9c5-2402-800-63ac-8a09-f954-92d2-5a6c-bf2a.ngrok-free.app', // Redirect URL after payment
                'cancelUrl' => 'https://b9c5-2402-800-63ac-8a09-f954-92d2-5a6c-bf2a.ngrok-free.app', // Redirect URL if payment is canceled
            ];

            try {
                $response = $this->payos->createPaymentLink($paymentData);
                $order->payment_link = $response["checkoutUrl"];
                $order->save();
                return response()->json([
                    "error" => 0,
                    "message" => "Success",
                    "checkoutUrl" => $response["checkoutUrl"]
                ]);
            } catch (\Throwable $th) {
                \Illuminate\Support\Facades\Log::debug($th->getMessage());
                return response()->json([
                    "error" => 1,
                    "message" => $th->getMessage(),
                ]);
            }
        } catch (\Throwable $th) {
            \Illuminate\Support\Facades\Log::debug('PayOS Webhook test received');
            return response()->json([
                "error" => 1,
                "message" => $th->getMessage(),
            ]);
        }
    }
    public function genPayment($order_id)
    {
        try {
            $order = Order::findOrfail($order_id);
            if(!$order) {
                return response()->json([
                    "error" => 1,
                    "message" => "Order not found",
                ]);
            }

            if($order->payment_link) {
                return [
                    "success" => true,
                    "checkoutUrl" => $order->payment_link
                ];
            }
            // Initialize PayOS with your credentials
            $orderCode = intVal(str_replace('ORD', '', $order->order_number));
            // Prepare payment data
            $paymentData = [
                'orderCode' => $orderCode, // Unique order code
                'amount' => intval($order->order_total), // Payment amount
                'description' => '#' . $order->order_number, // Payment description
                'returnUrl' => 'https://b9c5-2402-800-63ac-8a09-f954-92d2-5a6c-bf2a.ngrok-free.app', // Redirect URL after payment
                'cancelUrl' => 'https://b9c5-2402-800-63ac-8a09-f954-92d2-5a6c-bf2a.ngrok-free.app', // Redirect URL if payment is canceled
            ];

            try {
                $response = $this->payos->createPaymentLink($paymentData);
                $order->payment_link = $response["checkoutUrl"];
                $order->save();
                return [
                    "success" => true,
                    "checkoutUrl" => $response["checkoutUrl"]
                ];
            } catch (\Throwable $th) {
                return response()->json([
                    "error" => 1,
                    "message" => $th->getMessage(),
                ]);
            }
        } catch (\Throwable $th) {
            return response()->json([
                "error" => 1,
                "message" => $th->getMessage(),
            ]);
        }
    }
    public function getPaymentLinkInfoOfOrder(string $id)
    {
        try {
            $response = $this->payos->getPaymentLinkInformation($id);
            return response()->json([
                "error" => 0,
                "message" => "Success",
                "data" => $response["data"]
            ]);
        } catch (\Throwable $th) {
            return $this->handleException($th);
        }
    }
    public function cancelPaymentLinkOfOrder(Request $request, string $id)
    {
        $body = json_decode($request->getContent(), true);
        $cancelBody = is_array($body) && $body["cancellationReason"] ? $body : null;

        try {
            $response = $this->payos->cancelPaymentLink($id, $cancelBody);
            return response()->json([
                "error" => 0,
                "message" => "Success",
                "data" => $response["data"]
            ]);
        } catch (\Throwable $th) {
            return $this->handleException($th);
        }
    }
}
