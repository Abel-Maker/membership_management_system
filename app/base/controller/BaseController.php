<?php

namespace app\base\controller;

use framework\base\Controller;
use framework\ext\MobileDetect;
use framework\ext\Lang;

class BaseController extends Controller {

    public $sys = array();

    public function __construct() {
        //定义常量
        define('WWW_PATH', ROOT_PATH . 'www' . DIRECTORY_SEPARATOR);
        define('NOW_TIME', $_SERVER['REQUEST_TIME']);
        //
        define('REQUEST_METHOD', $_SERVER['REQUEST_METHOD']);
        define('IS_GET', REQUEST_METHOD == 'GET' ? true : false);
        define('IS_POST', REQUEST_METHOD == 'POST' ? true : false);
        define('IS_AJAX', ((isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')) ? true : false);
        //上传目录
        define('UPLOAD_PATH', WWW_PATH . UPLOAD_DIR);
        //define('UPLOAD_NAME', 'upload');

        define('__PUBLIC__', substr(PUBLIC_URL, 0, -1));
        define('__ROOT__', substr(ROOT_URL, 0, -1));
        define('__SELF__', $_SERVER['PHP_SELF']);

        //引入扩展函数
        require_once(APP_PATH . 'base/util/Function.php');

        //引入当前模块配置
        $config = load_config('config');
        if (!empty($config)) {
            foreach ((array)$config as $key => $value) {
                config($key, $value);
            }
        }

        //基础设置
        $this->setCont();
    }

    /**
     * 设置站点基本信息
     */
    protected function setCont() {

        //判断是不是手机站
        $detect = new MobileDetect();
        //网站跳转
        if (!$detect->isMobile() && !$detect->isTablet()) {
            define('MOBILE', false);
        } else {
            define('MOBILE', true);
        }
    }

    //获取渲染html
    protected function show($tpl = '', $layout = 'common', $return = false) {
        //复制当前URL
        $this->assign('self', __SELF__);
        //解析模板路径
        $tplArray = get_method_array($tpl);
        $tpl = 'app/' . strtolower($tplArray['app']) . '/view/' . strtolower($tplArray['controller']) . '/' . strtolower($tplArray['action']);
        if ($layout == false || $layout == '') {
            if ($return) {
                $html = $this->display($tpl, $return);
                return $html;
            } else {
                $this->display($tpl);
            }
        } else {
            $this->layout = "app/" . strtolower($tplArray['app']) . "/view/" . $layout;
            $this->display($tpl);
        }
    }

    /**
     * 错误提示方法
     * @param $msg string
     * @param $url string
     */
    public function error($msg, $url = null) {
        if (IS_AJAX) {
            $array = array(
                'info' => $msg,
                'status' => false,
                'url' => $url,
            );
            $this->ajaxReturn($array);
        } else {
            $this->alert($msg, $url);
        }
    }

    /**
     * 成功提示方法
     * @param $msg string 提示内容
     * @param $url string 状态
     */
    public function success($msg, $url = null) {
        if (IS_AJAX) {
            $array = array(
                'info' => $msg,
                'status' => true,
                'url' => $url,
            );
            $this->ajaxReturn($array);
        } else {
            $this->alert($msg, $url);
        }
    }

    /**
     * AJAX返回
     * @param $data array 跳转地址
     * @return array
     */
    public function ajaxReturn($data) {
        header('Content-type:text/json');
        echo json_encode($data);
        exit;
    }

    /**
     * jsonp返回
     * @param string $data json数组
     */
    public function jsonpReturn($data) {
        header('Content-type:text/json');
        $callback = request('request.callback', 'jsonp' . time(), 'trim');
        echo $callback . '(' . json_encode($data) . ')';
        exit;
    }

    /**
     * 页面不存在
     */
    protected function error404() {
        //throw new \Exception("404页面不存在！", 404);
        //$this->errorDisplay('404');
        header("HTTP/1.0 404 Not Found");
        exit('404');
    }

    /**
     * 通讯错误
     */
    protected function errorBlock() {
        $this->error('通讯发生错误，请稍后刷新后尝试！');
    }

    /**
     * 生成分页URL
     * @param array $paramer
     * @param array $mustParams
     * @param int $page
     * @return string \url
     */
    protected function createPageUrl($paramer = array(), $mustParams = array(), $page = 1) {
        $paramer = array_filter($paramer);
        //$paramer = array_flip(array_flip($paramer));
        $dir = APP_NAME . '/' . CONTROLLER_NAME . '/' . ACTION_NAME;
        $mustParams['page'] = $page;
        return match_url($dir, $paramer, $mustParams);
    }

    /**
     * @param $name
     * @param $value
     */
    protected function setPageConfig($name, $value) {
        $this->pager->set($name, $value);
    }

}