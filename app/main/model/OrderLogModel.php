<?php

namespace app\main\model;

use app\base\model\BaseModel;

/**
 * 订单日志
 */
class OrderLogModel extends BaseModel {
    //自动完成
    protected $_auto = array(
        array('log_time', 'time', 1, 'function'), //时间
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

                $list[$key]['ip_addr'] = ip_addr($value['ip']);
                if ($value['user_id'] != 0) {
                    $user = target('main/CompanyUser')->field('company_id,name')->getInfo($value['user_id']);
                    $list[$key]['username'] = $user['name'];
                    $company = target('main/Company')->field('company')->getInfo($user['company_id']);
                    $list[$key]['company'] = $company['company'];
                }
                if (!empty($value['repay'])) {
                    $orderList = json_decode($value['repay'], true);
                    $orderInfo = [];
                    foreach ($orderList as $vo) {
                        $orderInfo[] = target('main/Order')->loadOrder(['order_id' => $vo['order_id']]);
                    }
                    $list[$key]['order'] = $orderInfo;
                }


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
     * @param bool $extend
     * @return array 信息
     */
    public function getInfo($id, $extend = false) {
        $map = array();
        $map['log_id'] = $id;
        return $this->getWhereInfo($map);
    }

    /**
     * 获取信息
     * @param array $where 条件
     * * @param bool $extend
     * @return array 信息
     */
    public function getWhereInfo($where, $extend = false) {
        $info = $this->where($where)->find();

        return $info;
    }

    /**
     * 更新信息
     * @param string $type 更新类型
     * @return bool 更新状态
     */
    public function saveData($data, $type = 'add', $retNo = false) {
        if (empty($data)) {
            $data = $this->create();
        }

        if (!$data) {
            return false;
        }
        if ($type == 'add') {
            if (empty($data['order_no'])) {
                $data['order_no'] = $this->orderNo();
            }
            $orderNo = $data['order_no'];
            $orderId = $this->add($data);
            if ($orderId) {
                return $retNo ? $orderNo : $orderId;
            } else {
                return false;
            }

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

    /**
     * 订单号生成
     * @param string $userId
     * @return string
     */
    public function orderNo() {
        mt_srand((double)microtime() * 1000000);
        return 'HK' . date('Ymd') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }

}
