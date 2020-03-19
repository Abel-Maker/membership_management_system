<?php
$dir = dirname(__FILE__);
$files = array('rewrite.php', 'upload.php', 'cache.php');
$db = include $dir . '/db.php';

//基础配置
$config = array(
    //版本信息
    'MI_VER'   => '1.0.0',
    'MI_TIME'   => '20170108',
    //当前状态
    'ENV' => 'dev',
    //index.php里根据域名设置的
    'APP' => APP ?: 'www',
    //是否显示调试工具
    'SHOW_PAGE_TRACE' => false,
    //数据库
    'DB' => array(
        'default' => $db,
    ),

    //session和cookie前缀
    'COOKIE_PREFIX' => 'mi_',
    'SAFE_KEY' => 'Iam$Ji#Mi*BaBa', // 加密码
    'DEV_REG_KEY' => 'AwAOTw4MVR8MTQ', //设备注册的加密码，Util::encrypt('JackDevReg', config('SAFE_KEY'), 3);

    //static和上传文件的前缀地址
    'STATIC_URL' => 'http://s.uchat.com.cn/static',
    'FILE_URL' => 'http://s.uchat.com.cn',
);

foreach ($files as $value) {
    $array = include $dir . '/' . $value;
    $config = array_merge($config, $array);
}

return $config;
