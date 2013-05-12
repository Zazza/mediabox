<?php

require_once __DIR__.'/silex/vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Fm\Components\Files;
use Fm\Components\Save;

mb_internal_encoding('utf-8');

$app = new Silex\Application();

// /silex/views - for templates
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/silex/views',
));
$app->register(new Silex\Provider\SessionServiceProvider());
$app->register(new Silex\Provider\UrlGeneratorServiceProvider());

// FALSE if use on production
$app['debug'] = true;

$ini_path['upload']  = "/upload/";
$app["rel_upload"] = $ini_path['upload'];
$app["upload"] = __DIR__ . "/" . $ini_path['upload'];

// class Save
$app['save'] = $app->share(function () use ($app) {
    return new Save($app);
});
// class Files
$app['files'] = $app->share(function () use ($app) {
    return new Files($app);
});

$app->get('/', function (Request $request) use ($app) {
    $save = $app["save"];

    if ($save->handleUpload($request->request->get("id"))) {
        return new Response('', 200);
    } else {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
        header('Access-Control-Max-Age: 600');

        return new Response("", 200);
    }
});

// upload files
$app->match('/save/', function (Request $request) use ($app) {
    $save = new Save($app);

    if ($save->handleUpload($request->request->get("id"))) {
        return new Response('', 200);
    } else {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
        header('Access-Control-Max-Age: 600');

        return new Response("", 200);
    }
});

$app->get('/get/', function (Request $request) use ($app) {

    $file = __DIR__."/upload/".$request->query->get("id");

    if (file_exists($file)) {
        $filename = str_replace(" ", "_", $request->query->get("id"));

        header ("Content-Type: application/octet-stream");
        header ("Accept-Ranges: bytes");
        header ("Content-Length: " . filesize($file));
        header ("Content-Disposition: attachment; filename=" . $request->query->get("id"));

        return new Response(readfile($file), 200);
    }

    return new Response("", 500);
});

$app->get('/getImageDesc/', function (Request $request) use ($app) {
    $file = __DIR__."/upload/".$request->query->get("id");
    if (file_exists($file)) {
        $size = getimagesize($file);
        $row["y"] = $size[1];
        $row["x"] = $size[0];

        return new Response($request->query->get("callback") . "(" . json_encode($row) . ")", 200);
    }

    return new Response("", 500);
});

$app->get('/remove/', function (Request $request) use ($app) {
    if ($app["files"]->rmFiles($request->query->get("id"))) {
        return new Response($request->query->get("callback") . "('')", 200);
    } else {
        return new Response("", 500);
    }
});

$app->run();
