<?php
namespace app\main\controller;

/**
 * 登录页面
 */
class LoginController extends AdminController {

	/**
     * 登录页面
     */
    public function index(){
        if(!IS_POST){
            config('SHOW_PAGE_TRACE', false);
            $this->display();
        }else{
            $userName = request('post.username');
            $passWord = request('post.password');
            if(empty($userName)||empty($passWord)){
                $this->error('用户名或密码未填写！');
            }

            //查询用户
            $map = array();
            $map['username'] = $userName;
            //暂时不检测菜单权限
            //$userInfo = target('main/AdminUser')->getWhereInfo($map);
            $userInfo = target('main/AdminUser')->where($map)->find();

            if(empty($userInfo)){
                $this->error('登录用户不存在！');
            }
            if($userInfo['password']<>md5($passWord)){
                $this->error('您输入的密码不正确！');
            }
            $model = target('AdminUser');
            if($model->setLogin($userInfo['user_id'])){
                //通知
                $ip_info = get_client_ip().'['.get_client_ip_addr().']';
                $title = '用户登录提醒';
                $content = '亲爱的 '.$userInfo['name'].'，您成功登录了内部系统！<br><br>登录时间：'.date('Y年m月d日 H:i:s').'<br>登录IP：'.$ip_info.'<br>如果不是您本人操作请及时修改个人密码，确保账户安全。';

                //跳转进入系统
                $this->redirect('/');
            }else{
                $this->error($model->getError());
            }
            

        }
    }

    //退出登录
    public function logout(){
        target('main/AdminUser')->logout();
        session('[destroy]');
        $this->success('退出系统成功！', url('index'));
    }

    //微信登录
    public function wxauth(){
        $code = request('get.code');

        //根据code获取成员信息
        $wechat_userinfo = $this->wechat->getQYUserInfo($code);
        if(empty($wechat_userinfo)){
            die('获取用户信息出错');
        } else {
            //查询用户
            $map = array();
            $map['wechat_corp'] = $wechat_userinfo['UserId'];
            $user = target('AdminUser');
            $userInfo = $user->getWhereInfo($map);
            if(empty($userInfo)){
                $this->error('登录用户不存在！');
            }
            if(!$userInfo['status']){
                $this->error('该用户已被禁止登录！');
            }
            if($user->setLogin($userInfo['user_id'])){
                $from_url = request('post.from_url');
                $url = $from_url==''?'/':$from_url;
                $this->redirect($url);
            }else{
                $this->error($user->getError());
            }
        }
    }
}

