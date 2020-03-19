<?php

namespace app\main\controller;

use framework\base\Cache;
use framework\ext\Util;

/**
 * 后台首页
 */
class IndexController extends AdminController {

    /**
     * 当前模块参数
     */
    protected function _infoModule() {
        return array(
            'info' => array(
                'name' => '管理首页',
                'description' => '基础信息',
            )
        );
    }

    public function index() {
        //首页外框不显示调试信息
        config('SHOW_PAGE_TRACE', false);
        $userId = session('admin_user.user_id');
        $user = target('main/AdminUser')->field('name')->getInfo($userId);
        $value = $user['name'] ?? '默认用户';
        $this->assign('name', $value);

        //获取菜单
        $menuPurview = $this->deptPurview['menu_purview'];
        $menuList = target('Menu')->getMenu($menuPurview);
        $this->assign('menuList', $menuList);
        $this->display();
    }

    public function home() {

        //机器数及在线数
        $where = [];
        $todoList = [];
        $bgMonTime = strtotime('-1 month', strtotime(date('Y-m')));
        $endTime = time();
        $where[] = "`add_time` >= $bgMonTime AND `add_time` <= " . $endTime;

        $visit = target('main/AccountLog')->countList($where);;

        $userNum = target('main/User')->countList($where);

        $where['action'] = '充值';
        $income = target('main/AccountLog')->where($where)->sum('money');


        $where['action'] = '消费';
        $consume = target('main/AccountLog')->where($where)->sum('money');

        $todoList = [
            'user' => $userNum,
            'income' => $income,
            'consume' => $consume,
            'visit' => $visit
        ];


        //今日充值
        $this->assign('todoList', $todoList);

        //图表
        $info = array(
            '操作系统' => PHP_OS,
            '运行环境' => $_SERVER["SERVER_SOFTWARE"],
            //'主机名'=>$_SERVER['SERVER_NAME'],
            'WEB服务端口' => $_SERVER['SERVER_PORT'],
            //'网站文档目录'=>$_SERVER["DOCUMENT_ROOT"],
            '浏览器信息' => substr($_SERVER['HTTP_USER_AGENT'], 0, 40),
            '通信协议' => $_SERVER['SERVER_PROTOCOL'],
            //'请求方法'=>$_SERVER['REQUEST_METHOD'],
            //          'ThinkPHP版本'=>THINK_VERSION,
            '系统版本' => config('VERSION'),
            '上传附件限制' => ini_get('upload_max_filesize'),
            '执行时间限制' => ini_get('max_execution_time') . '秒',
            '服务器时间' => date("Y年n月j日 H:i:s"),
            //'北京时间'=>gmdate("Y年n月j日 H:i:s",time()+8*3600),
            '服务器域名/IP' => $_SERVER['SERVER_NAME'] . ' [ ' . gethostbyname($_SERVER['SERVER_NAME']) . ' ]',
            //'服务器IP'=>$_SERVER['SERVER_ADDR'],
            //'用户的IP地址'=>$_SERVER['REMOTE_ADDR'],
            '剩余空间' => round((disk_free_space(".") / (1024 * 1024)), 2) . 'M',
        );
        $this->assign('info', $info);
        $this->adminDisplay();
    }


    public function test() {

    }
}

