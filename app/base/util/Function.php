<?php
//各种机器价格单件价格系数计算
//cate 1=模板机，2=迈卡自动机， 3=裁床，4=铺布机，5=杰克新研发的自动机（如包衬机）
function jack_cost($cate = '1', $param = []) {
    $fee = 0;

    switch ($cate) {
        case '1': //模板机
            //每分钟针数
            //传入数据是：针，秒
            $speed = $param['stitchnum'] / $param['time'] * 60;
            if ($speed <= 500) {
                $price = 1.2;
            } elseif ($speed > 1000) {
                $price = 0.8;
            } else {
                $price = 1;
            }
            $fee = $price * $param['number'];
            break;

        case '2': //迈卡自动机
            $fee = $param['number'];
            break;

        case '3': //裁床
            //每秒钟米数
            //传入数据是：米，分钟
            $speed = $param['number'] / $param['time'] / 60;
            if ($speed <= 1) {
                $price = 1.2;
            } elseif ($speed > 2) {
                $price = 0.8;
            } else {
                $price = 1;
            }
            $fee = $price * $param['number'];
            break;

        case '4': //铺布机
            //每秒钟米数
            //传入数据是：毫米，秒
            //价格参数规则：<=0.05米/秒=1.2，大于0.1米/秒=0.8，中间的=1
            $speed = $param['number'] / 1000 / $param['time'];
            if ($speed <= 0.05) {
                $price = 1.2;
            } elseif ($speed > 0.1) {
                $price = 0.8;
            } else {
                $price = 1;
            }
            $fee = $price * $param['number'] / 1000;
            break;

        default:
            $fee = $param['number'];
            break;
    }

    return $fee;
}

//各设备的计件信息，数量多少，用时多少，是否带单位
function jack_piece($value = 0, $cate = 1, $type = 'number', $unit = true) {
    $result = 0;
    switch ($cate) {
        case '1'://模板机
            if ($type == 'number') {
                $result = number_format($value);
                $result .= $unit ? '件' : '';
            }
            if ($type == 'time') {
                $result = $value;
                $result .= $unit ? '秒' : '';
            }
            break;
        case '2'://迈卡自动机
            if ($type == 'number') {
                $result = number_format($value);
                $result .= $unit ? '个' : '';
            }
            if ($type == 'time') {
                $result = $value;
                $result .= $unit ? '秒' : '';
            }
            break;
        case '3'://裁床
            if ($type == 'number') {
                $result = number_format($value, 2);
                $result .= $unit ? '米' : '';
            }
            if ($type == 'time') {
                $result = number_format(($value * 60));
                $result .= $unit ? '秒' : '';
            }
            break;
        case '4'://铺布机
            if ($type == 'number') {
                $result = number_format(($value / 1000), 2);
                $result .= $unit ? '米' : '';
            }
            if ($type == 'time') {
                $result = $value;
                $result .= $unit ? '秒' : '';
            }
            break;
        default:
            if ($type == 'number') {
                $result = number_format($value);
                $result .= $unit ? '件' : '';
            }
            if ($type == 'time') {
                $result = $value;
                $result .= $unit ? '秒' : '';
            }
            break;
    }
    return $result;
}

//设备的速度信息，用于判断价格档
function jack_speed($number, $time, $cate, $unit = true) {
    $result = 0;
    if ($time > 0) {
        switch ($cate) {
            case '1'://模板机
                $value = $number / $time * 60;
                $result = number_format($value);
                $result .= $unit ? '针/秒' : '';
                break;
            case '2'://迈卡自动机
                $value = $number / $time;
                $result = number_format($value);
                $result .= $unit ? '件/秒' : '';
                break;
            case '3'://裁床
                $value = $number / $time / 60;
                $result = number_format($value, 4);
                $result .= $unit ? '米/秒' : '';
                break;
            case '4'://铺布机
                $value = $number / $time / 1000;
                $result = number_format($value, 4);
                $result .= $unit ? '米/秒' : '';
                break;
            default:
                break;
        }
    }

    return $result;
}

//设备的速度信息，用于判断价格档
function jack_speed2($cate, $param = [], $unit = true) {
    $result = 0;
    if ($param['time'] > 0) {
        switch ($cate) {
            case '1'://模板机
                $value = $param['stitchnum'] / $param['time'] * 60;
                $result = number_format($value);
                $result .= $unit ? '针/分' : '';
                break;
            case '2'://迈卡自动机
                $value = $param['number'] / $param['time'];
                $result = number_format($value);
                $result .= $unit ? '件/秒' : '';
                break;
            case '3'://裁床
                $value = $param['number'] / $param['time'] / 60;
                $result = number_format($value, 4);
                $result .= $unit ? '米/秒' : '';
                break;
            case '4'://铺布机
                $value = $param['number'] / $param['time'] / 1000;
                $result = number_format($value, 4);
                $result .= $unit ? '米/秒' : '';
                break;
            default:
                break;
        }
    }

    return $result;
}

