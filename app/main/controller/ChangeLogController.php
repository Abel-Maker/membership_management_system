<?php

namespace app\main\controller;

/**
 * 修改日志
 */
class ChangeLogController extends AdminController {
    /**
     * 当前模块参数
     */
    public function _infoModule() {
        $data = array(
            'info' => array(
                'name' => '待办管理',
                'description' => '记录需要办理的事务',
            ),
            'menu' => array(
                array('name' => '待办管理',
                    'url' => url('index'),
                    'icon' => 'list',
                )
            ),
            'add' => array(
                array(
                    'name' => '添加事务',
                    'url' => url('add'),
                ),
            ),
        );
        return $data;
    }

    /**
     * 列表
     */
    public function index() {
        //筛选条件
        $where = array();
        //URL参数
        $pageMaps = array();

        $userId = session('admin_user.user_id');
        $where['user_id'] = $userId;
        $keyword = request('request.keyword', '');
        if (!empty($keyword)) {
            $where[] = "log_id like '%" . $keyword . "%' OR content like '%" . $keyword . "%' OR `user_id` IN (SELECT `user_id` FROM `tp_admin_user` WHERE `name` LIKE '%" . $keyword . "%')";
            $pageMaps['keyword'] = $keyword;
        }
        $type = request('request.type', '');
        if ($type <> '') {
            $where['type'] = $type;
            $pageMaps['type'] = $type;
        }

        //直接查找某个id
        $logId = request('request.log_id');
        if ($logId) {
            $where['log_id'] = $logId;
            $pageMaps['log_id'] = $logId;
        }

        //查询数据
        $list = target('ChangeLog')->page(50)->loadList($where);
        $this->pager = target('ChangeLog')->pager;

        //type
        $type_arr = array(
            '0' => '一般',
            '1' => '紧急'
        );
        $this->assign('type_arr', $type_arr);

        //模板传值
        $this->assign('list', $list);
        $this->assign('page', $this->getPageShow($pageMaps));
        $this->assign('pageMaps', $pageMaps);
        $this->adminDisplay();
    }

    /**
     * 添加
     */
    public function add() {
        if (!IS_POST) {
            //模板传值
            $this->assign('name', '添加');
            $this->adminDisplay('info');
        } else {
            //post
            if (target('main/ChangeLog')->saveData('add')) {
                //通知技术部
                $title = '内部系统有新的修改意见';
                $content = '请IT部门安排修改。';
                $msg = array(
                    'type' => 'news',
                    'to_obj' => '1',
                    'to_id' => 6,
                    'title' => $title,
                    'content' => $content,
                    'url' => url('main/ChangeLog/index'),
                    'act' => 'change_log'
                );
                send_msg($msg);

                $this->success('添加成功！');
            } else {
                $msg = target('main/ChangeLog')->getError();
                if (empty($msg)) {
                    $this->error('添加失败');
                } else {
                    $this->error($msg);
                }
            }
        }
    }

    /**
     * 编辑
     */
    public function edit() {
        if (!IS_POST) {
            $logId = request('get.log_id', '', 'intval');
            if (empty($logId)) {
                $this->error('参数不能为空！');
            }
            $model = target('ChangeLog');
            $info = $model->getInfo($logId);
            if (!$info) {
                $this->error($model->getError());
            }
            if ($info['user_id'] <> session('admin_user.user_id') && session('admin_user.is_root') == '0') {
                $this->error('您无权修改该日志！');
            }

            //模板传值
            $this->assign('name', '修改');
            $this->assign('info', $info);
            $this->adminDisplay('info');
        } else {
            $logId = request('post.log_id');
            if (empty($logId)) {
                $this->error('ID错误');
            }

            //post
            if (target('main/ChangeLog')->saveData('edit')) {


                $this->success('修改成功！');
            } else {
                $msg = target('main/ChangeLog')->getError();
                if (empty($msg)) {
                    $this->error('修改失败');
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
        $logId = request('post.data');
        if (empty($logId)) {
            $this->error('参数不能为空！');
        }
        $info = target('ChangeLog')->getInfo($logId);
        if ($info['user_id'] <> session('admin_user.user_id') && session('admin_user.is_root') == '0') {
            $this->error('您无权删除该日志！');
        }

        //删除操作
        if (target('ChangeLog')->delData($logId)) {
            $this->success('删除成功！');
        } else {
            $msg = target('Weekly')->getError();
            if (empty($msg)) {
                $this->error('删除失败！');
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
        $val = request('post.val');
        $field = request('post.field');

        $data = array(
            'log_id' => $id,
            $field => $val
        );
        $status = target('main/ChangeLog')->save($data);
        if ($status) {
            //修改完成通知提交人
            if ($val == '1') {
                $log = target('main/ChangeLog')->field('user_id')->getInfo($id);

                $title = '你提交的修改意见已经完成';
                $content = '修改意见ID：' . $id . '，您可以直接搜索ID，查找到相关修改意见，查看是否满足您的需求，欢迎再次反馈。';
                $msg = array(
                    'type' => 'news',
                    'to_obj' => '2',
                    'to_id' => $log['user_id'],
                    'title' => $title,
                    'content' => $content,
                    'url' => url('main/ChangeLog/index', array('log_id' => $id)),
                    'act' => 'changelog_ok_' . $id
                );
                send_msg($msg);
            }

            $res = array('error' => 0, 'message' => $val);
        } else {
            $res = array('error' => 1, 'message' => '异常错误');
        }
        exit(json_encode($res));
    }

}

