<?php
//config
function config($key = NULL, $value = NULL) {
    if (func_num_args() <= 1) {
        return \framework\base\Config::get($key);
    } else {
        return \framework\base\Config::set($key, $value);
    }
}

//url
function url($route = null, $params = array()) {
    return \framework\base\Route::url($route, $params);
}

//model
function model($model, $app = '', $forceInstance = false) {
    return obj($model, $app, '', '', $forceInstance);
}

//obj
function obj($class, $app = '', $args = array(), $file = '', $forceInstance = false) {

    static $objArr = array();
    if (empty($app)) $app = APP_NAME;

    if (isset($objArr[$class]) && false == $forceInstance) return $objArr[$class];
    if (!empty($file)) require_once($file);

    $nsArr = array(
        "", //global
        "\\app\\{$app}\\model",
        "\\app\\{$app}\\util",
        "\\framework\\ext",
        "\\framework\\base",
    );

    foreach ($nsArr as $ns) {
        $nsClass = $ns . '\\' . $class;

        if (class_exists($nsClass)) {
            if (empty($args)) {
                $objArr[$class] = new $nsClass();
            } else {
                $objArr[$class] = call_user_func_array(array(new \ReflectionClass($nsClass), 'newInstance'), $args);
            }
        }
    }
    if (!isset($objArr[$class])) throw new \Exception("Class '{$class}' not found'", 500);

    return $objArr[$class];
}

/**
 * 获取request请求方法
 */
function request($str, $default = null, $function = null) {
    $str = trim($str);
    list($method, $name) = explode('.', $str, 2);
    $method = strtoupper($method);
    switch ($method) {
        case 'POST':
            $type = $_POST;
            break;
        case 'SESSION':
            $type = $_SESSION;
            break;
        case 'REQUEST':
            $type = $_REQUEST;
            break;
        case 'COOKIE':
            $type = $_COOKIE;
            break;
        case 'GET':
        default:
            $type = $_GET;
            break;
    }
    if (empty($name)) {
        $request = filter_string($type);
    } else {
        if ($method == 'GET') {
            $request = urldecode($type[$name]);
        } else {
            $request = $type[$name];
        }
        $request = filter_string($request);
        //设置默认值
        if (!is_null($default) && empty($request)) {
            $request = $default;
        }
        //设置处理函数
        if ($function) {
            $request = call_user_func($function, $request);
        }
    }
    return $request;
}

/**
 * 过滤数据
 * @param  array $data 过滤数据
 * @return mixed
 */