//数字转字母，用于excel的列标
//0=A，1=B
function IntToChr($index, $start = 65) {
    $str = '';
    if (floor($index / 26) > 0) {
        $str .= IntToChr(floor($index / 26) - 1);
    }
    return $str . chr($index % 26 + $start);
}

//获取汉字的首字母并转化为大写
//'张三' =>Z
function getFirstChar($str) {
    if (empty($str)) {
        return '';
    }

    $fChar = ord($str{0});

    if ($fChar >= ord('A') && $fChar <= ord('z')) {
        return strtoupper($str{0});
    }

    $s1 = iconv('UTF-8', 'gb2312', $str);

    $s2 = iconv('gb2312', 'UTF-8', $s1);

    $s = $s2 == $str ? $s1 : $str;

    $asc = ord($s{0}) * 256 + ord($s{1}) - 65536;

    if ($asc >= -20319 && $asc <= -20284)
        return 'A';

    if ($asc >= -20283 && $asc <= -19776)
        return 'B';

    if ($asc >= -19775 && $asc <= -19219)
        return 'C';

    if ($asc >= -19218 && $asc <= -18711)
        return 'D';

    if ($asc >= -18710 && $asc <= -18527)
        return 'E';

    if ($asc >= -18526 && $asc <= -18240)
        return 'F';

    if ($asc >= -18239 && $asc <= -17923)
        return 'G';

    if ($asc >= -17922 && $asc <= -17418)
        return 'H';

    if ($asc >= -17417 && $asc <= -16475)
        return 'J';

    if ($asc >= -16474 && $asc <= -16213)
        return 'K';

    if ($asc >= -16212 && $asc <= -15641)
        return 'L';

    if ($asc >= -15640 && $asc <= -15166)
        return 'M';

    if ($asc >= -15165 && $asc <= -14923)
        return 'N';

    if ($asc >= -14922 && $asc <= -14915)
        return 'O';

    if ($asc >= -14914 && $asc <= -14631)
        return 'P';

    if ($asc >= -14630 && $asc <= -14150)
        return 'Q';

    if ($asc >= -14149 && $asc <= -14091)
        return 'R';

    if ($asc >= -14090 && $asc <= -13319)
        return 'S';

    if ($asc >= -13318 && $asc <= -12839)
        return 'T';

    if ($asc >= -12838 && $asc <= -12557)
        return 'W';

    if ($asc >= -12556 && $asc <= -11848)
        return 'X';

    if ($asc >= -11847 && $asc <= -11056)
        return 'Y';

    if ($asc >= -11055 && $asc <= -10247)
        return 'Z';

    return '#';

}


/**
 * 获取所有模块Service
 * @param string $name 指定service名
 * @param string $method
 * @param array $vars
 * @return array
 */
function get_all_service($name, $method, $vars = array()) {

    if (empty($name)) return null;
    $apiPath = APP_PATH . '*/service/' . $name . 'Service.php';
    $apiList = glob($apiPath);
    if (empty($apiList)) {
        return;
    }
    $appPathStr = strlen(APP_PATH);
    $method = 'get' . $method . $name;
    $data = array();
    foreach ($apiList as $value) {
        $path = substr($value, $appPathStr, -4);
        $path = str_replace('\\', '/', $path);
        $appName = explode('/', $path);
        $appName = $appName[0];
        $config = load_config($appName . '/config');
        if (!$config['APP_SYSTEM'] && (!$config['APP_STATE'] || !$config['APP_INSTALL'])) {
            continue;
        }
        $class = target($appName . '/' . $name, 'service');
        if (method_exists($class, $method)) {
            $data[$appName] = $class->$method($vars);
        }
    }
    return $data;
}

/**
 * 获取指定模块Service
 * @param string $appName 指定service名
 * @param string $name
 * @param string $method
 * @param array $vars
 * @return object Service
 */
function service($appName, $name, $method, $vars = array()) {
    /*
    $config = load_config($appName .'/config');
    if(!$config['APP_SYSTEM'] &&( !$config['APP_STATE'] || !$config['APP_INSTALL'])){
        return;
    }
    */
    $class = target($appName . '/' . $name, 'service');
    if (method_exists($class, $method)) {
        return $class->$method($vars);
    }
}

/**
 * 二维数组排序
 * @param array $array 排序的数组
 * @param string $key 排序主键
 * @param string $type 排序类型 asc|desc
 * @param bool $reset 是否返回原始主键
 * @return array
 */
function array_order($array, $key, $type = 'asc', $reset = false) {
    if (empty($array) || !is_array($array)) {
        return $array;
    }
    foreach ($array as $k => $v) {
        $keysValue[$k] = $v[$key];
    }
    if ($type == 'asc') {
        asort($keysValue);
    } else {
        arsort($keysValue);
    }
    $i = 0;
    $newArray = [];
    foreach ($keysValue as $k => $v) {
        $i++;
        if ($reset) {
            $newArray[$k] = $array[$k];
        } else {
            $newArray[$i] = $array[$k];
        }
    }
    return $newArray;
}

