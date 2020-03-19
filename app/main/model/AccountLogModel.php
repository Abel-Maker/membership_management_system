<?php

namespace app\main\model;


use app\base\model\BaseModel;

/**
 * 账户变动日志
 */
class AccountLogModel extends BaseModel {
    //自动完成
    protected $_auto = array(
        array('add_time', 'time', 1, 'function'), //时间
    );
    //验证
    protected $_validate = array();

    /**
     * 获取列表
     * @param $where array
     * @param $limit int
     * @param $order string
     * @return array 列表
     */
    public function loadList($where = array(), $limit = 20, $order = "log_id DESC") {
        $pageList = $this->where($where)
            ->limit($limit)
            ->order($order)
            ->select();
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;

                if (!empty($value['admin_user_id'])) {
                    $adminUser = target('main/AdminUser')->field('name')->getInfo($value['admin_user_id']);
                    $list[$key]['admin_user'] = $adminUser;
                }
                //机器
                if (!empty($value['user_id'])) {
                    $user = target('main/User')->getInfo($value['user_id']);
                    $list[$key]['user'] = $user;
                }

                $list[$key]['add_time'] = date('Y-m-d H:i:s', $value['add_time']);

                $list[$key]['remark'] = $value['remark'] != '' ? $value['remark'] : '暂无备注';


                $list[$key]['i'] = ($this->pager['page'] - 1) * $this->pager['pageSize'] + $i;
                $i++;
            }
        }
        return $list;
    }

    /**
     * 读取特定条件下全部
     * @param array $where
     * @return mixed
     */
    public function loadData($where = array()) {
        $list = $this->where($where)
            ->order("log_id DESC")
            ->select();
        return $list;
    }

    /**
     * 获取栏目数量
     * @param $where array
     * @return array 列表
     */
    public function countList($where = array()) {
        return $this->where($where)->count();
    }

    /**
     * 获取信息
     * @param int $id ID
     * @return array 信息
     */
    public function getInfo($id) {
        $map = array();
        $map['log_id'] = $id;
        return $this->getWhereInfo($map);
    }

    /**
     * 获取信息
     * @param array $where 条件
     * @return array 信息
     */
    public function getWhereInfo($where) {
        $info = $this->where($where)->find();

        return $info;
    }

    /**
     * 更新信息
     * @param array $data 数据
     * @param string $type 更新类型
     * @return bool 更新状态
     */
    public function saveData($data, $type = 'add') {
        if (empty($data)) {
            $data = $this->create();
        }

        if (!$data) {
            return false;
        }
        if ($type == 'add') {
            return $this->add($data);
        }
        if ($type == 'edit') {
            if (empty($data['log_id'])) {
                return false;
            }
            $status = $this->save();
            if ($status === false) {
                return false;
            }
            return true;
        }
        return false;
    }


    /**
     * 删除信息
     * @param int $id ID
     * @return bool 删除状态
     */
    public function delData($id) {
        $map = array();
        $map['log_id'] = $id;
        return $this->where($map)->delete();
    }

    //读取报表
    public function getJson($action = '充值', $type = 'week', $color = 'blue') {
        $jsonArray = array();

        $jsonArray['labels'] = array();
        $datasets = target('main/Chart')->getColor($color);
        $datasets['label'] = '营收';
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
            $where['action'] = $action;
            $sum = 0;
            if ($type == 'week') {
                $bg_time = strtotime("+" . $i . " day", $bgTime);
                $end_time = strtotime("+" . ($i + 1) . " day", $bgTime);
                //设置横坐标
                $jsonArray['labels'][] = date('m-d', $bg_time);
                $where[] = "`add_time` >= {$bg_time} AND `add_time` < " . $end_time;
                $sum = $this->where($where)->sum('money');
            }
            if ($type == 'month') {
                $bg_time = strtotime("+" . $i . " month", $bgTime);
                $end_time = strtotime("+" . ($i + 1) . " month", $bgTime);
                //设置横坐标
                $jsonArray['labels'][] = date('Y-m', $bg_time);
                $where[] = "`add_time` >= {$bg_time} AND `add_time` < " . $end_time;
                $sum = $this->where($where)->sum('money');
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
