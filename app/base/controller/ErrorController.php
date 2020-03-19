<?php

namespace app\base\controller;

use framework\base\Controller;

class ErrorController extends Controller {

    public function error404($e = null) {
        header('HTTP/1.1 404 Not Found');
        header("status: 404 Not Found");
        $this->error($e);
    }

    public function error($e = null) {
        if (false !== stripos(get_class($e), 'Exception')) {
            $this->errorMessage = $e->getMessage();
            $this->errorCode = $e->getCode();
            $this->errorFile = $e->getFile();
            $this->errorLine = $e->getLine();
            $this->trace = $e->getTrace();
        }

        //关闭调试或者是线上版本，不显示详细错误
        if (false == config('DEBUG') || 'production' == config('ENV')) {
            //$home = new \app\www\controller\IndexController();
            //$home->error403();
            //记录错误日志
            //$this->error404();
            $tpl = 'error_production';
            $this->display('app/base/view/' . $tpl);
        } else {
            $tpl = 'error_development';
            $this->display('app/base/view/' . $tpl);
        }

    }
}