/**
 * session获取
 * @param string $name
 * @param string $value
 * @return  mixed
 */
function session($name = '', $value = '') {
    if (empty($name)) {
        return $_SESSION;
    }
    $sessionId = request('request.session_id');
    if (!empty($sessionId)) {
        session_id($sessionId);
    }
    if (!isset($_SESSION)) {
        session_start();
    }
    $session = null;
    $pre = config('COOKIE_PREFIX');
    if ($value === '') {
        if ('[destroy]' == $name) { // 销毁session
            $_SESSION = [];
            session_unset();
            session_destroy();
        } else {
            //获取session
            if (strpos($name, '.')) {
                list($name1, $name2) = explode('.', $name, 2);
                return isset($_SESSION[$pre . $name1][$name2]) ? $_SESSION[$pre . $name1][$name2] : null;
            } else {
                return isset($_SESSION[$pre . $name]) ? $_SESSION[$pre . $name] : null;
            }
        }

    } else {
        $session = $_SESSION[$pre . $name] = $value;
    }
    return $session;
}

/**
 * cookie获取
 * @param string $name
 * @param string $value
 * @param int $time 小时时间
 * @return  string
 */
function cookie($name = '', $value = '', $time = 1) {
    if (empty($name)) {
        return $_COOKIE;
    }
    $pre = config('COOKIE_PREFIX');
    if ($value === '') {
        $cookie = $_COOKIE[$pre . $name];
    } else {
        $cookie = setcookie($pre . $name, $value, time() + 3600 * $time, '/');
    }
    return $cookie;
}

/**
 * 获取文件或文件大小
 * @param string $directory 路径
 * @return int
 */
function dir_size($directory) {
    $dir_size = 0;
    if ($dir_handle = @opendir($directory)) {
        while ($filename = readdir($dir_handle)) {
            $subFile = $directory . DIRECTORY_SEPARATOR . $filename;
            if ($filename == '.' || $filename == '..') {
                continue;
            } elseif (is_dir($subFile)) {
                $dir_size += dir_size($subFile);
            } elseif (is_file($subFile)) {
                $dir_size += filesize($subFile);
            }
        }
        closedir($dir_handle);
    }
    return ($dir_size);
}

/**
 * 格式化文件大小显示
 *
 * @param int $size
 * @return string
 */
function format_size($size) {
    $prec = 3;
    $size = round(abs($size));
    $units = array(
        0 => " B ",
        1 => " KB",
        2 => " MB",
        3 => " GB",
        4 => " TB"
    );
    if ($size == 0)
        return str_repeat(" ", $prec) . "0$units[0]";
    $unit = min(4, floor(log($size) / log(2) / 10));
    $size = $size * pow(2, -10 * $unit);
    $digi = $prec - 1 - floor(log($size) / log(10));
    $size = round($size * pow(10, $digi)) * pow(10, -$digi);
    return $size . $units[$unit];
}

/**
 * 显示文件大小
 * @param $bytes
 * @return string
 */
function format_bytes($bytes) {
    if ($bytes >= 1073741824) {
        $bytes = round($bytes / 1073741824 * 100) / 100 . 'GB';
    } elseif ($bytes >= 1048576) {
        $bytes = round($bytes / 1048576 * 100) / 100 . 'MB';
    } elseif ($bytes >= 1024) {
        $bytes = round($bytes / 1024 * 100) / 100 . 'KB';
    } else {
        $bytes = $bytes . 'Bytes';
    }
    return $bytes;
}

function format_price($str) {
    if (empty($str)) {
        return 0.00;
    }
    return @number_format($str, 2, ".", "");
}

//人性化显示使用的时间
function format_time($time) {
    if ($time < 60) {
        $str = $time . '秒';
    } elseif ($time < 60 * 60) {
        $minute = intval($time / 60);
        $second = $time % 60;
        $str = $minute . '分' . $second . '秒';
    } elseif ($time < 60 * 60 * 24) {
        $hour = intval($time / (60 * 60));
        $hour_re = $time % (60 * 60);
        $minute = intval($hour_re / 60);
        $str = $hour . '小时' . $minute . '分';
    } else {
        $day = intval($time / (60 * 60 * 24));
        $day_re = intval($time / (60 * 60 * 24));
        $hour = intval($day_re / (60 * 60));
        $str = $day . '天' . $hour . '小时';
    }
    return $str;
}

/**
 * html代码输入
 */
function html_in($str) {
    $str = htmlspecialchars($str);
    if (!get_magic_quotes_gpc()) {
        $str = addslashes($str);
    }
    return $str;
}

/**
 * html代码输出
 */
function html_out($str) {
    if (function_exists('htmlspecialchars_decode')) {
        $str = htmlspecialchars_decode($str);
    } else {
        $str = html_entity_decode($str);
    }
    $str = stripslashes($str);
    //$str = nl2br($str);
    return $str;
}

/**
 * 字符串截取
 */
