<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bakery Store</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
{{--        @vite('resources/css/app.css')--}}
        <meta name="csrf-token" value="{{ csrf_token() }}" />
    </head>
    <body class="antialiased">
        <div id="root"></div>
        @viteReactRefresh
        @vite('resources/fe/index.jsx')
    </body>
</html>
