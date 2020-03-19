<?php
/**
 * Developer:Abel
 * Date: 2020/2/15 15:13
 */

namespace app\main\controller;


class AccountLogController extends AdminController {

    public function index() {
        //筛选条件
        $where = array();
        $pageMaps = array();

        //关键词
        $keyword = request('request.keyword', '');
        if (!empty($keyword)) {
            $where[] = " `user_id` IN (SELECT `user_id` FROM `xc_user` WHERE `name` LIKE '%{$keyword}%') ";
            $this->assign('keyword', $keyword);
            $pageMaps['keyword'] = $keyword;
        }

        $userId = request('get.user_id');

        if (!empty($userId)) {
            $where['user_id'] = $userId;
            $pageMaps['user_id'] = $userId;
            $user = target('main/User')->getInfo($userId);
            $this->assign('user', $user);
        }

        $t = request('request.t', '');
        switch ($t) {
            case 'consume':
                $where['action'] = '消费';
                $cate = '消费';
                break;
            case 'recharge':
                $where['action'] = '充值';
                $cate = '充值';
                break;
            default:
                $cate = '财务';
                break;
        }
        $pageMaps['t'] = $t;
        $this->assign('t', $t);
        $this->assign('cate', $cate);

        //查询数据
        $list = target('main/AccountLog')->page(20)->loadList($where);
        $this->pager = target('main/AccountLog')->pager;

        //模板传值
        $this->assign('list', $list);
        $this->assign('page', $this->getPageShow($pageMaps));

        if ($cate == '财务') {
            $where['action'] = '充值';
        }
        //统计总金额
        $total = target('main/AccountLog')->where($where)->sum('money');
        $this->assign('total', $total);

        $this->adminDisplay();
    }

    public function chart() {


        $bgWeekTime = strtotime('-7 day',strtotime(date('Y-m-d')));
        $bgMonTime = strtotime('-1 month',strtotime(date('Y-m')));
        $endTime = time();

        $whereWeek[] = "`add_time` >= $bgWeekTime AND `add_time` <= " . $endTime;
        $whereMonth[] = "`add_time` >= $bgMonTime AND `add_time` <= " . $endTime;
        //用户
        $userWeek = target('main/User')->getJson('week', 'blue');
        $this->assign('userWeek', $userWeek);

        $userMon = target('main/User')->getJson('month', 'blue');
        $this->assign('userMon', $userMon);

        $user_num = target('main/User')->where($whereWeek)->count('user_id');
        $user_num_month = target('main/User')->where($whereMonth)->count('user_id');
        $this->assign('user_num', $user_num);
        $this->assign('user_num_month', $user_num_month);



        //营收
        $jsonArray = target('main/AccountLog')->getJson('充值', 'week', 'blue');

        $whereWeek['action'] = '充值';
        $whereMonth['action'] = '充值';

        $money_week = target('main/AccountLog')->where($whereWeek)->sum('money');
        $money_month = target('main/AccountLog')->where($whereMonth)->sum('money');

        $this->assign('jsonArray', $jsonArray);
        $this->assign('money_week', $money_week);
        $this->assign('money_month', $money_month);

        $jsonArrayMon = target('main/AccountLog')->getJson('充值', 'month', 'blue');
        $this->assign('jsonArrayMon', $jsonArrayMon);


        $this->adminDisplay();
    }
}