function len($str, $len = 0) {
    if (!empty($len)) {
        return \framework\ext\Util::msubstr($str, 0, $len);
    } else {
        return $str;
    }
}

/**
 * 生成唯一数字
 */
function unique_number() {
    return date('Ymd') . substr(implode(NULL, array_map('ord', str_split(substr(uniqid(), 7, 13), 1))), 0, 8);
}

/**
 * 产生随机字符串
 *
 * @param    int $length 输出长度
 * @param    string $chars 可选的 ，默认为 0123456789
 * @return   string     字符串
 */
function random($length, $chars = '0123456789') {
    $hash = '';
    $max = strlen($chars) - 1;
    for ($i = 0; $i < $length; $i++) {
        $hash .= $chars[mt_rand(0, $max)];
    }
    return $hash;
}

//生成随机字符串
function random_str($len = 10) {
    //字符集
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&';
    $str = "";
    for ($i = 0; $i < $len; $i++) {
        $str .= $chars[mt_rand(0, strlen($chars) - 1)];
    }
    return $str;
}

/**
 * 读取/dev/urandom获取随机数
 * @param $len
 * @return mixed|string
 */
function randomFromDev($len = 16) {
    $fp = @fopen('/dev/urandom', 'rb');
    $result = '';
    if ($fp !== FALSE) {
        $result .= @fread($fp, $len);
        @fclose($fp);
    } else {
        trigger_error('Can not open /dev/urandom.');
    }
    // convert from binary to string
    $result = base64_encode($result);
    // remove none url chars
    $result = strtr($result, '+/', '-_');

    return substr($result, 0, $len);
}

/**
 * 获取客户端IP
 */
function get_client_ip() {
    return \framework\ext\Util::getIp();
}

/*
 * 输出id地址信息
 */
function get_client_ip_addr() {
    $ip = \framework\ext\Util::getIp();
    return ip_addr($ip);
}

/*
 * ip地址信息
 */
function ip_addr($ip) {
    if (!empty($ip)) {
        $bs = new \framework\ext\ip\IP();
        $addr = $bs->find($ip);
        $res = $addr[0] . ' ' . $addr[1] . ' ' . $addr[2] . ' ' . $addr[3];
    } else {
        $res = '';
    }
    return $res;
}

/**
 * 输出变量的内容，通常用于调试
 * @param mixed $vars 要输出的变量
 * @param string $label
 * @param boolean $return
 * @return null
 */
function dump($vars, $label = '', $return = false) {
    if (ini_get('html_errors')) {
        $content = "<pre>\n";
        if ($label != '') {
            $content .= "<strong>{$label} :</strong>\n";
        }
        $content .= htmlspecialchars(print_r($vars, true));
        $content .= "\n</pre>\n";
    } else {
        $content = $label . " :\n" . print_r($vars, true);
    }
    if ($return) {
        return $content;
    }
    echo $content;
    return null;
}

function itdump($vars, $userId = 1) {
    if (session('admin_user.user_id') == $userId || session('user.user_id') == $userId) {
        dump($vars);
    }
}

/**
 * 创建像这样的查询: "IN('a','b')";
 *
 * @param    mix $item_list 列表数组或字符串
 * @param    string $field_name 字段名称
 * @author   Xuan Yan
 *
 * @return   string
 */
function db_create_in($item_list, $field_name = '') {
    if (empty($item_list)) {
        return $field_name . " IN ('') ";
    } else {
        if (!is_array($item_list)) {
            $item_list = explode(',', $item_list);
        }
        $item_list = array_unique($item_list);
        $item_list_tmp = '';
        foreach ($item_list AS $item) {
            if ($item !== '') {
                $item_list_tmp .= $item_list_tmp ? ",'$item'" : "'$item'";
            }
        }
        if (empty($item_list_tmp)) {
            return $field_name . " IN ('') ";
        } else {
            return $field_name . ' IN (' . $item_list_tmp . ') ';
        }
    }
}

//图片裁剪
function cut_image($img, $width, $height, $type = 3) {
    if (empty($width) && empty($height)) {
        return $img;
    }
    $imgDir = realpath(WWW_PATH . $img);
    if (!is_file($imgDir)) {
        return $img;
    }
    $imgInfo = pathinfo($img);
    $newImg = $imgInfo['dirname'] . '/cut_' . $width . '_' . $height . '_' . $imgInfo["basename"];
    $newImgDir = WWW_PATH . $newImg;
    if (!is_file($newImgDir)) {
        $image = new \framework\ext\image\Image();
        $image->open($imgDir);
        $image->thumb($width, $height, $type)->save($newImgDir);
    }
    return $newImg;
}

/**
 * 相册图片输出
 * @param string $url 图片地址
 * @param string $width 宽度，在原始图的基础上，输出_100x100.jpg这种类型的图
 * @param bool $with_domain 是否带域名
 * @return string
 */
