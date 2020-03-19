<?php
/**
 * Created by PhpStorm.
 * User: Abel
 * Date: 2019/3/19
 * Time: 13:57
 */

namespace app\main\controller;


class RecordsController extends AdminController {

    protected function _infoModule() {
        $userId = request('get.user_id');
        return array(
            'info' => array(
                'name' => '外卖管理',
                'description' => '管理所有外卖记录',
            ),
            'menu' => array(
                array(
                    'name' => '外卖管理',
                    'url' => $userId ? url('index', ['user_id' => $userId]) : url('index', ['t' => 'all']),
                    'icon' => 'list',
                ),
            ),
            'add' => array(
                array(
                    'name' => '添加订单',
                    'url' => url('add'),
                ),
            ),
        );

    }

    //日記列表
    public function index() {
        $where = [];
        $pageMaps = [];

        //关键词
        $keyword = request('request.keyword');
        if (!empty($keyword)) {
            $where[] = "(store_name LIKE '%{$keyword}%' OR food_name LIKE '{$keyword}' OR customer_address LIKE '{$keyword}' OR store_address LIKE '{$keyword}') ";
            $pageMaps['keyword'] = $keyword;
        }
        //性别数组
        $sex = [
            '1' => '男',
            '2' => '女',
            '0' => '未知'
        ];
        $this->assign('sex', $sex);

        $list = target('main/Records')
            ->page(10)
            ->loadList($where);
        //itdump($list);
        $this->pager = target('main/Records')->pager;
        $this->assign('page', $this->getPageShow($pageMaps));
        $this->assign('list', $list);
        $this->assign('');
        $this->adminDisplay();

    }

    /**
     * 增加订单
     */
    public function add() {
        if (!IS_POST) {
            $this->assign('name', '添加');
            $this->adminDisplay('info');
        } else {
            $deptId = target('main/RecordsController')->saveData('add');
            if ($deptId) {
                $this->success('添加成功！', url('records/index'));
            } else {
                $msg = target('main/RecordsController')->getError();
                if (empty($msg)) {
                    $this->error('添加失败');
                } else {
                    $this->error($msg);
                }
            }
        }
    }

    /**
     * 修改订单
     */
    public function edit() {
        if (!IS_POST) {
            $recordId = request('get.rec_id', '', 'intval');
            if (empty($recordId)) {
                $this->error('参数不能为空！');
            }
            //获取记录
            $model = target('main/RecordsController');
            $info = $model->getInfo($recordId);
            if (!$info) {
                $this->error($model->getError());
            }
            $this->assign('name', '修改');
            $this->assign('info', $info);
            $this->adminDisplay('info');
        } else {
            if (target('main/RecordsController')->saveData('edit')) {
                $this->success('修改成功！', url('records/index'));
            } else {
                $msg = target('main/RecordsController')->getError();
                if (empty($msg)) {
                    $this->error('修改失败');
                } else {
                    $this->error($msg);
                }
            }
        }
    }

    /**
     * 删除订单
     */
    public function del() {
        $recordId = request('post.data');
        if (empty($deptId)) {
            $this->error('参数不能为空！');
        }
        //删除
        if (target('main/RecordsController')->delData($recordId)) {
            $this->success('删除成功！');
        } else {
            $msg = target('main/RecordsController')->getError();
            if (empty($msg)) {
                $this->error('删除失败！');
            } else {
                $this->error($msg);
            }
        }
    }
    /*
     * 切换状态
     * */
    public function toggle() {
        $id = request('post.id');
        $val = request('post.val');
        $field = request('post.field');

        $data = array(
            'rec_id' => $id,
            $field => $val
        );
        $status = target('main/RecordsController')->save($data);
        if ($status) {
            $res = array('error' => 0, 'message' => $val);
        } else {
            $res = array('error' => 1, 'message' => '异常错误');
        }
        exit(json_encode($res));
    }
}