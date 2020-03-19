<?php

namespace app\main\model;
use app\base\model\BaseModel;

/**
 * 订单管理
 */
class OrderModel extends BaseModel {
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
    //pay_status ASC,
    public function loadList($where = array(), $limit = 20, $order = "repay_time ASC,cm_id") {
        $pageList = $this->where($where)
            ->limit($limit)
            ->order($order)
            ->select();
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;

                //订单状态
                //$list[$key]['status_data'] = $this->getStatus($value);
                //计算订单金额
                //$list[$key]['amount'] = $value['num'];

                $list[$key]['create_time'] = date('Y-m-d H:i:s', $value['create_time']);
                $list[$key]['repay_time'] = date('Y-m-d', $value['repay_time']);
                //如订单完成
                if ($value['pay_status'] == 1) {
                    $list[$key]['del_time'] = date('Y-m-d', $value['del_time']);
                }
                if ($value['cm_id'] > 0) {
                    $machineId = target('main/CompanyMachine')->field('machine_id')->getInfo($value['cm_id']);
                    $machine = target('main/Machine')->field('name,sn,machine_id')->getInfo($machineId['machine_id']);
                    $company = target('main/Company')->field('company')->getInfo($value['company_id']);
                    //$machine = target('main/CompanyMachine')->loadList(['cm_id' => $value['cm_id']]);
                    $list[$key]['machine'] = $machine;
                    $list[$key]['company'] = $company;
                }

                $list[$key]['i'] = ($this->pager['page'] - 1) * $this->pager['pageSize'] + $i;
                $i++;
            }
        }
        return $list;
    }

    /**
     * 读取用户的订单，做基本的汇总处理
     * @param $where array
     * @param $front bool
     * @return array 列表
     */
    public function loadOrder($where = array(), $front = false) {
        $pageList = $this->where($where)
            ->order("order_id DESC")
            ->select();
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;

                //订单状态
                // $list[$key]['status_data'] = $this->getStatus($value, $front);

                //订单信息
                if ($value['cm_id'] > 0) {
                    $machineId = target('main/CompanyMachine')->field('machine_id')->getInfo($value['cm_id']);
                    $machine = target('main/Machine')->field('name,sn')->getInfo($machineId['machine_id']);
                    $company = target('main/Company')->field('company')->getInfo($value['company_id']);
                    //$machine = target('main/CompanyMachine')->loadList(['cm_id' => $value['cm_id']]);
                    $list[$key]['machine'] = $machine;
                    $list[$key]['company'] = $company;
                }

                $list[$key]['create_time'] = date('Y-m-d H:i:s', $value['create_time']);

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
            ->order("order_id DESC")
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
        $map['order_id'] = $id;
        return $this->getWhereInfo($map, $extend);
    }

    /**
     * 获取信息
     * @param array $where 条件
     * * @param bool $extend
     * @return array 信息
     */
    public function getWhereInfo($where, $extend = false) {
        $info = $this->where($where)->find();
        $info['status_data'] = $this->getStatus($info);
        if ($extend) {
            if ($info['receive_province'] > 0) {
                $province = target('main/Region')->field('region_name')->getInfo($info['receive_province']);
                $info['province_info'] = $province['region_name'];
            }
            if ($info['receive_city'] > 0) {
                $city = target('main/Region')->field('region_name')->getInfo($info['receive_city']);
                $info['city_info'] = $city['region_name'];
            }
            if ($info['receive_district'] > 0) {
                $district = target('main/Region')->field('region_name')->getInfo($info['receive_district']);
                $info['district_info'] = $district['region_name'];
            }
        }
        return $info;
    }

    //读取订单详情
    public function getDetail($where) {
        //$info =  $this->where($where)->find();
        $info = $this->getWhereInfo($where, true);
        $info['status_data'] = $this->getStatus($info);
        //订单详情
        $goodsList = target('main/OrderGoods')->loadData(['order_id' => $info['order_id']]);

        $info['goodsList'] = $goodsList;

        return $info;
    }

    /**
     * 更新信息
     * @param string $type 更新类型
     * @return bool 更新状态
     */
    public function saveData($data, $type = 'add', $retNo = false) {
        $data = $this->create();
        if (!$data) {
            return false;
        }
        if ($type == 'add') {
            if (empty($data['order_no'])) {
                $data['order_no'] = $this->orderNo($data['agent_user_id']);
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
     * 订单号生成
     * @param string $userId
     * @return string
     */
    public function orderNo($userId = '') {
        mt_srand((double)microtime() * 1000000);
        return $userId . date('Ymd') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
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

    /*
     * 更新门店订单数量
     *
     */
    public function updateNum($companyId) {
        if (empty($companyId)) {
            return false;
        }
        $num = $this->countList(['company_id' => $companyId]);
        return target('main/Company')->where(['company_id' => $companyId])->save(['order_num' => $num]);
    }

    /**
     * 订单状态
     * @param $info
     * @param $front bool 前台展现
     * @return array
     */
    public function getStatus($info, $front = false) {
        if (!$front) {
            if (!$info['order_status']) {
                return [
                    'name' => '已关闭',
                    'action' => 'close',
                ];
            }
            //在线支付
            if ($info['pay_type']) {
                if (!$info['pay_status']) {
                    return [
                        'name' => '未付款',
                        'action' => 'pay',
                    ];
                }
            } elseif ($info['receive_status'] && !$info['pay_status']) {
                return [
                    'name' => '已收货未付款',
                    'action' => 'unpaid',
                ];
            }
            //配送站待发货
            if (!$info['supplier_delivery_status']) {
                return [
                    'name' => '供应商发货中',
                    'action' => 'supplier_delivery'
                ];
            }
            //配送站待收货
            if (!$info['center_receive_status']) {
                return [
                    'name' => '配送站待收货',
                    'action' => 'center_receive'
                ];
            }
            if (!$info['delivery_status']) {
                return [
                    'name' => '配送站待发货',
                    'action' => 'delivery'
                ];
            }

            //门店状态
            if ($info['receive_status']) {
                return [
                    'name' => '门店已收货',
                    'action' => 'received'
                ];
            } else {
                return [
                    'name' => '门店待收货',
                    'action' => 'receive'
                ];
            }
        } else {
            if (!$info['order_status']) {
                return [
                    'name' => '已关闭',
                    'action' => 'close',
                ];
            }
            //在线支付
            if ($info['pay_type']) {
                if (!$info['pay_status']) {
                    return [
                        'name' => '未付款',
                        'action' => 'pay',
                    ];
                }
            } elseif ($info['receive_status'] && !$info['pay_status']) {
                return [
                    'name' => '已收货未付款',
                    'action' => 'unpaid',
                ];
            }

            if (!$info['delivery_status']) {
                return [
                    'name' => '待发货',
                    'action' => 'delivery'
                ];
            }

            //门店状态
            if ($info['receive_status']) {
                return [
                    'name' => '已收货',
                    'action' => 'received'
                ];
            } else {
                return [
                    'name' => '待收货',
                    'action' => 'receive'
                ];
            }
        }
    }
}