function thumb_url($url, $width = '', $with_domain = false) {
    if ($url == '') {
        $return = $with_domain ? config('FILE_URL') . '/public/images/nopic300.png' : '/public/images/nopic300.png';
        return $return;
    }

    if ($with_domain) {
        //输入的本身带static_domain的先去除
        $url = str_replace(config('FILE_URL'), '', $url);
        $return = config('FILE_URL') . $url;
    } else {
        //有static_domain的也去掉
        $return = str_replace(config('FILE_URL'), '', $url);
    }

    if ($width <> '') {
        $pos = strrpos($return, '.');
        $path = strtolower(substr($return, 0, $pos));
        $ext = substr($return, $pos);
        $return = $path . '_' . $width . 'x' . $width . $ext;
    }
    return $return;
}

/**
 * 关键字高亮
 * @param string $str
 * @param string $keywords
 * @return string
 */
function high_light($str, $keywords) {
    if (!is_array($keywords)) {
        $keywords = explode(" ", $keywords);
    }
    $pattern = [];
    foreach ($keywords as $key => $value) {
        if ($value <> '') {
            $p = array("/\./si", "/\//si", "/\{/si", "/\}/si", "/\?/si", "/\[/si", "/\]/si", "/\|/si", "/\(/si", "/\)/si");
            $r = array("\.", "\/", "\{", "\}", "\?", "\[", "\]", "\|", "\(", "\)");
            $pattern[] = preg_replace($p, $r, addslashes($value));
        }
    }
    if (is_array($pattern) && !empty($pattern)) {
        $str = preg_replace("/(" . implode("|", $pattern) . ")/si", "<font color='red'>$1</font>", $str);
    }
    return $str;
}


/**
 * @param $file
 * @param $down_name
 */
function download($file, $down_name) {
    //获取文件后缀
    $suffix = substr($file, strrpos($file, '.'));
    //新文件名，就是下载后的名字
    $down_name = $down_name . $suffix;

    //文件绝对地址
    $file = WWW_PATH . $file;

    //判断给定的文件存在与否
    if (!file_exists($file)) {
        die("您要下载的文件已不存在，可能是被删除");
    }
    $fp = fopen($file, "r");
    $file_size = filesize($file);
    //下载文件需要用到的头
    header("Content-type: application/octet-stream");
    header("Accept-Ranges: bytes");
    header("Accept-Length:" . $file_size);
    header("Content-Disposition: attachment; filename=" . $down_name);
    $buffer = 1024;
    $file_count = 0;
    //向浏览器返回数据
    while (!feof($fp) && $file_count < $file_size) {
        $file_con = fread($fp, $buffer);
        $file_count += $buffer;
        echo $file_con;
    }
    fclose($fp);
}

/**
 * @return bool
 */
function is_weixin() {
    if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
        return true;
    }
    return false;
}

/*
 *	日志记录
 *	2014-12-24 00:07:13
 */
function logit($txt) {
    $myfile = fopen(TMP_PATH . 'log/log_' . date('Ymd_H') . '.txt', "a+") or die("Unable to open file!");
    ini_set('date.timezone', 'Asia/Shanghai');
    $txt = date('Y-m-d H:i:s', time()) . "\t" . $txt . "\r\n";
    fwrite($myfile, $txt);
    fclose($myfile);
}


/*
 * 判断是不是超管
 */
function is_root() {
    if (APP == 'MAIN') {
        return session('admin_user.is_root');
    } else {
        return session('user.is_root');
    }
}

/*
 * 判断是不是部门经理
 */
function director($allow_dept) {
    //超管每个都可以
    if (is_root()) {
        return true;
    }

    //没有设置部门，都不允许
    if ($allow_dept == '') {
        return false;
    }
    $dept_id = session('admin_user.dept_id');
    $director = session('admin_user.director');
    //判断部门权限
    $allow_dept = is_array($allow_dept) ? $allow_dept : explode(',', $allow_dept);
    return in_array($dept_id, $allow_dept) && $director;
}

/**
 * @param string $allow_dept 1,2,3这样的格式，也可以是array('1','2')这样的格式
 * @param string $allow_user 也可以额外增加某个人
 * @param bool $root 用户是否有这个权限
 * @return bool
 */
function erp_auth($allow_dept = '', $allow_user = '', $root = true) {
    //当前用户的部门id
    $dept_id = session('admin_user.dept_id');
    $user_id = session('admin_user.user_id');

    //超管每个都可以
    if (is_root() && $root) {
        return true;
    }
    //判断用户权限
    if (!empty($allow_user)) {
        $allow_user = is_array($allow_user) ? $allow_user : explode(',', $allow_user);
        if (in_array($user_id, $allow_user)) {
            return true;
        }
    }

    //没有设置部门，都不允许
    if ($allow_dept == '') {
        return false;
    }
    //判断部门权限
    $allow_dept = is_array($allow_dept) ? $allow_dept : explode(',', $allow_dept);
    return in_array($dept_id, $allow_dept);
}

/*
 * 新erp内部id编码
 */
function erp_no($id, $type = '') {
    if (empty($id)) {
        return $id;
    }
    $type = strtoupper($type);
    $id = $type . str_pad($id, 5, '0', STR_PAD_LEFT);
    return $id;
}

