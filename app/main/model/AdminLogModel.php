<?php

namespace app\main\model;

use app\base\model\BaseModel;

/**
 * 操作记录
 */
class AdminLogModel extends BaseModel {
    //完成
    protected $_auto = array(
        array('log_time', 'time', 1, 'function'),
        array('ip', 'get_client_ip', 1, 'function'),
        array('ip_addr', 'get_client_ip_addr', 1, 'function'),
        array('app', APP_NAME, 1, 'string'),
        array('user_id', '1', 1, 'string'),
    );

    //读取列表
    public function loadList($where = array(), $limit = 20) {
        $data = $this->table('admin_log as A')
            ->join('{pre}admin_user as B ON A.user_id = B.user_id')
            ->field('A.*,B.username,B.name')
            ->where($where)
            ->limit($limit)
            ->order('A.log_id desc')
            ->select();
        return $data;
    }

    //计算数量
    public function countList($where = array()) {
        return $this->table('admin_log as A')
            ->join('{pre}admin_user as B ON A.user_id = B.user_id')
            ->where($where)
            ->count();
    }

    /**
     * 添加信息
     * @param string $log 增加数据
     * @return bool 更新状态
     */
    public function addData($log) {
        //$data = array();
        $data = array(
            'user_id' => session('admin_user.user_id'),
            'content' => $log
        );
        if (empty($data)) {
            return false;
        }
        //只保留500条数据
        /*
        $count = $this->countList();
        if($count>500){
            $this->order('log_id asc')->limit('1')->delete();
        }
        */
        //增加记录
        $data = $this->create($data);
        return $this->add($data);
    }

    //读取报表
    public function getJson($time, $num, $type = 'month', $color = 'blue', $chart = 'line') {
        $jsonArray = array();
        $jsonArray['labels'] = array();
        if ($chart == 'bar') {
            $datasets = target('main/Chart')->getBarChart($color);
        }
        if ($chart == 'line') {
            $datasets = target('main/Chart')->getChart($color);
        }
        $datasets['labels'] = $type == 'month' ? '按月统计' : '按年统计';
        switch ($type) {
            case 'month':
                $format = $time . '-01 00:00:00';
                break;
            case 'year':
                $format = $time . '-01-01 00:00:00';
                break;
            default:
                $format = $time . ' 00:00:00';
                break;
        }
        for ($i = 0; $i < $num; $i++) {
            $where = [];
            $sum = 0;
            switch ($type) {
                case 'month':
                    $timeNow = strtotime("+" . $i . " day", strtotime(date($format)));
                    //设置横坐标
                    $jsonArray['labels'][] = date('m-d', $timeNow);
                    $where[] = "`log_time` >= {$timeNow} AND `log_time` < " . strtotime('+1 day', $timeNow);
                    $sum = $this->countList($where);
                    break;
                case 'year':
                    $timeNow = strtotime("+" . $i . " month", strtotime(date($format)));
                    //设置横坐标
                    $jsonArray['labels'][] = date('Y-m', $timeNow);
                    $where[] = "`log_time` >= {$timeNow} AND `log_time` < " . strtotime('+1 month', $timeNow);
                    $sum = $this->countList($where);;
                    break;
                default:
                    $timeNow = strtotime("+" . $i . " hour", strtotime(date($format)));
                    //设置横坐标
                    $jsonArray['labels'][] = date('H:i', $timeNow);
                    $where[] = "`log_time` >= {$timeNow} AND `log_time` < " . strtotime('+1 hour', $timeNow);
                    $sum = $this->countList($where);
                    break;
            }
            if (isset($sum)) {
                $datasets['data'][] = abs($sum);
            } else {
                $datasets['data'][] = 0;
            }
        }

        $jsonArray['datasets'][] = $datasets;
        return json_encode($jsonArray);
    }

}
