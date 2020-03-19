<?php
//PHP版本检查
if (version_compare(PHP_VERSION, '5.4.0','<')) {
    echo 'PHP环境不能低于5.4.0';
    exit;
}

//定义常量
if (!defined('START_TIME')) define('START_TIME', microtime(true));
if (!defined('START_MEM')) define('START_MEM', memory_get_usage());
if (!defined('ROOT_PATH')) define('ROOT_PATH', realpath(__DIR__ . '/../') . DIRECTORY_SEPARATOR);
if (!defined('APP_PATH')) define('APP_PATH', ROOT_PATH . 'app' . DIRECTORY_SEPARATOR);
if (!defined('CONFIG_PATH')) define('CONFIG_PATH', ROOT_PATH . 'config/');
//if (!defined('TMP_PATH')) define('TMP_PATH', ROOT_PATH . 'tmp/');
if (!defined('TMP_PATH')) define("TMP_PATH", ROOT_PATH . "tmp/");
if (!defined('ROOT_URL')) define('ROOT_URL', rtrim(dirname($_SERVER["SCRIPT_NAME"]), '\\/') . '/');
if (!defined('PUBLIC_URL')) define('PUBLIC_URL', ROOT_URL . 'public/');

//注册自动加载
spl_autoload_register(function ($class) {
    static $fileList = array();
    $prefixes = array(
        'framework' => realpath(__DIR__ . '/../') . DIRECTORY_SEPARATOR,
        'app' => ROOT_PATH,
        '*' => ROOT_PATH,
    );

    $class = ltrim($class, '\\');
    if (false !== ($pos = strrpos($class, '\\'))) {
        $namespace = substr($class, 0, $pos);
        $className = substr($class, $pos + 1);

        foreach ($prefixes as $prefix => $baseDir) {
            if ('*' !== $prefix && 0 !== strpos($namespace, $prefix)) continue;

            //file path case-insensitive
            $fileDIR = $baseDir . str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
            if (!isset($fileList[$fileDIR])) {
                $fileList[$fileDIR] = array();
                foreach (glob($fileDIR . '*.php') as $file) {
                    $fileList[$fileDIR][] = $file;
                }
            }

            $fileBase = $baseDir . str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR . $className;
            foreach ($fileList[$fileDIR] as $file) {
                if (false !== stripos($file, $fileBase)) {
                    require $file;
                    return true;
                }
            }
        }
    }
    return false;
});

//启动程序
\framework\base\App::run();