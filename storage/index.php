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
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver'    => 'pdo_mysql',
        'host'      => 'localhost',
        'dbname'    => 'mediabox',
        'user'      => 'root',
        'password'  => 'Rty_54',
        'charset'   => 'utf8',
    ),
));

// FALSE if use on production
$app['debug'] = true;

//$ini_path['upload']  = "/upload/";
$ini_path['upload']  = "/home/samba/Music/03 - Indiependent";
//$ini_path['upload']  = "/home/samba/Music";
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
    return new Response("", 200);
});

// upload files
$app->match('/save/', function (Request $request) use ($app) {
    $save = new Save($app);

    if ($save->handleUpload($request->request->get("id"))) {
        return new Response("", 200);
    } else {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
        header('Access-Control-Max-Age: 600');

        return new Response("", 200);
    }
});

$app->get('/get/', function (Request $request) use ($app) {

    $sql = "SELECT fullname FROM files WHERE remote_id = ?";
    $row = $app['db']->fetchAssoc($sql, array($request->query->get("id")));
    $file = $row["fullname"];
    $filename = mb_substr($file, mb_strrpos($file, "/")+1);

    if (file_exists($file)) {
        header('Content-Description: File Transfer');
	    header ("Content-Type: ". mime_content_type($file));
        header ("Accept-Ranges: bytes");
        header ("Content-Length: " . filesize($file));
        header ("Content-Disposition: attachment; filename=" . $filename);
        header ('Content-Transfer-Encoding: binary');
        header ('Expires: 0');
        header ('Cache-Control: must-revalidate');
        header ('Pragma: public');

        return new Response(readfile($file), 200);
    }

    return new Response("", 404);
});

$app->get('/remove/', function (Request $request) use ($app) {
    if ($app["files"]->rmFiles($request->query->get("id"))) {
        return new Response($request->query->get("callback") . "('')", 200);
    } else {
        return new Response("", 500);
    }
});

$app->match('/scan/', function (Request $request) use ($app) {
    $files = new Files($app);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
    header('Access-Control-Max-Age: 600');

    $files->scanFolders();
    $files->scanFiles();
    $folders    = $files->getFoldersStructure();
    $files      = $files->getFilesStructure();

    /*
    foreach($files as $i=>$part) {
        $sql = "INSERT INTO files (remote_id, fullname) VALUES (?, ?)";
        $stmt = $app['db']->prepare($sql);
        $stmt->bindValue(1, $i);
        $stmt->bindValue(2, $part["fullname"]);
        $stmt->execute();
    }
    */

    $res = json_encode(array_merge($folders + $files));
    return new Response($request->query->get("callback") . "(" . $res . ")", 200);
});

$app->post('/export/', function (Request $request) use ($app) {
    $data = json_decode($_POST['data'], true);
/*
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
    header('Access-Control-Max-Age: 600');

    return new Response(json_encode($_POST), 200);
*/
    foreach($data as $part) {
        $sql = "INSERT INTO files (remote_id, fullname) VALUES (?, ?)";
        $stmt = $app['db']->prepare($sql);
        $stmt->bindValue(1, $part["id"]);
        $stmt->bindValue(2, $part["fullname"]);
        $stmt->execute();
        //$row = $app['db']->fetchAssoc($sql, array($part["id"], $part["fullname"]));
    }
    //print_r($row);

    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
    header('Access-Control-Max-Age: 600');

    return new Response("", 200);
});

$app->run();
