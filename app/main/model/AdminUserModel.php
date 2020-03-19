<?php

namespace app\main\model;

use app\base\model\BaseModel;
use framework\ext\Pinyin;

/**
 * 用户操作
 */
class AdminUserModel extends BaseModel {

    //完成
    protected $_auto = array(
        array('username', 'htmlspecialchars', 3, 'function'),  //用户名
        array('name', 'htmlspecialchars', 3, 'function'),  //昵称
        //array('email', 'htmlspecialchars', 3, 'function'),  //邮箱
        array('password', 'md5', 1, 'function'),  //新增时密码
        array('password', '', 2, 'ignore'),  //编辑时密码
        array('is_del', 'intval', 3, 'function'),  //状态
        array('add_time', 'time', 1, 'function'),  //注册时间
    );
    //验证
    protected $_validate = array(
        array('username', '1,20', '用户名称只能为1~20个字符', 1, 'length', 3),
        array('username', '', '已存在相同的用户名', 1, 'unique', 3),
        array('mobile', '', '已存在相同的手机号码', 1, 'unique', 3),
        //array('wechat_corp', '', '已存在相同的微信企业号用户名', 1, 'unique',3),
        //array('email','email', '邮箱地址输入不正确', 1 ,'regex',3),
        //array('email','', '已存在相同的邮箱', 1 ,'unique',3),
        array('password', '4,250', '请输入最少4位密码', 1, 'length', 1),
    );

    //获取列表
    public function loadList($where = array(), $limit = 10, $order = 'user_id ASC') {
        $pageList = $this->where($where)
            ->limit($limit)
            ->order($order)
            ->select();
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;
                //i
                $list[$key]['i'] = ($this->pager['page'] - 1) * $this->pager['pageSize'] + $i;
                $i++;
            }
        }
        return $list;
    }

    //获取列表
    public function loadData($where = array()) {
        $data = $this->table('admin_user')
            ->where($where)
            ->select();
        return $data;
    }

    /*
     * 读取运营中心的用户
     *
     */
    public function loadUsers($type = 'all', $status = '1') {
        if ($status <> '') {
            $where['is_del'] = $status;
        }
        $list = $this->field('user_id,name')->order('is_del DESC,username ASC')->loadData($where);

        return $list;
    }

    //计算数量
    public function countList($where = array()) {
        return $this->where($where)
            ->count();
    }

    /**
     * 获取信息
     * @param int $userId ID
     * @return array 信息
     */
    public function getInfo($userId) {
        return $this->where(['user_id' => $userId])->find();
    }

    /**
     * 获取信息
     * @param array $where 条件
     * @return array 信息
     */
    public function getWhereInfo($where) {
        return $this->table('admin_user as A')
            ->join('{pre}admin_dept as B ON A.dept_id = B.dept_id')
            ->field('A.*,B.status as dept_status,B.base_purview,B.menu_purview')
            ->where($where)
            ->find();
    }

    /**
     * 更新信息
     * @param string $type 更新类型
     * @return bool 更新状态
     */
    public function saveData($type = 'add') {
        //自己设置时不修改用户名，不验证用户名
        if ($type == 'setting') {
            $this->_auto = array(
                array('password', '', 2, 'ignore'),  //编辑时密码
            );
            $this->_validate = array(
                // array('email', 'email', '邮箱地址输入不正确', 1, 'regex', 3),
                array('password', '4,250', '请输入最少4位密码', 1, 'length', 1),
            );
        }
        //
        $data = $this->create();
        if (!$data) {
            return false;
        }
        /*        if (empty($data['fc']) || ($data['fc'] == '#')) {
                    $strChange = new Pinyin();
                    $data['fc'] = $strChange->getFirstChar($data['name']);
                }*/

        if ($type == 'add') {
            return $this->add($data);
        }
        if ($type == 'edit') {
            if (empty($data['user_id'])) {
                return false;
            }
            if (!empty($data['password'])) { //密码非空，处理密码加密
                $data['password'] = md5($data['password']);
            }
            $status = $this->save($data);
            if ($status === false) {
                return false;
            }
            return true;
        }
        //自己修改设置，密码等
        if ($type == 'setting') {
            $data['user_id'] = session('admin_user.user_id');
            if (!empty($data['password'])) { //密码非空，处理密码加密
                $data['password'] = md5($data['password']);
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
     * 删除信息
     * @param int $userId ID
     * @param int $batch
     * @return bool 删除状态
     */
    public function delData($userId) {
        $map = array();
        $map[] = 'user_id' . db_create_in($userId);
        $status = $this->where($map)->save(['is_del' => 1, 'status' => 0]);
        return $status;
    }

    /**
     * 登录用户
     * @param int $userId ID
     * @return bool 登录状态
     */
    public function setLogin($userId) {
        //读取用户信息
        $user = $this->field('user_id,username,dept_id,name,is_root,last_login_time,last_login_ip')
            ->getInfo($userId);
        //设置cookie
        $auth = array(
            'user_id' => $userId,
            'dept_id' => $user['dept_id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'is_root' => $user['is_root'],
            'last_login_time' => $user['last_login_time'],
            'last_login_ip' => $user['last_login_ip'],
        );
        session('admin_user', $auth);
        session('admin_user_sign', data_auth_sign($auth));

        //写入系统记录
        target('main/AdminLog')->addData('登录系统');

        // 更新登录信息
        $data = array(
            'user_id' => $userId,
            'last_login_time' => NOW_TIME,
            'last_login_ip' => \framework\ext\Util::getIp(),
        );
        $this->save($data);

        return true;
    }

    public function setMLogin($userId) {
        //读取用户信息
        $user = $this->field('user_id,username,dept_id,name,is_root,last_login_time,last_login_ip')
            ->getInfo($userId);
        //设置cookie
        $auth = array(
            'user_id' => $userId,
            'dept_id' => $user['dept_id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'is_root' => $user['is_root'],
            'last_login_time' => $user['last_login_time'],
            'last_login_ip' => $user['last_login_ip'],
        );
        session('user', $auth);
        session('user_sign', data_auth_sign($auth));

        //写入系统记录
        target('main/AdminLog')->addData('登录系统');

        // 更新登录信息
        $data = array(
            'user_id' => $userId,
            'last_login_time' => NOW_TIME,
            'last_login_ip' => \framework\ext\Util::getIp(),
        );
        $this->save($data);

        return true;
    }

    /**
     * 注销当前用户
     * @return void
     */
    public function logout() {
        session('admin_user', null);
        session('admin_user_sign', null);
    }

}
