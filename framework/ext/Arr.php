<?php

namespace framework\ext;

class Arr {
    /**
     * 定义了一系列用于简化数组操作的函数
     * 从数组中删除空白的元素（包括只有空白字符的元素）
     *
     * @param array $arr
     * @param boolean $trim
     */
    public static function removeEmpty(& $arr, $trim = true) {
        foreach ($arr as $key => $value) {
            if (is_array($value)) {
                if (empty($value)) {
                    unset($arr[$key]);
                } else {
                    self::removeEmpty($arr[$key]);
                }
            } else {
                $value = trim($value);
                if ($value == '') {
                    unset($arr[$key]);
                } elseif ($trim) {
                    $arr[$key] = $value;
                }
            }
        }
    }

    /**
     * 从一个二维数组中返回指定键的所有值
     *
     * @param array $arr
     * @param string $col
     *
     * @return array
     */
    public static function colValues(& $arr, $col) {
        $ret = array();
        foreach ($arr as $row) {
            if (isset($row[$col])) {
                $ret[] = $row[$col];
            }
        }
        return $ret;
    }

    /**
     * 将一个二维数组转换为 hashmap
     *
     * 如果省略 $valueField 参数，则转换结果每一项为包含该项所有数据的数组。
     *
     * @param array $arr
     * @param string $keyField
     * @param string $valueField
     *
     * @return array
     */
    public static function toHashMap(& $arr, $keyField, $valueField = null) {
        $ret = array();
        if (!empty($arr)) {
            if ($valueField) {
                foreach ($arr as $row) {
                    $ret[$row[$keyField]] = $row[$valueField];
                }
            } else {
                foreach ($arr as $row) {
                    $ret[$row[$keyField]] = $row;
                }
            }
        }
        return $ret;
    }

    /**
     * 将一个二维数组按照指定字段的值分组
     *
     * @param array $arr
     * @param string $keyField
     *
     * @return array
     */
    public static function groupBy(& $arr, $keyField) {
        $ret = array();
        foreach ($arr as $row) {
            $key = $row[$keyField];
            $ret[$key][] = $row;
        }
        return $ret;
    }

    /**
     * 将一个平面的二维数组按照指定的字段转换为树状结构
     *
     * 当 $returnReferences 参数为 true 时，返回结果的 tree 字段为树，refs 字段则为节点引用。
     * 利用返回的节点引用，可以很方便的获取包含以任意节点为根的子树。
     *
     * @param array $arr 原始数据
     * @param string $fid 节点ID字段名
     * @param string $fparent 节点父ID字段名
     * @param string $fchildrens 保存子节点的字段名
     * @param boolean $returnReferences 是否在返回结果中包含节点引用
     *
     * return array
     */
    public static function toTree($arr, $fid, $fparent = 'parent_id',
                           $fchildrens = 'childrens', $returnReferences = false) {
        $pkvRefs = array();
        foreach ($arr as $offset => $row) {
            $pkvRefs[$row[$fid]] =& $arr[$offset];
        }

        $tree = array();
        foreach ($arr as $offset => $row) {
            $parentId = $row[$fparent];
            if ($parentId) {
                if (!isset($pkvRefs[$parentId])) {
                    continue;
                }
                $parent =& $pkvRefs[$parentId];
                $parent[$fchildrens][] =& $arr[$offset];
            } else {
                $tree[] =& $arr[$offset];
            }
        }
        if ($returnReferences) {
            return array('tree' => $tree, 'refs' => $pkvRefs);
        } else {
            return $tree;
        }
    }

    /**
     * 将树转换为平面的数组
     *
     * @param array $node
     * @param string $fchildrens
     *
     * @return array
     */
    public static function treeToArray(& $node, $fchildrens = 'childrens') {
        $ret = array();
        if (isset($node[$fchildrens]) && is_array($node[$fchildrens])) {
            foreach ($node[$fchildrens] as $child) {
                $ret = array_merge($ret, self::treeToArray($child, $fchildrens));
            }
            unset($node[$fchildrens]);
            $ret[] = $node;
        } else {
            $ret[] = $node;
        }
        return $ret;
    }

