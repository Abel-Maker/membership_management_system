<?php
namespace app\main\controller;

/**
 * 后台操作记录
 */
class AdminLogController extends AdminController {
    /**
     * 当前模块参数
     */
    protected function _infoModule(){
        return array(
            'info'  => array(
                'name' => '安全记录',
                'description' => '查询网站操作记录',
            ),
            'menu' => array(
                    array(
                        'name' => '记录列表',
                        'url' => url('index'),
                        'icon' => 'list',
                    ),
                )
            );
    }
	/**
     * 列表
     */
    public function index(){
        //筛选条件
        $where = array();
        if(!is_root()){
            $where['A.user_id'] = session('admin_user.user_id');
        }

        $keyword = request('request.keyword','');
        if(!empty($keyword)){
            //$where['B.username'] = $keyword;
            $where[] = "B.name LIKE '%".$keyword."%' OR B.username LIKE '%".$keyword."%' ".
                       "OR A.content LIKE '%".$keyword."%' OR A.ip LIKE '%".$keyword."%'";
        }
        //URL参数
        $pageMaps = array();
        $pageMaps['keyword'] = $keyword;
        //查询数据
        $list = target('AdminLog')->page(20)->loadList($where);
        $this->pager = target('AdminLog')->pager;
        //模板传值
        $this->assign('list',$list);
        $this->assign('page',$this->getPageShow($pageMaps));
        $this->assign('keyword',$keyword);
        $this->adminDisplay();
    }

}

