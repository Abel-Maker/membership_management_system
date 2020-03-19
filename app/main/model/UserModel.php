<?php

namespace app\main\model;

use app\base\model\BaseModel;
use framework\ext\Pinyin;

/**
 * 用户操作
 */
class UserModel extends BaseModel {

    //完成
    protected $_auto = array(
        array('name', 'htmlspecialchars', 3, 'function'),  //昵称
        //array('email', 'htmlspecialchars', 3, 'function'),  //邮箱
        array('is_del', 'intval', 3, 'function'),  //状态
        array('add_time', 'time', 1, 'function'),  //注册时间
    );
    //验证
    protected $_validate = array(
        array('mobile', '', '已存在相同的手机号码', 1, 'unique', 3),
        //array('wechat_corp', '', '已存在相同的微信企业号用户名', 1, 'unique',3),
        //array('email','email', '邮箱地址输入不正确', 1 ,'regex',3),
        //array('email','', '已存在相同的邮箱', 1 ,'unique',3),
    );

    //获取列表
    public function loadList($where = array(), $limit = 10, $order = 'user_id ASC') {
        $pageList = $this->where($where)
            ->limit($limit)
            ->order($order)
            ->select();
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;

                //i
                $list[$key]['i'] = ($this->pager['page'] - 1) * $this->pager['pageSize'] + $i;
                $i++;
            }
        }
        return $list;
    }

    //获取列表
    public function loadData($where = array()) {
        $data = $this->table('user')
            ->where($where)
            ->select();
        return $data;
    }

    /*
     * 读取运营中心的用户
     *
     */
    public function loadUsers($type = 'all', $status = '1') {
        if ($status <> '') {
            $where['is_del'] = $status;
        }
        $list = $this->field('user_id,name')->order('is_del DESC,name ASC')->loadData($where);

        return $list;
    }

    //计算数量
    public function countList($where = array()) {
        return $this->where($where)
            ->count();
    }

    /**
     * 获取信息
     * @param int $userId ID
     * @return array 信息
     */
    public function getInfo($userId) {
        return $this->where(['user_id' => $userId])->find();
    }


    /**
     * 更新信息
     * @param string $type 更新类型
     * @return bool 更新状态
     */
    public function saveData($type = 'add') {
        //自己设置时不修改用户名，不验证用户名
        if ($type == 'setting') {
            $this->_auto = array(
                //array('password', '', 2, 'ignore'),  //编辑时密码
            );
            $this->_validate = array(
                // array('email', 'email', '邮箱地址输入不正确', 1, 'regex', 3),
                //array('password', '4,250', '请输入最少4位密码', 1, 'length', 1),
            );
        }
        //
        $data = $this->create();
        if (!$data) {
            return false;
        }
        if ($data['is_hot'] == 'on'){
            $data['is_hot'] = 1;
        }else{
            $data['is_hot'] = 0;
        }

        if ($type == 'add') {
            $data['admin_user_id'] = session('admin_user.user_id');
            return $this->add($data);
        }
        if ($type == 'edit') {
            if (empty($data['user_id'])) {
                return false;
            }
            $status = $this->save($data);
            if ($status === false) {
                return false;
            }
            return true;
        }
        return false;
    }

    /**
     * 删除信息
     * @param int $userId ID
     * @param int $batch
     * @return bool 删除状态
     */
    public function delData($userId) {
        $map = array();
        $map[] = 'user_id' . db_create_in($userId);
        $status = $this->where($map)->save(['is_del' => 1, 'status' => 0]);
        return $status;
    }

    //读取报表
    public function getJson( $type = 'week', $color = 'red') {
        $jsonArray = array();

        $jsonArray['labels'] = array();
        $datasets = target('main/Chart')->getColor($color);
        $datasets['label'] = '会员';
        $datasets['fill'] = false;
        switch ($type) {
            case 'week':
                $num = 7;
                $bgTime = strtotime('-7 day',strtotime(date('Y-m-d')));
                $datasets['labels'] = '按周统计';
                break;
            case  'month':
            default:
                $num = 1;
                $bgTime = strtotime('-1 month',strtotime(date('Y-m')));
                $datasets['labels'] = '按月统计';
                break;
                break;
        }

        for ($i = 0; $i <= $num; $i++) {

            $where = [];
            $sum = 0;
            if ($type == 'week') {
                $bg_time = strtotime("+" . $i . " day", $bgTime);
                $end_time = strtotime("+" . ($i + 1) . " day", $bgTime);
                //设置横坐标
                $jsonArray['labels'][] = date('m-d', $bg_time);
                $where[] = "`add_time` >= {$bg_time} AND `add_time` < " . $end_time;
                $sum = $this->where($where)->count('user_id');
            }
            if ($type == 'month') {
                $bg_time = strtotime("+" . $i . " month", $bgTime);
                $end_time = strtotime("+" . ($i + 1) . " month", $bgTime);
                //设置横坐标
                $jsonArray['labels'][] = date('Y-m', $bg_time);
                $where[] = "`add_time` >= {$bg_time} AND `add_time` < " . $end_time;
                $sum = $this->where($where)->count('user_id');
            }

            if ($sum) {
                $datasets['data'][] = $sum;
            } else {
                $datasets['data'][] = 0;
            }
        }
        $jsonArray['datasets'][] = $datasets;
        return json_encode($jsonArray);
    }


}
