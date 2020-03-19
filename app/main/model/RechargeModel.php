<?php

namespace app\main\model;

use app\base\model\BaseModel;

/**
 * 充值
 */
class RechargeModel extends BaseModel {
    //自动完成
    protected $_auto = array(
        array('create_time', 'time', 1, 'function'), //时间
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
    public function loadList($where = array(), $limit = 20, $order = "order_id DESC") {
        $pageList = $this->where($where)
            ->limit($limit)
            ->order($order)
            ->select();
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;

                //读取公司信息
                $company = target('main/Company')->field('company')->getInfo($value['company_id']);
                $list[$key]['company'] = $company['company'];
                $user = target('main/CompanyUser')->field('name')->getInfo($value['user_id']);
                $list[$key]['name'] = $user['name'];

                $list[$key]['i'] = ($this->pager['page'] - 1) * $this->pager['pageSize'] + $i;
                $i++;
            }
        }
        return $list;
    }

    //计算数量
    public function countList($where = array()) {
        return $this->where($where)->count();
    }

    //读取月度报表
    public function getJson($month, $type = 'amount', $color = 'blue', $date = 'm-d') {
        $jsonArray = array();
        $jsonArray['labels'] = array();
        $datasets = target('main/Chart')->getChart($color);
        $datasets['label'] = $type == 'amount' ? '充值金额' : '充值单数';
        $num = date('t', strtotime($month . "-01"));
        for ($i = 0; $i < $num; $i++) {
            $format = $month . '-01 0:0:0';
            $timeNow = strtotime("+" . $i . " day", strtotime(date($format)));
            $jsonArray['labels'][] = date($date, $timeNow);
            $where = [];
            $where[] = "`pay_time` >= {$timeNow} AND `pay_time` < " . strtotime('+ 1 day', $timeNow);

            $sum = 0;
            if ($type == 'amount') {
                $sum = $this->where($where)->sum('money');
            }
            if ($type == 'count') {
                $sum = $this->countList($where);
            }

            if ($sum) {
                $datasets['data'][] = $sum;
            } else {
                $datasets['data'][] = 0;
            }
        }
        //$jsonArray['labels'] = array_reverse($jsonArray['labels']);
        //$datasets['data'] = array_reverse($datasets['data']);
        $jsonArray['datasets'][] = $datasets;
        return json_encode($jsonArray);

    }

    /**
     * 读取特定条件下全部
     * @param array $where
     * @return mixed
     */
    public function loadData($where = array()) {
        $list = $this->where($where)
            ->order("order_id DESC")
            ->select();
        return $list;
    }

    /**
     * 获取信息
     * @param int $id ID
     * @return array 信息
     */
    public function getInfo($id) {
        $map = array();
        $map['order_id'] = $id;
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
            if (empty($data['order_id'])) {
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
        $map['order_id'] = $id;
        return $this->where($map)->delete();
    }

    /**
     * 订单号生成
     * @return string
     */
    public function orderNo() {
        mt_srand((double)microtime() * 1000000);
        return 'CZ' . date('Ymd') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }

}
