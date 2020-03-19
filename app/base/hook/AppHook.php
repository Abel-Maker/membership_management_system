<?php
namespace app\base\hook;

class AppHook {

    public function appBegin() {

    }

    public function appEnd() {
        // 获取基本信息
        $runtime = number_format(microtime(true) - START_TIME, 6);
        $reqs    = $runtime > 0 ? number_format(1 / $runtime, 2) : '∞';
        $mem     = number_format((memory_get_usage() - START_MEM) / 1024, 2);

        //echo DbHook::$queryTimes;
        //dump(DbHook::$sqls);
        if(config('SHOW_PAGE_TRACE') && !IS_AJAX){
            //echo APP_PATH;

            $config = [
                'trace_file' => APP_PATH . 'base/view/page_trace.html',
                //'trace_tabs' => ['base' => '基本', 'file' => '文件', 'info' => '流程', 'notice|error' => '错误', 'sql' => 'SQL', 'debug|log' => '调试'],
                'trace_tabs' => ['base' => '基本', 'file' => '文件', 'sql' => 'SQL'],
            ];

            // 页面Trace信息

            if (isset($_SERVER['HTTP_HOST'])) {
                $uri = $_SERVER['SERVER_PROTOCOL'] . ' ' . $_SERVER['REQUEST_METHOD'] . ' : ' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
            } else {
                $uri = 'cmd:' . implode(' ', $_SERVER['argv']);
            }

            $base = [
                '请求信息' => date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']) . ' ' . $uri,
                '运行时间' => number_format($runtime, 6) . 's [ 吞吐率：' . $reqs . 'req/s ] 内存消耗：' . $mem . 'kb 文件加载：' . count(get_included_files()),
                '查询信息' => DbHook::$queryTimes . ' queries ' . DbHook::$executeTimes . ' writes ',
                //'缓存信息' => Cache::$readTimes . ' reads,' . Cache::$writeTimes . ' writes',
                '配置加载' => count(\framework\base\Config::get()),
            ];

            if (session_id()) {
                $base['会话信息'] = 'SESSION_ID=' . session_id();
            }

            //文件
            $files = get_included_files();
            $info  = [];
            foreach ($files as $key => $file) {
                $info[] = $file . ' ( ' . number_format(filesize($file) / 1024, 2) . ' KB )';
            }

            // 页面Trace信息
            $trace = [];
            foreach ($config['trace_tabs'] as $name => $title) {
                $name = strtolower($name);
                switch ($name) {
                    case 'base': // 基本信息
                        $trace[$title] = $base;
                        break;
                    case 'file': // 文件信息
                        $trace[$title] = $info;
                        break;
                    case 'sql':
                        $trace[$title] = DbHook::$sqls;
                        break;
                    default: // 调试信息
                        if (strpos($name, '|')) {
                            // 多组信息
                            $names  = explode('|', $name);
                            $result = [];
                            foreach ($names as $name) {
                                $result = array_merge($result, isset($log[$name]) ? $log[$name] : []);
                            }
                            $trace[$title] = $result;
                        } else {
                            $trace[$title] = isset($log[$name]) ? $log[$name] : '';
                        }
                }
            }

            // 调用Trace页面模板
            //ob_start();
            include $config['trace_file'];
            //return ob_get_clean();
        }
    }

    public function appError($e) {
        header('content-type: text/html; charset=utf-8');
        if (404 == $e->getCode()) {
            $action = 'error404';
        } else {
            $action = 'error';
        }
        obj('app\base\controller\ErrorController')->$action($e);
    }

    public function routeParseUrl($rewriteRule, $rewriteOn) {

    }

    public function actionBefore($obj, $action) {

    }

    public function actionAfter($obj, $action) {

    }
}