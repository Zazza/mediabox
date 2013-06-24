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

$app['filetypes'] = array(
    'bmp' => 'image/bmp',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'png' => 'image/png',
    'ogg' => 'audio/ogg',
    'mp3' => 'audio/mp3',
    'mp4' => 'video/mp4',
    'mov' => 'video/quicktime',
    'wmv' => 'video/x-ms-wmv',
    'flv' => 'video/x-flv',
    'avi' => 'video/x-msvideo',
    'mpg' => 'video/mpeg'
);

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

    if ($save->handleUpload($request->request->get("name"))) {
        $sql = "INSERT INTO files (remote_id, fullname) VALUES (?, ?)";
        $stmt = $app['db']->prepare($sql);
        $stmt->bindValue(1, $request->request->get("id"));
        $stmt->bindValue(2,  $this->_app['upload'] . "/" . $request->request->get("name"));
        $stmt->execute();

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

        /*
         * Не всегда корректно отпределяет тип файла, например для некоторых mp3
         * возвращает Content-Type: application/octet-stream
         * что приводит к ошибке проигрвания файла в IE
         *
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $content_type = finfo_file($finfo, $file);
        finfo_close($finfo);
        */
        $content_type = $app['filetypes'][substr($file, strrpos($file, '.') + 1)];

        header('Content-Description: File Transfer');
        header("Content-Type: " . $content_type);
        header("Accept-Ranges: bytes");
        header("Content-Length: " . filesize($file));
        header("Content-Disposition: attachment; filename=" . urlencode($filename));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
        header("Cache-Control: no-store, no-cache, must-revalidate");
        header('Cache-Control: must-revalidate');
        header('Pragma: public');

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

    //$files->scanFolders();
    //$files->scanFiles();
    $files->scanFilesAndFolders();
    $folders    = $files->getFoldersStructure();
    $files      = $files->getFilesStructure();

    $res = json_encode(array_merge($folders + $files));
    return new Response($request->query->get("callback") . "(" . $res . ")", 200);
});

$app->post('/export/', function (Request $request) use ($app) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
    header('Access-Control-Max-Age: 600');

    $filename= __DIR__ . "/test";

    $fout=fopen($filename,"wb");

    if (!$fout) {
        return new Response("Error file open!", 500);
    }

    $fin = fopen("php://input", "rb");
    if ($fin) {
        while (!feof($fin)) {
            $data=fread($fin, 1024*1024);
            fwrite($fout,$data);
        }
        fclose($fin);
    }

    fclose($fout);

    $data=json_decode(file_get_contents($filename), true);

    foreach($data as $part) {
        $sql = "INSERT INTO files (remote_id, fullname) VALUES (?, ?)";
        $stmt = $app['db']->prepare($sql);
        $stmt->bindValue(1, $part["id"]);
        $stmt->bindValue(2, $part["fullname"]);
        $stmt->execute();
    }

    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
    header('Access-Control-Max-Age: 600');

    return new Response("", 200);
});

$app->run();
