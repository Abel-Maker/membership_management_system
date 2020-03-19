<?php

namespace app\main\model;
/**
 * 后台菜单
 */
class MenuModel {

    //获取所有菜单
    public function getMenu($menuPurview = []) {

        //menu写死在service/MenuService.php里
        $menu = target('main/Menu', 'service')->getMainMenu();

        //排序菜单
        foreach ((array)$menu as $topKey => $top) {
            if (!empty($top['menu']) && is_array($top['menu'])) {
                if (!empty($menuPurview) && $top['menu']) {
                    $subMenu = array();
                    foreach ($top['menu'] as $key =>$vo) {
                        if (in_array($topKey . '_' . $key, $menuPurview) || is_root()) {
                            $subMenu[] = $vo;
                        }
                    }
                    $top['menu'] = $subMenu;
                }
                $menu[$topKey]['menu'] = $top['menu'];
            }
        }
        $menuList = $menu;

        return $menuList;
    }

    //读取所有模块权限
    public function getAllPurview() {
        $list = get_all_service('Purview', 'Main');
        if (empty($list)) {
            return $list;
        }
        return $list;
    }

    //读取当前app（main）的所有权限
    public function getPurview() {
        $list = target('Purview', 'service')->getMainPurview();
        if (empty($list)) {
            return $list;
        }
        return $list;
    }

}