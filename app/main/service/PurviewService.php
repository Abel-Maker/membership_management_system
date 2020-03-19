<?php
namespace app\main\service;
/**
 * 权限接口
 */
class PurviewService {
    /**
     * 获取模块权限
     */
    public function getMainPurview() {
        return array(
            'records' => array(
                'name' => '外卖',
                'auth' => array(
                    'index' => '列表',
                    'add' => '添加',
                    'edit' => '编辑',
                    'del' => '删除',
                )
            ),

            'changelog' => array(
                'name' => '待办',
                'auth' => array(
                    'index' => '列表',
                    'reply' => '回复',
                    'add' => '添加',
                    'edit' => '编辑',
                    'del' => '删除',
                )
            ),
            'article' => array(
                'name' => '文章',
                'auth' => array(
                    'index' => '列表',
                    'add' => '添加',
                    'edit' => '编辑',
                    'del' => '删除',
                )
            ),
            'region' => array(
                'name' => '地区',
                'auth' => array(
                    'index' => '列表',
                    'toggle' => '状态',
                    'add' => '添加',
                    'edit' => '编辑',
                    'del' => '删除',
                )
            ),
            'admindept' => array(
                'name' => '部门',
                'auth' => array(
                    'index' => '列表',
                    'purview' => '权限',
                    'edit' => '编辑',
                    'del' => '删除'
                )
            ),
            'adminuser' => array(
                'name' => '员工',
                'auth' => array(
                    'index' => '查看',
                    'add' => '添加',
                    'edit' => '编辑',
                    'toggle' => '状态'
                )
            ),
        );
    }

}