/*
 * 判断用户每个路径的权限
 */
function auth($route = null, $user = []) {
    //超管
    $isRoot = empty($user) ? session('admin_user.is_root') : $user['is_root'];
    $userId = empty($user) ? session('admin_user.user_id') : $user['user_id'];
    $deptId = empty($user) ? session('admin_user.dept_id') : $user['dept_id'];

    //$cache = new \framework\base\Cache('files');
    //$deptPurview = $cache->get('deptPurview_' . $deptId);
    //缓存目录修改
    $purviewFile = TMP_PATH . 'dept/deptPurview_' . $deptId . '.php';
    $content = @file_get_contents($purviewFile);
    $deptPurview = @unserialize(substr($content, 13));

    if ($isRoot || $userId == 1) {
        return true;
    }

    //
    $app = APP_NAME;
    $controller = CONTROLLER_NAME;
    $action = ACTION_NAME;
    if ($route) {
        $route = explode('/', $route, 3);
        $routeNum = count($route);
        switch ($routeNum) {
            case 1:
                $action = $route[0];
                break;
            case 2:
                $controller = $route[0];
                $action = $route[1];
                break;
            case 3:
                $app = $route[0];
                $controller = $route[1];
                $action = $route[2];
                break;
        }
    }

    //用户拥有的权限
    $basePurview = $deptPurview['base_purview'];

    //权限表
    $purviewInfo = service(APP_NAME, 'Purview', 'getMainPurview');
    if (empty($purviewInfo)) {
        return true;
    }

    //不在权限表controller的都可以方便
    $controller = $purviewInfo[strtolower($controller)];
    if (empty($controller['auth'])) {
        return true;
    }
    //不在权限表action的都可以方便
    $action = $controller['auth'][strtolower($action)];
    if (empty($action)) {
        return true;
    }
    $current = strtolower($app . '_' . $controller);
    if (!in_array($current, (array)$basePurview)) {
        //$this->error('您没有权限访问此功能1！');
        return false;
    }
    $current = strtolower($app . '_' . $controller . '_' . $action);
    if (!in_array($current, (array)$basePurview)) {
        //$this->error('您没有权限访问此功能2！');
        return false;
    }
    return true;
}


/**
 * 替换fckedit中的图片 添加域名
 * @param  string $content 要替换的内容
 * @param  string $strUrl 内容中图片要加的域名
 * @return string
 * @eg
 */
function replacePicUrl($content = null, $strUrl = null) {
    if ($strUrl) {
        //提取图片路径的src的正则表达式 并把结果存入$matches中
        preg_match_all("/<img(.*)src=\"([^\"]+)\"[^>]+>/isU", $content, $matches);
        $img = "";
        if (!empty($matches)) {
            //注意，上面的正则表达式说明src的值是放在数组的第三个中
            $img = $matches[2];
        } else {
            $img = "";
        }
        if (!empty($img)) {
            $patterns = array();
            $replacements = array();
            foreach ($img as $imgItem) {
                $final_imgUrl = $strUrl . $imgItem;
                $replacements[] = $final_imgUrl;
                $img_new = "/" . preg_replace("/\//i", "\/", $imgItem) . "/";
                $patterns[] = $img_new;
            }

            //让数组按照key来排序
            ksort($patterns);
            ksort($replacements);

            //替换内容
            $vote_content = preg_replace($patterns, $replacements, $content);

            return $vote_content;
        } else {
            return $content;
        }
    } else {
        return $content;
    }
}

/*
 *	发送验证短信
 */
function send_sms_code($mobile, $code = '') {
    if (empty($code)) {
        $code = random(6);
    }
    $value = urlencode("#code#=" . $code);
    $url = 'http://v.juhe.cn/sms/send?mobile=' . $mobile . '&tpl_id=73861&tpl_value=' . $value . '&key=c31fef032516f162249f423a1f0d7b5f';
    $http = new \framework\ext\Http;
    $result = $http->doGet($url);
    $arr = json_decode($result, true);
    if (!$arr['error_code']) {
        return $code;
    } else {
        return false;
    }
}

/*
 * 获取微信token
 * @param $key string crop_msg|crom_address|gzh，分布对应企业应用，企业号地址修改，公众号
 */
