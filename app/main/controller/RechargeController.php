<?php

namespace app\main\controller;

/**
 * 充值记录
 */
class RechargeController extends AdminController {
    /**
     * 当前模块参数
     */
    protected function _infoModule() {
        return array(
            'info' => array(
                'name' => '充值记录',
                'description' => '查看充值记录',
            ),
            'menu' => array(
                array(
                    'name' => '充值列表',
                    'url' => url('index'),
                    'icon' => 'list',
                ),
                array(
                    'name' => '列表',
                    'url' => url('OrderLog/index'),
                    'icon' => 'list',
                ),
            )
        );
    }

    /**
     * 列表
     */
    public function index() {
        //筛选条件
        $where = array();
        $pageMaps = array();

        //搜索
        $keyword = request('request.keyword', '');
        if (!empty($keyword)) {
            $where[] = "order_no LIKE '%" . $keyword . "%'";
            $pageMaps['keyword'] = $keyword;
            $this->assign('keyword', $keyword);
        }

        //已支付订单
        $noPay = request('request.no_pay');
        if ($noPay) {
            $pageMaps['no_pay'] = 1;
        } else {
            $where[] = "pay_time>0";
        }

        //时间
        $bgTime = request('request.bg_time');
        $endTime = request('request.end_time');
        if (!empty($bgTime) && !empty($endTime) && $bgTime > $endTime) {
            $this->error('开始时间不能大于结束时间');
        }

        if (!empty($bgTime)) {
            $where[] = "`create_time`>" . strtotime($bgTime);
        }
        if (!empty($endTime)) {
            $where[] = "`create_time`<=" . (strtotime($endTime) + 86399);
        }

        //查询数据
        $list = target('Recharge')->page(20)->loadList($where);
        $this->pager = target('Recharge')->pager;

        //模板传值
        $this->assign('list', $list);
        $this->assign('page', $this->getPageShow($pageMaps));

        //统计总金额
        $total = target('main/Recharge')->where($where)->sum('money');
        $this->assign('total', $total);

        $this->adminDisplay();
    }

    /*
     * 统计报表
     */
    public function chart() {
        $year = request('request.year', date('Y'));
        $month = request('request.month', date('m'));
        $this->assign('year', $year);
        $this->assign('month', $month);

        $time = $year . '-' . $month;

        //统计单数
        $this->assign('jsonArray1', target('main/Recharge')->getJson($time, 'amount', 'orange'));

        //统计件数
        $this->assign('jsonArray2', target('main/Recharge')->getJson($time, 'count'));

        $this->adminDisplay();
    }

}

