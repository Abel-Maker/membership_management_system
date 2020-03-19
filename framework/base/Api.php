<?php

/**
 * 公共API
 */

namespace framework\base;

class Api {

    protected $data;

    /**
     * Api constructor.
     */
    public function __construct() {
        $request = request('request.');
        //微信传过来的数据如果是header是application/json时
        if (strpos($_SERVER['HTTP_REFERER'], 'https://servicewechat.com') !== false) {
            $data = file_get_contents('php://input');
            if (!empty($data)) {
                $data = urldecode($data);
                $data = json_decode($data, true);
                if (!empty($data)) {
                    $request = array_merge($request, $data);
                }
            }
        }
        $this->data = $request;

        //路由参数后期没用了
        unset($this->data['r']);
    }

    /**
     * 返回成功数据
     * @param string $msg
     * @param array $data
     * @param string $type
     */
    public function success($msg = 'success', $data = [], $type = 'json') {
        $res = [
            'code' => '0',
            'msg' => $msg,
            'data' => $data
        ];
        /*
        if(!empty($data)){
            $res['data'] = $data;
        }
        */

        $this->returnData($res, $type);
        exit;
    }
    public function successApp($msg = 'success', $data = [], $type = 'json') {
        $res = [
            'code' => '0',
            'msg' => $msg,
            'res' => $data
        ];
        /*
        if(!empty($data)){
            $res['data'] = $data;
        }
        */

        $this->returnData($res, $type);
        exit;
    }

    /**
     * 返回错误数据
     * @param int $code
     * @param string $msg
     * @param string $type
     */
    public function error($msg = '', $code = '1', $type = 'json') {
        $res = [
            'code' => $code,
            'msg' => $msg,
        ];

        $this->returnData($res, $type);
        exit;
    }

    /**
     * 返回数据
     * @param $data
     * @param string $type
     */
    public function returnData($data, $type = 'json') {
        $format = request('request.format');
        if (empty($format)) {
            $format = $type;
        }
        $callback = request('request.callback', 'jsonp' . time(), 'trim');
        $format = strtolower($format);
        $charset = request('request.charset', 'utf-8');
        //$charset = 'utf-8';
        switch ($format) {
            case 'jsonp' :
                call_user_func_array([$this, 'return' . ucfirst($format)], [$data, $callback, $charset]);
                break;
            case 'json':
            default:
                call_user_func_array([$this, 'return' . ucfirst($format)], [$data, $charset]);
        }
    }

    /**
     * 返回JSON数据
     * @param array $data
     * @param string $charset
     */
    public function returnJson($data = [], $charset = "utf-8") {
        header("Content-Type: application/json;charset={$charset};");
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    /**
     * 返回JSONP数据
     * @param array $data
     * @param string $callback
     * @param string $charset
     */
    public function returnJsonp($data = [], $callback = 'q', $charset = "utf-8") {
        header("Content-Type: application/javascript;charset={$charset};");
        echo $callback . '(' . json_encode($data) . ');';
    }
}