function get_wechat_token($key) {
    //获取配置文件
    $config = load_config(CONFIG_PATH . 'wechat.php');
    switch ($key) {
        case 'corp_msg':
            $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=" . $config['qiye']['CorpID'] . "&corpsecret=" . $config['qiye']['apps']['1000002']['Secret'];
            break;
        case 'corp_kefu':
            $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=" . $config['qiye']['CorpID'] . "&corpsecret=" . $config['qiye']['apps']['1000005']['Secret'];
            break;
        case 'corp_address':
            $url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=" . $config['qiye']['CorpID'] . "&corpsecret=" . $config['qiye']['TxlSecret'];
            break;
        case 'xcx':
            $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" . $config['xcx']['AppID'] . "&secret=" . $config['xcx']['AppSecret'];
            break;
        case 'gzh':
            $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" . $config['gzh']['app_id'] . "&secret=" . $config['gzh']['secret'];
            break;
    }
    $key = 'wechat_' . $key . '_token';

    $cache = new \framework\base\Cache('files');
    $token = $cache->get($key);
    if (time() > ($token['token_time'] + $token['expires_in'])) {
        //获取token
        $token_res = json_decode(file_get_contents($url), true);
        $res = array(
            'access_token' => $token_res['access_token'],
            'token_time' => time(),
            'expires_in' => $token_res['expires_in']
        );
        $cache->set($key, $res, 7200);
        $ret = $token_res['access_token'];
    } else {
        $ret = $token['access_token'];
    }
    return $ret;
}

/*
 * 内部消息发送
 * to_obj发送对象0=全部人员，1=特定部门，2=特定人员，3=自定义组
 * 格式参考
 * $msg = array(
        'type' => 'news',  //消息类型，text文本，news新闻类
        'to_obj' => '2', //发送对象0所有人，1部门，2个人，3自定义组
        'to_id' => $userInfo['user_id'],  //具体的对象，若是部门就是部门的id（微信提醒回去读取微信的id）
        'title' => $title, //标题
        'content' => $content, //内容
        'url' => $url, //操作的地址，点击可以去执行操作
        'url_wx' => $url_wx,  //微信提醒用的url
        'act' => 'user_login' //记录日志用，区别消息类型
    );
 */
function send_msg($msg) {
    //需要发送标记
    $flag = true;
    //发送类型，目前支持text和news 2种格式
    $type = $msg['type'] == 'news' ? 'news' : 'text';
    //发送对象
    $to_obj = $msg['to_obj'] == '' ? '2' : $msg['to_obj'];

    //发给个人的信息，检查act，只发送1次
    if ($to_obj == '2' && $msg['act'] <> '' && $msg['act'] <> 'user_login') {
        //只收到一条消息
        $map['to_obj'] = default_data($msg['to_obj'], 2);
        $map['to_id'] = $msg['to_id'];
        $map['act'] = $msg['act'];
        $has_msg = target('main/Message')->countList($map);
        $flag = $has_msg > 0 ? false : true;
    }

    //发送给自定义组，重新计算to_id
    if ($to_obj == '3') {
        //读取自定义组信息
        $group = target('main/AdminGroup')->getInfo($msg['to_id']);
        if (!empty($group)) {
            //设置自定义组的发送对象
            $msg['to_id'] = $group['user_list'];
        } else {
            return false;
        }
    }

    //没有消息，发送一条
    if ($flag) {
        //载入微信配置
        $config = load_config(CONFIG_PATH . 'wechat.php');

        //内部消息发送
        if ($msg['act'] == 'user_login') {
            $status = true;
        } else {
            $msg_data = $msg;
            if ($msg_data['url'] <> '') {
                $msg_data['content'] .= '<br />您可以直接： <a href="' . $msg_data['url'] . '">点击这里</a> 完成操作';
            }
            $status = target('main/Message')->addData($msg_data);
        }

        //微信企业号提醒
        if ($status && $config['qiye']['WECHAT_CORP_STATUS']) {
            //企业应用id
            $agentid = 1000002;

            $access_token = get_wechat_token('corp_msg');
            //发送消息接口地址地址
            $send_url = "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=" . $access_token;

            //发给所有人
            if ($to_obj == '0') {
                //发送对象和具体值
                $to_type = 'toparty';
                $to_val = $config['qiye']['RootId'];

                //日志前缀信息
                $log_info = $msg['title'] . '##所有群发##';
            }

            //发给部门
            if ($to_obj == '1' && $msg['to_id'] <> '') {
                //读取用户信息
                $dept = target('main/AdminDept')->field('dept_id,dept_name,wechat_id')->getInfo($msg['to_id']);
                //发送对象和具体值
                $to_type = 'toparty';
                $to_val = $dept['wechat_id'];

                //日志前缀信息
                $log_info = $msg['title'] . '##部门消息##' . $dept['wechat_id'];
            }

            //发给个人
            if ($to_obj == '2' && $msg['to_id'] > 0) {
                //读取用户信息
                $user_where = array(
                    'A.user_id' => $msg['to_id'],
                    'A.status' => 1
                );
                $user = target('main/AdminUser')->field('user_id,dept_id,name,wechat_corp')->getWhereInfo($user_where);
                //发送对象和具体值
                $to_type = 'touser';
                $to_val = $user['wechat_corp'];

                //日志前缀信息
                $log_info = $msg['title'] . '##个人消息##' . $user['wechat_corp'];
            }

            //发自定义组
            if ($to_obj == '3' && $msg['to_id'] <> '') {
                //自定义组上面已经读取了
                //发送对象和具体值
                $to_type = 'totag';
                $to_val = $group['wechat_id'];

                //日志前缀信息
                $log_info = $msg['title'] . '##自定义组消息##' . $group['wechat_id'];
            }

            //处理发送
            if ($to_type <> '' && $to_val <> '') {
                //基础信息
                $wx_msg = array(
                    $to_type => $to_val,
                    'msgtype' => $type,
                    'agentid' => $agentid,
                    'safe' => 0
                );
                //判断类型
                if ($type == 'news') { //新闻消息，展示效果更好
                    $articles = array(
                        array(
                            'title' => $msg['title'],
                            'description' => $msg['content'],
                            'url' => $msg['url_wx'],
                            'picurl' => ''
                        )
                    );
                    $wx_msg['news'] = array('articles' => $articles);
                } else { //文字消息
                    //匹配旧版文字发送消息
                    $content = $msg['title'];
                    if ($msg['act'] <> '') {
                        $content .= '【' . date('Y-m-d H:i:s') . '】';
                    }
                    if ($msg['content'] <> '' && $to_obj == '0') {
                        $content .= "：" . strip_tags($msg['content']);
                    }

                    //内容
                    $wx_msg['text'] = array('content' => $content);
                }
                $wx_msg = json_encode($wx_msg, JSON_UNESCAPED_UNICODE);
                $wx_msg = str_replace("<br>", "\n", $wx_msg);

                //记录日志
                $log_msg = $log_info . '##' . $wx_msg . '##';

                //发送
                if (!empty($wx_msg)) {
                    //发送微信企业号通知
                    $http = new \framework\ext\Http();
                    $post_res = $http->doPost($send_url, $wx_msg);
                    //$post_res = post($send_url, $wx_msg);

                    //日志记录到数据库，便于查找错误
                    target('main/WechatLog')->addData($log_msg . $post_res);
                }
            }
        }//微信发送结束
    } else {
        $status = true;
    }
    return $status;
}