function filter_string($data) {
    if ($data === NULL) {
        return false;
    }
    if (is_array($data)) {
        foreach ($data as $k => $v) {
            $data[$k] = filter_string($v);
        }
        return $data;
    } else {
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
}

/**
 * 数据签名认证
 * @param  array $data 被认证的数据
 * @return string       签名
 */
function data_auth_sign($data) {
    //数据类型检测
    if (!is_array($data)) {
        $data = (array)$data;
    }
    ksort($data); //排序
    $code = http_build_query($data); //url编码并生成query字符串
    $sign = sha1($code); //生成签名
    return $sign;
}

/**
 * 读取模块配置
 * @param string $file 调用文件
 * @return array
 */
function load_config($file) {
    $file = get_config_file($file);
    return require $file;
}

/**
 * 读取当前模块配置
 * @return array
 */

function current_config() {
    return load_config('config');
}

/**
 * 保存模块配置
 * @param string $file 调用文件
 * @return array
 */
function save_config($file, $config) {
    if (empty($config) || !is_array($config)) {
        return array();
    }
    $file = get_config_file($file);
    //读取配置内容
    $conf = file_get_contents($file);
    //替换配置项
    foreach ($config as $key => $value) {
        if (is_string($value) && !in_array($value, array('true', 'false'))) {
            if (!is_numeric($value)) {
                $value = "'" . $value . "'"; //如果是字符串，加上单引号
            }
        }
        $conf = preg_replace("/'" . $key . "'\s*=\>\s*(.*?),/iU", "'" . $key . "'=>" . $value . ",", $conf);
    }
    //写入应用配置文件
    if (!IS_WRITE) {
        return false;
    } else {
        if (file_put_contents($file, $conf)) {
            return true;
        } else {
            return false;
        }
        return '';
    }
}

/**
 * 字符串转方法数组
 * @param string $str
 * @return array
 */
function get_method_array($str = '') {
    $strArray = array();
    if (!empty($str)) {
        $strArray = explode('/', $str, 3);
    }
    $strCount = count($strArray);
    switch ($strCount) {
        case 1:
            $app = APP_NAME;
            $controller = CONTROLLER_NAME;
            $action = $strArray[0];
            break;
        case 2:
            $app = APP_NAME;
            $controller = $strArray[0];
            $action = $strArray[1];
            break;
        case 3:
            $app = $strArray[0];
            $controller = $strArray[1];
            $action = $strArray[2];
            break;
        default:
            $app = APP_NAME;
            $controller = CONTROLLER_NAME;
            $action = ACTION_NAME;
            break;
    }
    return array(
        'app' => strtolower($app),
        'controller' => $controller,
        'action' => $action,
    );
}

/**
 * 解析配置文件路径
 * @param string $file 文件路径或简写路径
 * @return dir
 */
function get_config_file($file) {
    $name = $file;
    if (!is_file($file)) {
        $str = explode('/', $file);
        $strCount = count($str);
        switch ($strCount) {
            case 1:
                $app = APP_NAME;
                $name = $str[0];
                break;
            case 2:
                $app = $str[0];
                $name = $str[1];
                break;
        }
        $app = strtolower($app);
        if (empty($app) && empty($file)) {
            throw new \Exception("Config '{$file}' not found'", 500);
        }
        $file = APP_PATH . "{$app}/conf/{$name}.php";
        if (!file_exists($file)) {
            throw new \Exception("Config '{$file}' not found", 500);
        }
    }
    return $file;
}

/**
 * 通用模块调用函数
 * @param string $str 调用路径
 * @param string $layer 调用层 默认model
 * @return mixed obj
 * @throws Exception
 */
function target($str, $layer = 'model') {
    static $_target = array();
    $str = explode('/', $str);
    $strCount = count($str);
    switch ($strCount) {
        case 1:
            $app = APP_NAME;
            $module = $str[0];
            break;
        case 2:
            $app = $str[0];
            $module = $str[1];
            break;
    }
    $app = strtolower($app);
    $name = $app . '/' . $layer . '/' . $module;
    if (isset($_target[$name])) {
        return $_target[$name];
    }
    $class = "\\app\\{$app}\\{$layer}\\{$module}" . ucfirst($layer);
    if (!class_exists($class)) {
        throw new \Exception("Class '{$class}' not found'", 500);
    }
    $target = new $class();
    $_target[$name] = $target;
    return $target;
}

/**
 * 默认数据
 * @param string $data
 * @param string $var
 * @return  string
 */
function default_data($data, $var) {
    //if(empty($data)){
    if ($data == '') {
        return $var;
    } else {
        return $data;
    }
}

/**
 * 自适应URL规则
 * @param string $str URL路径
 * @param array $params 自动解析参数
 * @param array $mustParams 必要参数
 * @return url
 */
function match_url($str, $params = array(), $mustParams = array()) {
    //itdump($params);
    $newParams = array();
    $keyArray = array_keys($params);
    if (config('REWRITE_ON')) {
        //获取规则文件
        $config = config('REWRITE_RULE');
        $configArray = array_flip($config);
        $route = $configArray[$str];
        if ($route) {
            preg_match_all('/<(\w+)>/', $route, $matches);
            foreach ($matches[1] as $value) {
                if ($params[$value]) {
                    $newParams[$value] = $params[$value];
                }
            }
        } else {
            if (!empty($keyArray)) {
                //$newParams[$keyArray[0]] = current($params);
                $newParams = $params;
            }
        }
    } else {
        if (!empty($keyArray)) {
            //edit by jlp
            //$newParams[$keyArray[0]] = current($params);
            /*
            foreach($keyArray as $kv){
                $newParams[$kv] = $params[$kv];
            }
            */
            $newParams = $params;
        }
    }
    $newParams = array_merge((array)$newParams, (array)$mustParams);
    $newParams = array_filter($newParams);
    return url($str, $newParams);
}


/**
 * 语言函数
 * @param string $key
 * @param string $pack
 * @return string
 */
function L($key = '', $pack = '') {
    $langModel = new \framework\ext\Lang();
    return $langModel->get($key, $pack);
}