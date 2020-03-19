<?php
namespace app\base\hook;

class DbHook {

    // 查询次数
    public static $queryTimes = 0;
    // 执行次数
    public static $executeTimes = 0;
    //执行的sql语句
    public static $sqls = [];

    public function dbQueryBegin($sql, $params) {

    }

    public function dbQueryEnd($sql, $data) {
        if (config('SHOW_PAGE_TRACE')) {
            self::$queryTimes++;
            self::$sqls[] = $sql;
        }
//        if($_GET['token']=='B0ZTGZQUXAj9iUm8'){
//            logit($sql);
//        }
    }

    public function dbExecuteBegin($sql, $params) {

    }

    public function dbExecuteEnd($sql, $affectedRows) {
        if (config('SHOW_PAGE_TRACE')) {
            self::$executeTimes++;
        }
    }

    public function dbException($sql, $err) {

    }
}