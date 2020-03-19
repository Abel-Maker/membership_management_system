<?php

namespace app\main\model;

use app\base\model\BaseModel;

/**
 * 订单管理
 */
class RecordsModel extends BaseModel {
    //自动完成
    protected $_auto = array();
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
    public function loadList($where = array(), $limit = 20, $order = "status DESC") {
        $pageList = $this->where($where)
            ->limit($limit)
            ->order($order)
            ->select();
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;

                $list[$key]['order_time'] = date('Y-m-d H:i:s', $value['order_time']);
                $list[$key]['arrivals_time'] = date('Y-m-d H:i:s', $value['arrivals_time']);
                $list[$key]['diff_time'] = format_time($value['diff_time']);
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
            ->order("rec_id DESC")
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
        $map['rec_id'] = $id;
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
        return $info;
    }


    /**
     * 更新信息
     * @param string $type 更新类型
     * @return bool 更新状态
     */
    public function saveData($type = 'add') {
        $data = $this->create();
        if (!$data) {
            return false;
        }

        if ($type == 'add') {
            $data['order_time'] = strtotime($data['order_time']);
            $data['arrivals_time'] = strtotime($data['arrivals_time']);
            $data['diff_time'] = $data['arrivals_time'] - $data['order_time'];
            return $this->add($data);
        }
        if ($type == 'edit') {
            if (empty($data['rec_id'])) {
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
        $map['rec_id'] = $id;
        return $this->where($map)->save(['status' => 0]);
    }
}
