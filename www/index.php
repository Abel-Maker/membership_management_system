<?php
//访问的域名
$host = $_SERVER['HTTP_HOST'];
//判断的根域名
$domain = 'mycola.com';

//上传文件的带网址地址，便于静态文件cdn
define('UPLOAD_DIR', 'upload');
define('__UPLOAD__', 'http://s.mycola.com');

//判断不同域名进入不同的系统
switch ($host) {
    //总后台
    case 'www.' . $domain:
    case 'record.' . $domain:
        define('APP', 'MAIN');
        break;

    //微信回调系统
    case 'api.' . $domain:
        define('APP', 'API');
        break;

    //MOBILE
    case 'user.' . $domain:
        define('APP', 'USER');
        break;

    //静态文件
    case 's' . $domain:
        define('APP', 'WWW');
        break;

    //建站系统
    default:
        define('APP', 'WWW');
        break;
}
//运行系统
require('../framework/start.php');