/**
 * 微信公众号模板消息
 * @param $msg
 * @return bool
 */
function mb_msg($msg) {
    if (empty($msg['to_user'])) {
        return false;
    }

    //发送给谁,看看是否绑定了微信
    $member = target('main/User')->field('name,wechat_openid')->getInfo($msg['to_user']);

    if (!empty($member['wechat_openid']) && config('WX_MB_MSG')) {
        //公众号的appid和appsecret
        $app_id = config('Wechat_AppId');
        $app_secret = config('Wechat_AppSecret');

        //读取缓存的wechat的token
        $weixin_file = ROOT_PATH . '/config/common/cfg_wechat_gzh_token.php';
        require($weixin_file);
        //查看token有效期
        if (time() > ($wechat_gzh['wx_token_time'] + $wechat_gzh['wx_expires_in'])) {
            //获取token
            $wx_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" . $app_id . "&secret=" . $app_secret;
            $wx_token_res = json_decode(file_get_contents($wx_url), true);
            $wx_access_token = $wx_token_res['access_token'];
            $wx_expires_in = $wx_token_res['expires_in'];
            //保存设置
            $conf = "<?php\n";
            $conf .= "//企业号token\n";
            $conf .= "\$wechat_gzh['wx_token'] = \"" . $wx_access_token . "\";\n";
            $conf .= "\$wechat_gzh['wx_token_time'] = " . time() . ";\n";
            $conf .= "\$wechat_gzh['wx_expires_in'] = " . $wx_expires_in . ";\n";
            file_put_contents($weixin_file, $conf);
        } else {
            $wx_access_token = $wechat_gzh['wx_token'];
        }

        //发送消息接口地址地址
        $send_url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" . $wx_access_token;

        //data
        $wx_msg = array(
            'touser' => $member['wechat_openid'],
            'template_id' => $msg['template_id'],
            'url' => $msg['url'],
            'data' => $msg['data']
        );
        $wx_msg = json_encode($wx_msg, JSON_UNESCAPED_UNICODE);
        $wx_msg = str_replace("<br>", "\n", $wx_msg);

        //记录日志
        $log_msg = '服务号进度通知##' . $wx_msg . '##';

        //发送
        if (!empty($wx_msg)) {
            //发送微信企业号通知
            $post_res = post($send_url, $wx_msg);
            //itdump($send_url);
            //itdump($wx_msg);
            //itdump($post_res);

            //日志记录到数据库，便于查找错误
            target('main/WechatLog')->addData($log_msg . $post_res, '服务号');
        }
        return true;
    } else {
        return false;
    }
}


////////微信接口需要用到的get和post函数/////////
function post($url, $jsonData) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

////////微信接口需要用到的get和post函数/////////


//添加一个csrf字段
function csrf_field() {
    return '<input type="hidden" name="_token" value="' . csrf_token() . '">';
}

//生成csrf的token
function csrf_token() {
    return session('_token', random_str());
}

//验证csrf
function VerifyCsrfToken($token = '') {
    if (empty($token)) {
        $token = request('request._token');
    }
    $sess_token = session('_token');

    return is_string($sess_token) && is_string($token) && hash_equals($sess_token, $token);
}