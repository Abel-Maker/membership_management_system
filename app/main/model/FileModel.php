<?php

namespace app\main\model;

use app\base\model\BaseModel;

/**
 * 文件操作
 */
class FileModel extends BaseModel {
    //完成
    protected $_auto = array(
        array('time', 'time', 3, 'function'),
    );

    //上传数据
    public function uploadData($config = [], $userInfo = []) {
        $upload = target('base/Upload');
        $data = $upload->upload($config);
        if (!$data) {
            $this->error = $upload->getErrorMsg();
            return false;
        }
        //检查文件是否存在
        $where['url'] = $data['url'];
        //区分具体公司
        if(!empty($userInfo['company_id'])) {
            $where['company_id'] = $userInfo['company_id'];
            if(!empty($userInfo['wechat_id'])){
                $where['wechat_id'] = $userInfo['wechat_id'];
            }
        }
        $info = $this->getWhereInfo($where);
        if (empty($info)) {
            if (!empty($userInfo)) {
                $data = array_merge($data, $userInfo);
            }
            $fileId = $this->add($data);
            $data['file_id'] = $fileId;
        } else {
            $data['file_id'] = $info['file_id'];
            $data['wechat_url'] = $info['wechat_url'];
            $data['media_id'] = $info['media_id'];
        }
        return $data;
    }

    //获取列表
    public function loadList($where = array(), $limit = 10) {
        $pageList = $this->where($where)
            ->limit($limit)
            ->order('time DESC')
            ->select();

        //处理数据类型
        $list = array();
        if (!empty($pageList)) {
            $i = 1;
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;

                //用户上传的，读取公司信息
                if ($value['company_id']) {
                    $company = target('main/Company')->field('company')->getInfo($value['company_id']);
                    $list[$key]['company'] = $company['company'];
                }

                //i
                $list[$key]['i'] = ($this->pager['page'] - 1) * $this->pager['pageSize'] + $i;
                $i++;
            }
        }
        return $list;
    }

    public function loadFiles($where, $limit = 10) {
        $pageList = $this->table('file as A')
            ->join('{pre}user as B ON A.user_id = B.user_id')
            ->field('A.*,B.nickname,B.avatar')
            ->where($where)
            ->limit($limit)
            ->order('A.file_id desc')
            ->select();
        $list = [];
        $week = array("日", "一", "二", "三", "四", "五", "六");
        if (!empty($pageList)) {
            foreach ($pageList as $key => $value) {
                $list[$key] = $value;
                $list[$key]['show_time'] = date('m月d日', $value['add_time']) . ' 星期'.$week[date('w', $value['add_time'])];
            }
        }
        return $list;
    }

    //获取信息
    public function getInfo($fileId) {
        $map = array();
        $map['file_id'] = $fileId;
        return $this->getWhereInfo($map);
    }

    //获取信息
    public function getWhereInfo($where) {
        return $this->where($where)->find();
    }

    /**
     * 删除信息
     * @param $id int ID
     * @return bool 删除状态
     */
    public function delData($id) {
        //读取信息，删除文件
        $info = $this->getInfo($id);
        if (!empty($info)) {
            @unlink(WWW_PATH . $info['url']);
        }

        $map = array();
        $map['file_id'] = $id;
        return $this->where($map)->delete();
    }

}
