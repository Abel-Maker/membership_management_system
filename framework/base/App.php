<?php

namespace framework\base;

class App {

    protected static function init() {
        header('content-type: text/html; charset=utf-8');
        Config::init(ROOT_PATH);
        Config::loadConfig(CONFIG_PATH . 'global.php');
        date_default_timezone_set(Config::get('TIMEZONE'));

        //当前模块的配置
        //$envConfig = CONFIG_PATH . 'app/' . strtolower(Config::get('APP')) . '.php';
        $envConfig = APP_PATH . strtolower(Config::get('APP')) . '/conf/' . 'config.php';
        if (file_exists($envConfig)) {
            //die('ENV配置文件不存在');
            Config::loadConfig($envConfig);
        }

        //其他模块自动加载
        $loadFile = ROOT_PATH . 'vendor/autoload.php';
        if(file_exists($loadFile)) {
            require $loadFile;
        }

        //error display
        if (Config::get('DEBUG')) {
            ini_set("display_errors", 1);
            //error_reporting(E_ALL ^ E_NOTICE);
            error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
        } else {
            ini_set("display_errors", 0);
            error_reporting(0);
        }

        //载入基础函数
        require_once ROOT_PATH . 'framework/base/Function.php';
    }

    public static function run() {
        try {
            self::init();

            Hook::init(ROOT_PATH);
            Hook::listen('appBegin');

            Hook::listen('routeParseUrl', array(Config::get('REWRITE_RULE'), Config::get('REWRITE_ON')));

            //default route
            if (!defined('APP_NAME') || !defined('CONTROLLER_NAME') || !defined('ACTION_NAME')) {
                Route::parseUrl(Config::get('REWRITE_RULE'), Config::get('REWRITE_ON'));
            }

            //execute action
            $controller = '\app\\' . APP_NAME . '\controller\\' . CONTROLLER_NAME . 'Controller';
            $action = ACTION_NAME;

            if (!class_exists($controller)) {
                throw new \Exception("Controller '{$controller}' not found", 404);
            }
            $obj = new $controller();
            if (!method_exists($obj, $action)) {
                throw new \Exception("Action '{$controller}::{$action}()' not found", 404);
            }

            Hook::listen('actionBefore', array($obj, $action));
            $obj->$action();
            Hook::listen('actionAfter', array($obj, $action));

        } catch (\Exception $e) {
            Hook::listen('appError', array($e));
        }

        Hook::listen('appEnd');
    }
}