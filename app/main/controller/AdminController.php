<?php

namespace app\main\controller;

use app\base\controller\BaseController;
use framework\base\Config;
use framework\base\Cache;

/**
 * 后台公共类
 */
class AdminController extends BaseController {

    public $deptPurview = [];
    public $infoModule = [];

    public function __construct() {
        parent::__construct();
        $this->init();
    }

    /**
     * 后台控制器初始化
     */
    protected function init() {
        //强制后台入口登录
        if (APP != 'MAIN') {
            $this->error('请从后台入口重新登录！', false);
        }

        // 检测用户登录
        if (!$this->isLogin()) {
            $this->redirect(url('main/Login/index'));
        }

        //设置用户信息
        if (!(APP_NAME == 'main' && CONTROLLER_NAME == 'Login')) {
            //用户所在角色的菜单及权限
            $deptId = session('admin_user.dept_id');
            //读取缓存
            $purviewFile = TMP_PATH . 'dept/deptPurview_' . $deptId . '.php';
            $content = @file_get_contents($purviewFile);
            $this->deptPurview = @unserialize(substr($content, 13));

            //检测权限
            $this->checkPurview();

            //显示debug只有技术部显示
            if ($deptId <> '2') {
                config('SHOW_PAGE_TRACE', false);
            }

            //赋值当前菜单
            if (method_exists($this, '_infoModule')) {
                $this->infoModule = $this->_infoModule();
            }
        }
    }

    /**
     * 用户权限检测
     */
    protected function checkPurview() {
        //超管
        $isRoot = session('admin_user.is_root');
        $userId = session('admin_user.user_id');

        if ($isRoot || $userId == 1) {
            return true;
        }

        //用户拥有的权限
        $basePurview = $this->deptPurview['base_purview'];

        //权限表
        $purviewInfo = service(APP_NAME, 'Purview', 'getMainPurview');
        //如果权限表未设置访问
        if (empty($purviewInfo)) {
            return true;
        }

        //不在权限表controller的都可以访问
        $controller = $purviewInfo[strtolower(CONTROLLER_NAME)];
        if (empty($controller['auth'])) {
            return true;
        }
        //不在权限表action的都可以访问
        $action = $controller['auth'][strtolower(ACTION_NAME)];
        if (empty($action)) {
            return true;
        }
        $current = strtolower(CONTROLLER_NAME);
        if (!in_array($current, (array)$basePurview)) {
            $current = strtolower(CONTROLLER_NAME . '_' . ACTION_NAME);
            if (!in_array($current, (array)$basePurview)) {
                $this->error('您没有权限访问此功能！');
            }
        }

        return true;
    }

    /**
     * 检测用户是否登录
     * @return int 用户ID
     */
    protected function isLogin() {
        if (strtolower(CONTROLLER_NAME) <> 'login') {
            $user = session('admin_user');
            if (empty($user)) {
                return false;
            } else {
                return session('admin_user_sign') == data_auth_sign($user) ? true : false;
            }
        } else {
            return true;
        }
    }

    /**
     * root后台模板显示 调用内置的模板引擎显示方法，
     * @access protected
     * @param string $tpl 指定要调用的模板文件
     * @param mixed $layout 是否使用统一布局
     * @param boolean $return
     * @return string
     */
    protected function adminDisplay($tpl = '', $layout = 'common', $return = false) {
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
            $this->layout = "app/main/view/" . $layout;
            $this->display($tpl);
        }
    }

    //分页结果显示
    protected function getPageShow01($map = array(), $mustParams = array()) {
        $pageArray = $this->pager;
        //数量
        $html = '<div class="float-left page-count mi-only-pc">共' . $pageArray['totalPage'] . '页' . $pageArray['totalCount'] . '条</div>';
        //翻页
        $html .= '<div class="float-right">
        <ul class="pagination pagination-small">
          <li><a href="' . $this->createPageUrl($map, $mustParams, $pageArray['firstPage']) . '">首页</a></li>
          <li><a href="' . $this->createPageUrl($map, $mustParams, $pageArray['prevPage']) . '">上一页</a></li> ';
        foreach ($pageArray['allPages'] as $value) {
            if ($value == 0) {
                continue;
            }
            if ($value == $pageArray['page']) {
                $html .= '<li class="active">';
            } else {
                $html .= '<li class="mi-only-pc">';
            }
            $html .= '<a href="' . $this->createPageUrl($map, $mustParams, $value) . '">' . $value . '</a></li> ';
        }
        $html .= '<li><a href="' . $this->createPageUrl($map, $mustParams, $pageArray['nextPage']) . '">下一页</a></li>
          <li><a href="' . $this->createPageUrl($map, $mustParams, $pageArray['lastPage']) . '">末页</a></li>
        </ul></div>';
        return $html;

    }

    protected function getPageShow($map = array(), $mustParams = array()) {
        $pageArray = $this->pager;
        //数量
/*        $html = '<div class="float-left page-count mi-only-pc">共' . $pageArray['totalPage'] . '页' . $pageArray['totalCount'] . '条</div>';*/
        //翻页
        $html = '<div class="layui-card-body">
        <div class="page">
        <div>
          <a class="prev"  href="' . $this->createPageUrl($map, $mustParams, $pageArray['prevPage']) . '">&lt;&lt;</a> ';
        foreach ($pageArray['allPages'] as $value) {
            if ($value == 0) {
                continue;
            }
            if ($value == $pageArray['page']) {
                $html .= "<span class='current'>$value</span>";
            } else {
                $html .= '<a class="num" href="' . $this->createPageUrl($map, $mustParams, $value) . '">' . $value . '</a> ';
            }
        }
        $html .= '<a class="next" href="' . $this->createPageUrl($map, $mustParams, $pageArray['nextPage']) . '">&gt;&gt;</a>
        </div></div></div>';
        return $html;

    }
}