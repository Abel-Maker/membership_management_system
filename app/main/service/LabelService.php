<?php

namespace app\main\service;

/**
 * 标签接口
 */
class LabelService {

    /**
     * 日历里，日程读取
     * @param $data
     * @return mixed
     */
    function calList($data) {
        $where = array();
        $where[] = "(`is_public`='1' OR (`is_public`='0' AND `user_id`='" . session('admin_user.user_id') . "'))";
        //时间
        if (isset($data['tm'])) {
            $where['c_date'] = $data['tm'];
        }
        //其他条件
        if (!empty($data['where'])) {
            $where[] = $data['where'];
        }
        //排序
        if (empty($data['order'])) {
            $data['order'] = 'c_id ASC';
        }
        //其他属性
        //$where['user_id'] = session('admin_user.user_id');
        $model = target('Calendar');
        $list = $model->loadData($where);
        return $list;
    }

    /**
     * 日历系统提示，样式单数和大货单数等
     * @param $data
     * @return mixed
     */
    function sysTips($data) {
        $where = array();
        $res = array();
        $tm = $data['tm'];

        //只有部分部门显示
        //$sess_dept_id = session('admin_user.dept_id');

        //统计当天可以收款的金额,首款+中款+尾款,中款和尾款根据时间。


        return $res;
    }
}
