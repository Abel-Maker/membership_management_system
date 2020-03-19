<?php

namespace app\main\controller;

use framework\ext\Http;
use framework\ext\Arr;

/**
 * 后台用户
 */
class AdminUserController extends AdminController {

    /**
     * 当前模块参数
     */
    protected function _infoModule() {
        return array(
            'info' => array(
                'name' => '用户管理',
                'description' => '管理系统管理员',
            ),
            'menu' => array(
                array(
                    'name' => '用户列表',
                    'url' => url('index'),
                    'icon' => 'list',
                ),
            ),
            'add' => array(
                array(
                    'name' => '添加用户',
                    'url' => url('add'),
                ),
            ),
        );
    }

    /**
     * 列表
     */
    public function index() {

        //URL参数
        $pageMaps = array();
        //筛选条件
        $where = array();

        $keyword = request('request.keyword', '');
        if (!empty($keyword)) {
            $where[] = '( username like "%' . $keyword . '%"  OR  name like "%' . $keyword . '%"   OR  mobile like "%' . $keyword . '%") ';
            $pageMaps['keyword'] = $keyword;
        }

        $deptId = request('request.dept_id');
        if (!empty($deptId)) {
            $where['dept_id'] = $deptId;
            $pageMaps['dept_id'] = $deptId;
        }

        //显示禁用的用户
        /*        $is_del = request('request.is_del');
                if ($is_del) {
                    $where['is_del'] = $is_del;
                    $pageMaps['is_del'] = $is_del;
                }*/

        $where['is_del'] = 0;
        //查询数据
        $list = target('AdminUser')->page(20)->loadList($where);
        $this->pager = target('AdminUser')->pager;

        $this->assign('list', $list);
        $this->assign('page', $this->getPageShow($pageMaps));
        $this->assign('keyword', $keyword);
        $this->assign('deptId', $deptId);
        $this->adminDisplay();
    }

    /**
     * 增加
     */
    public function add() {
        if (!IS_POST) {
            //部门

            //读取用户信息
            $this->assign('userList', target('AdminUser')->loadUsers('all'));

            $this->assign('name', '添加');
            $this->assign('action', ACTION_NAME);
            $this->adminDisplay('info');
        } else {
            if (target('AdminUser')->saveData('add')) {

                //同步微信
                $this->success('用户添加成功！', 'index');
            } else {
                $msg = target('AdminUser')->getError();
                if (empty($msg)) {
                    $this->error('用户添加失败');
                } else {
                    $this->error($msg);
                }

            }
        }
    }

    /**
     * 修改
     */
    public function edit() {
        if (!IS_POST) {
            $userId = request('get.user_id', '', 'intval');
            if (empty($userId)) {
                $this->error('参数不能为空！');
            }

            if ($userId == '1' && session('admin_user.user_id') <> '1') {
                $this->error('您无权修改该用户！');
            }

            //获取记录
            $model = target('AdminUser');
            $info = $model->getInfo($userId);
            if (!$info) {
                $this->error($model->getError());
            }
            $this->assign('action', ACTION_NAME);
            $this->assign('info', $info);

            $this->assign('name', '修改');
            $this->adminDisplay('info');
        } else {
            if (target('AdminUser')->saveData('edit')) {

                //$this->success('用户修改成功！');
                $res = [
                    'status' => 1,
                    'msg' => '用户修改成功'
                ];
                $this->ajaxReturn($res);
            } else {
                $msg = target('AdminUser')->getError();
                if (empty($msg)) {
                    $this->error('用户修改失败');
                } else {
                    $this->error($msg);
                }
            }
        }
    }

    /**
     * 自己修改设置
     */
    public function setting() {
        if (!IS_POST) {
            $userId = session('admin_user.user_id');
            if (empty($userId)) {
                $this->error('参数不能为空！');
            }
            //获取记录
            $model = target('AdminUser');
            $info = $model->getInfo($userId);
            if (!$info) {
                $this->error($model->getError());
            }

            $this->assign('name', '修改');
            $this->assign('info', $info);
            $this->adminDisplay('info');
        } else {
            if (target('AdminUser')->saveData('setting')) {
                //$this->success('用户修改成功！');
                $res = [
                    'status' => 1,
                    'msg' => '用户修改成功'
                ];
                $this->ajaxReturn($res);
            } else {
                $msg = target('AdminUser')->getError();
                if (empty($msg)) {
                    $this->error('用户修改失败');
                } else {
                    $this->error($msg);
                }
            }
        }
    }

    /**
     * 删除
     */

    public function del() {
        $user = request('post.id');

        if (empty($user)) {
            $this->error('参数不能为空！');
        }
        if ($user == 1) {
            $this->error('保留用户无法删除！');
        }
        //获取用户数量
        if (target('AdminUser')->delData($user)) {
            $this->success('用户删除成功！');
        } else {
            $msg = target('AdminUser')->getError();
            if (empty($msg)) {
                $this->error('用户删除失败！');
            } else {
                $this->error($msg);
            }
        }
    }


    /**
     * 切换状态
     */
    public function toggle() {
        $id = request('post.id');
        $val = request('request.val');
        $field = request('post.field');

        $data = array(
            'user_id' => $id,
            $field => $val
        );
        $status = target('AdminUser')->save($data);
        if ($status) {
            $res = array('error' => 0, 'message' => $val);
        } else {
            $res = array('error' => 1, 'message' => '异常错误');
        }
        exit(json_encode($res));
    }

    /**
     * 异步读取
     */
    public function ajaxget() {
        $where = array();
        $where['status'] = 1;
        $keyword = request('request.keyword', '');
        if (!empty($keyword)) {
            $where[] = "`username` LIKE '%" . $keyword . "%' OR `name` LIKE '%" . $keyword . "%'";
        }
        $deptid = request('request.deptid');
        if ($deptid) {
            $where['dept_id'] = $deptid;
        }

        $list = target('AdminUser')->field("user_id, name")->loadData($where);
        $list = Arr::toHashMap($list, 'user_id', 'name');
        $json = json_encode($list);
        echo $json;
    }
}