    /**
     * 根据指定的键对数组排序
     *
     * 用法：
     * @code php
     * $rows = array(
     *     array('id' => 1, 'value' => '1-1', 'parent' => 1),
     *     array('id' => 2, 'value' => '2-1', 'parent' => 1),
     *     array('id' => 3, 'value' => '3-1', 'parent' => 1),
     *     array('id' => 4, 'value' => '4-1', 'parent' => 2),
     *     array('id' => 5, 'value' => '5-1', 'parent' => 2),
     *     array('id' => 6, 'value' => '6-1', 'parent' => 3),
     * );
     *
     * $rows = array_column_sort($rows, 'id', SORT_DESC);
     * dump($rows);
     * // 输出结果为：
     * // array(
     * //   array('id' => 6, 'value' => '6-1', 'parent' => 3),
     * //   array('id' => 5, 'value' => '5-1', 'parent' => 2),
     * //   array('id' => 4, 'value' => '4-1', 'parent' => 2),
     * //   array('id' => 3, 'value' => '3-1', 'parent' => 1),
     * //   array('id' => 2, 'value' => '2-1', 'parent' => 1),
     * //   array('id' => 1, 'value' => '1-1', 'parent' => 1),
     * // )
     * @endcode
     *
     * @param array $array 要排序的数组
     * @param string $keyname 排序的键
     * @param int $sortDirection 排序方向
     *
     * @return array 排序后的数组
     */
    public static function sort($array, $keyname, $sortDirection = SORT_ASC) {
        return self::multiSort($array, array($keyname => $sortDirection));
    }

    /**
     * 将一个二维数组按照多个列进行排序，类似 SQL 语句中的 ORDER BY
     * 实现字母和数字混排
     *
     * 用法：
     * @code php
     * $rows = Arr::multiSort($rows, array(
     *     'parent' => SORT_ASC,
     *     'name' => SORT_DESC,
     * ));
     * @endcode
     *
     * @param array $rowset 要排序的数组
     * @param array $args 排序的键
     *
     * @return array 排序后的数组
     */
    public static function multiSort($rowset, $args) {
        $sortArray = array();
        $sortRule = '';
        foreach ($args as $sortField => $sortDir) {
            foreach ($rowset as $offset => $row) {
                $sortArray[$sortField][$offset] = $row[$sortField];
            }
            $sortRule .= '$sortArray[\'' . $sortField . '\'], ' . $sortDir . ', ';
        }
        if (empty($sortArray) || empty($sortRule)) {
            return $rowset;
        }
        eval('Arr::multiSort(' . $sortRule . '$rowset);');
        return $rowset;
    }

    /**
     * 数组排序中含字母和数字，导致排序混乱问题
     * 该函数是为了xy轴排序做准备
     * 判断是否以#开头，#开头和数字排序的话，#的排在前面
     * 其他的计算数字的具体值排序。1-1/16是1又16分之1，所以实际计算是1+1/16
     */
    public static function sortPrepare($rowset, $keyname) {
        $yz_arr = array(
            '#0000' => '0.5334',
            '#000' => '0.8636',
            '#00' => '1.1938',
            '#0' => '1.5240',
            '#1' => '1.8542',
            '#2' => '2.1844',
            '#3' => '2.5146',
            '#4' => '2.8448',
            '#5' => '3.1750',
            '#6' => '3.5052',
            '#8' => '4.1656 ',
            '#10' => '4.8260',
            '#12' => '5.4864',
        );
        $retArray = $rowset;
        if (empty($rowset)) {
            return $rowset;
        } else {
            foreach ($rowset as $offset => $row) {
                $tmp_val = $row[$keyname];
                //第一个字母
                $fc = substr($tmp_val, 0, 1);
                if (in_array($tmp_val, array_keys($yz_arr))) {
                    $float_val = $yz_arr[$tmp_val];
                } else {
                    //除去字母，计算数值的具体值
                    //$patterns = array('/M|ST|PG|#|Φ/i', '/-/');
                    $patterns = array('/[^0-9\-\.\/]/i', '/-/');
                    $replace = array('', '+');
                    $float_val = preg_replace($patterns, $replace, $tmp_val);
                    @eval("\$float_val=" . $float_val . ";");
                }

                //数组增加2个字段，供排序用
                $retArray[$offset][$keyname . '_fc'] = ($fc == '#' ? 1 : 0);
                $retArray[$offset][$keyname . '_fv'] = $float_val;
            }
        }
        return $retArray;
    }

}