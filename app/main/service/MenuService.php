<?php

namespace app\main\service;
/**
 * 后台菜单接口
 */
class MenuService {
    /**
     * 获取菜单结构
     */
    public function getMainMenu() {

//        return array(
//            'index' => array(
//                'name' => '首页',
//                'icon' => 'home',
//                'menu' => array(
//                    'home' => array(
//                        'name' => '管理首页',
//                        'icon' => 'home',
//                        'url' => url('main/Index/home'),
//                    )
//                )
//            ),
//
//            //
//            'records' => array(
//                'name' => '外卖',
//                'icon' => 'list',
//                'menu' => array(
//                    'all' => array(
//                        'name' => '外卖管理',
//                        'icon' => 'book',
//                        'url' => url('main/records/index'),
//                    )
//                )
//            ),
//
//            //
//            'changelog' => array(
//                'name' => '待办',
//                'icon' => 'check-square-o',
//                'menu' => array(
//                    'todoList' => array(
//                        'name' => '待办管理',
//                        'icon' => 'reorder',
//                        'url' => url('main/ChangeLog/index'),
//                    )
//                )
//            ),
//
//
//            //文章
//            'article' => array(
//                'name' => '文章',
//                'icon' => 'bookmark',
//                'menu' => array(
//                    'article' => array(
//                        'name' => '文章管理',
//                        'icon' => 'files-o',
//                        'url' => url('main/Article/index'),
//                    ),
//                    'article_cate' => array(
//                        'name' => '文章分类',
//                        'icon' => 'sitemap',
//                        'url' => url('main/ArticleCate/index'),
//                    ),
//                )
//            ),
//
//            //财务
//            /*'finance' => [
//                'name' => '财务',
//                'icon' => 'cny',
//                'order' => '6',
//                'menu' => [
//                    'accountlog' => [
//                        'name' => '充值查询',
//                        'icon' => 'cny',
//                        'url' => url('main/AccountLogController/index', ['t' => 'recharge']),
//                    ],
//                    'recharge' => [
//                        'name' => '微信充值',
//                        'icon' => 'wechat',
//                        'url' => url('main/Recharge/index'),
//                    ],
//                    'account' => [
//                        'name' => '财务报表',
//                        'icon' => 'bar-chart-o',
//                        'url' => url('main/AccountLogController/report'),
//                    ],
//                    'piece' => [
//                        'name' => '计件查询',
//                        'icon' => 'sliders',
//                        'url' => url('main/Piece/index'),
//                    ],
//                    'statistic' => [
//                        'name' => '数据统计',
//                        'icon' => 'database',
//                        'url' => url('main/Statistic/index'),
//                    ]
//                ]
//            ],*/
//
//
//            //系统设置
//            'base' => array(
//                'name' => '基础',
//                'icon' => 'cog',
//                'menu' => array(
//                    'group' => array(
//                        'name' => '部门管理',
//                        'icon' => 'group',
//                        'url' => url('main/AdminDept/index'),
//                    ),
//                    'user' => array(
//                        'name' => '员工管理',
//                        'icon' => 'user',
//                        'url' => url('main/AdminUser/index'),
//                    ),
//                    'region' => array(
//                        'name' => '地区管理',
//                        'icon' => 'map-marker',
//                        'url' => url('main/Region/index'),
//                    ),
//                    'file' => array(
//                        'name' => '文件管理',
//                        'icon' => 'file-image-o',
//                        'url' => url('main/File/index', array('t' => 'erp')),
//                    ),
//                    'cache' => array(
//                        'name' => '缓存管理',
//                        'icon' => 'upload',
//                        'url' => url('main/Manage/cache'),
//                    ),
//                )
//            ),
//
//            //日志
//            'log' => array(
//                'name' => '日志',
//                'icon' => 'file-text-o',
//                'order' => 100,
//                'menu' => array(
//                    'login' => array(
//                        'name' => '登录日志',
//                        'icon' => 'info-circle',
//                        'url' => url('AdminLog/index'),
//                    ),
//                    'api' => array(
//                        'name' => 'API调用日志',
//                        'icon' => 'code',
//                        'url' => url('ApiLog/index'),
//                    ),
//                    'wechat' => array(
//                        'name' => '微信回调日志',
//                        'icon' => 'link',
//                        'url' => url('WechatApiLog/index'),
//                    ),
//                    'notice' => array(
//                        'name' => '提醒通知日志',
//                        'icon' => 'bullhorn',
//                        'url' => url('NoticeLog/index'),
//                    ),
//                )
//            ),
//        );
        return array(
/*            'home' => [
                'tips' => '首页',
                'icon' => '&#xe6da;',
                'url' => url('index/home')
            ],*/
            'index' => [
                'tips' => '会员管理',
                'icon' => '&#xe6b8;',
                'menu' => [
                    [
                        'tips' => '会员列表',
                        'url' => url('User/index')
                    ]
                ]
            ],
            'accountlog' => [
                'tips' => '财务管理',
                'icon' => '&#xe723;',
                'menu' => [

                    [
                        'tips'=>'充值日志',
                        'url'=>url('AccountLog/index',['t'=>'recharge'])
                    ],
                    [
                        'tips'=>'消费日志',
                        'url'=>url('AccountLog/index',['t'=>'consume'])
                    ],
                    [
                        'tips'=>'财务报表',
                        'url'=>url('AccountLog/chart')
                    ],
                ]
            ],
            'base' => [
                'tips' => '系统管理',
                'icon' => '&#xe6ae;',
                'menu' => [
                    [
                        'tips'=>'员工管理',
                        'url'=>url('AdminUser/index')
                    ],
                    [
                        'tips'=>'登录日志',
                        'url'=>url('AdminLog/index')
                    ],
                ]
            ],
        );
    }
}
