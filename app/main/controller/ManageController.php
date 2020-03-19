<?php

namespace app\main\controller;

//系统管理
class ManageController extends AdminController {

    //当前模块参数
    protected function _infoModule() {
        return [
            'info' => [
                'name' => '系统管理',
                'description' => '管理系统的基础功能',
            ],
            'menu' => [
                [
                    'name' => '缓存管理',
                    'url' => url('cache'),
                    'icon' => 'exclamation-circle',
                ],
            ]
        ];
    }

    //缓存管理
    public function cache() {
        if (!IS_POST) {
            $this->assign('list', target('main/Manage')->getCacheList());
            $this->assign('dept', target('main/Manage')->getDeptList());
            $this->adminDisplay();
        } else {
            $key = request('post.data');
            if (empty($key)) {
                $this->error('没有获取到清除动作！');
            }
            if (target('main/Manage')->delCache($key)) {
                $this->success('缓存清空成功！');
            } else {
                $this->error('缓存清空失败！');
            }
        }
    }

    //清理测试数据
    public function clear() {
        $companyId = request('get.company_id');

        if (!in_array($companyId, ['2', '3'])) {
            $this->error('非测试公司不能清空数据');
        }

        $where = [];
        $where['company_id'] = $companyId;

        //清空OneNet命令数据
        target('main/Cmd')->where($where)->delete();

        //清空计件数据
        target('main/Piece')->where($where)->delete();



    }
}

