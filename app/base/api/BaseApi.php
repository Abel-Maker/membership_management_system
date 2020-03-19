<?php
namespace app\base\api;

use framework\base\Api;

class BaseApi extends Api {

    protected $sysInfo;
    protected $sysConfig;

    public function __construct() {
        parent::__construct();

        //设置错误级别
        //error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
        //定义常量
        define('WWW_PATH', ROOT_PATH . 'www' . DIRECTORY_SEPARATOR);
        define('__PUBLIC__', substr(PUBLIC_URL, 0, -1));
        define('__ROOT__', substr(ROOT_URL, 0, -1));

        //定义请求
        define('REQUEST_METHOD', $_SERVER['REQUEST_METHOD']);
        define('IS_GET', REQUEST_METHOD == 'GET' ? true : false);
        define('IS_POST', REQUEST_METHOD == 'POST' ? true : false);
        define('IS_AJAX', ((isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')) ? true : false);

        //上传的目录
        define('UPLOAD_PATH', WWW_PATH . UPLOAD_DIR);

        //引入扩展函数
        require_once(APP_PATH . 'base/util/Function.php');
    }
}