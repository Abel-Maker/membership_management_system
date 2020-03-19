<?php
/**
 * Developer:Abel
 * Date: 2020/2/15 15:10
 */

namespace app\main\controller;


class UserController extends AdminController {
    /**
     * 当前模块参数
     */
    protected function _infoModule() {
        return array(
            'info' => array(
                'name' => '用户管理',
                'description' => '门店用户',
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
            $where[] = '(name like "%' . $keyword . '%"  OR mobile like "%' . $keyword . '%") ';
            $pageMaps['keyword'] = $keyword;
        }
        //查询数据
        $list = target('User')->page(20)->loadList($where);
        $this->pager = target('User')->pager;

        $this->assign('list', $list);
        $this->assign('page', $this->getPageShow($pageMaps));
        $this->assign('keyword', $keyword);
        $this->adminDisplay();
    }

    /**
     * 增加
     */
    public function add() {
        if (!IS_POST) {

            //读取用户信息
            $this->assign('name', '添加');
            $this->assign('action', ACTION_NAME);
            $this->adminDisplay('info');
        } else {
            if (target('User')->saveData('add')) {
                //同步微信
                $this->success('用户添加成功！');
            } else {
                $msg = target('User')->getError();
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

            //获取记录
            $model = target('User');
            $info = $model->getInfo($userId);
            if (!$info) {
                $this->error($model->getError());
            }
            $this->assign('action', ACTION_NAME);
            $this->assign('info', $info);

            $this->assign('name', '修改');
            $this->adminDisplay('info');
        } else {

            if (target('User')->saveData('edit')) {

                $this->success('用户修改成功！');
            } else {
                $msg = target('User')->getError();
                if (empty($msg)) {
                    $this->error('用户修改失败');
                } else {
                    $this->error($msg);
                }
            }
        }
    }

    //充值列表
    public function recharge() {


    }

    //消费列表
    public function consume() {

    }

    //客户账户
    public function account() {
        if (!IS_POST) {
            $userId = request('get.user_id', '', 'intval');
            if (empty($userId)) {
                $this->error('参数不能为空！');
            }

            //获取记录
            $model = target('User');
            $info = $model->getInfo($userId);
            if (!$info) {
                $this->error($model->getError());
            }
            $this->assign('action', ACTION_NAME);
            $this->assign('info', $info);

            $this->assign('name', '修改');
            $this->adminDisplay('account');
        } else {
            $data = request('post.');
            $type = $data['cate'];

            $num = $data['count'];
            $money = $data['money'];
            /*            $res = array(
                            'msg' => 'ces',
                            'status' => false,
                            'data'=>$data['cate']
                        );

                        $this->ajaxReturn($res);
                        die();*/
            $res = [];
            if (!empty($money)) {
                $moneyMatched = preg_match('[1-9]\d*', $money);
                if ($moneyMatched) {
                    $res = array(
                        'msg' => '请输入正确的金额',
                        'status' => false
                    );
                    $this->ajaxReturn($res);
                }
            }

            if (!empty($num)) {
                $numMatched = preg_match('[1-9]\d*', $num);
                if ($numMatched) {
                    $res = array(
                        'msg' => '请输入正确的数量',
                        'status' => false
                    );
                    $this->ajaxReturn($res);
                }
            }

            $user = target('main/User')->getInfo($data['user_id']);
            $newData = [
                'user_id' => $data['user_id'],
                'remark' => $data['remark'],
                'admin_user_id' => session('admin_user.user_id'),
                'add_time' => time()
            ];

            $upData = [];

            //记录

            //账户变动

            $model = target('main/AccountLog');

            $model->beginTransaction();
            switch ($type) {
                //充值金额
                case 1:
                    $newData['action'] = '充值';
                    $newData['money'] = $money;
                    $newData['account'] = $user['money'] + $money;
                    $newData['remain_num'] = $user['remain_num'];
                    $newData['profit'] = $user['profit'];
                    $newData['state'] = 1;

                    $status = $model->add($newData);
                    if (!$status) {
                        $model->rollBack();
                        $res = array(
                            'msg' => '操作失败',
                            'status' => false
                        );
                        $this->ajaxReturn($res);
                    } else {
                        $upData = [
                            'money' => $newData['account'],
                            'consume_money' => $user['consume_money'] + $money
                        ];
                        $userStatus = target('main/User')
                            ->where(['user_id' => $data['user_id']])
                            ->save($upData);
                        if ($userStatus) {
                            $model->commit();
                            $res = array(
                                'msg' => '充值成功',
                                'status' => 1
                            );
                            $this->ajaxReturn($res);
                        }
                    }
                    break;
                //套餐充值
                case 2:
                    $newData['action'] = '充值';
                    $newData['money'] = $money;
                    $newData['remain_num'] = $user['remain_num'] + $num;
                    $newData['num'] = $num;
                    $newData['account'] = $user['money'];
                    $newData['profit'] = $user['profit'];
                    $newData['state'] = 2;

                    $status = $model->add($newData);

                    if (!$status) {
                        $model->rollBack();
                        // $this->error('操作失败');
                        $res = array(
                            'msg' => '操作失败',
                            'status' => 0
                        );
                        $this->ajaxReturn($res);
                    } else {
                        $upData = [
                            'remain_num' => $user['remain_num'] + $num,
                            'consume_money' => $user['consume_money'] + $money
                        ];
                        $userStatus = target('main/User')
                            ->where(['user_id' => $data['user_id']])
                            ->save($upData);
                        if ($userStatus) {
                            $model->commit();
                            // $this->success('充值成功');
                            $res = array(
                                'msg' => '充值成功',
                                'status' => 1
                            );
                            $this->ajaxReturn($res);
                        }
                    }

                    break;
                //账户消费
                case 3:
                    $newData['action'] = '消费';
                    $newData['money'] = $money;
                    $newData['account'] = $user['money'] - ($money * $user['profit']) / 10;
                    $newData['remain_num'] = $user['remain_num'];
                    $newData['profit'] = $user['profit'];
                    $newData['state'] = 3;
                    if ($newData['account'] < 0) {
                        $model->rollBack();
                        $res = array(
                            'msg' => '余额不足,请充值！',
                            'status' => 0
                        );
                        $this->ajaxReturn($res);
                        //$this->error('余额不足,请充值！');
                    }

                    $status = $model->add($newData);
                    if (!$status) {
                        $model->rollBack();
                        //$this->error('操作失败');
                        $res = array(
                            'msg' => '操作失败',
                            'status' => 0
                        );
                        $this->ajaxReturn($res);
                    } else {
                        $upData = [
                            'money' => $newData['account'],
                            'consume_num' => $user['consume_num'] + 1,
                            'log_time' => time()
                        ];
                        $userStatus = target('main/User')
                            ->where(['user_id' => $data['user_id']])
                            ->save($upData);
                        if ($userStatus) {
                            $model->commit();
                            //$this->success('扣费成功');
                            $res = array(
                                'msg' => '扣费成功',
                                'status' => 1
                            );
                            $this->ajaxReturn($res);
                        }
                    }


                    break;
                //套餐消费
                case 4:
                    $newData['action'] = '消费';
                    $newData['money'] = 0;
                    $newData['remain_num'] = $user['remain_num'] - $num;
                    $newData['num'] = $num;
                    $newData['profit'] = $user['profit'];
                    $newData['account'] = $user['money'];
                    $newData['state'] = 4;

                    if ($newData['remain_num'] < 0) {
                        $model->rollBack();
                        //$this->error('余额不足,请充值！');
                        $res = array(
                            'msg' => '余额不足,请充值！',
                            'status' => 0
                        );
                        $this->ajaxReturn($res);

                    }
                    $status = $model->add($newData);

                    if (!$status) {
                        $model->rollBack();
                        // $this->error('操作失败');
                        $res = array(
                            'msg' => '操作失败',
                            'status' => 0
                        );
                        $this->ajaxReturn($res);
                    } else {
                        $upData = [
                            'remain_num' => $user['remain_num'] - $num,
                            'consume_num' => $user['consume_num'] + $num,
                            'log_time' => time()
                        ];
                        $userStatus = target('main/User')
                            ->where(['user_id' => $data['user_id']])
                            ->save($upData);
                        if ($userStatus) {
                            $model->commit();
                            // $this->success('扣费成功');
                            $res = array(
                                'msg' => '扣费成功',
                                'status' => 1
                            );
                            $this->ajaxReturn($res);
                        }
                    }
                    break;
                default:
                    // $this->error('输入错误！');
                    $res = array(
                        'msg' => '输入错误',
                        'status' => 0
                    );
                    $this->ajaxReturn($res);
                    break;

            }
            //  $this->ajaxReturn($res);
        }
    }


}