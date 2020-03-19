<?php

namespace app\main\model;
/**
 * 图表
 */
class ChartModel {

    /**
     * 折线图表样式
     * @param string $type 类型
     * @return array 信息
     */
    public function getChart($type = 'blue') {
        $style = array();
        switch ($type) {

            case 'gray':
                $style['fillColor'] = "rgba(220,220,220,0.2)";
                $style['strokeColor'] = "rgba(220,220,220,1)";
                $style['pointColor'] = "rgba(220,220,220,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(220,220,220,1)";
                break;
            case 'green':
                $style['fillColor'] = "rgba(102,205,170,0.2)";
                $style['strokeColor'] = "rgba(102,205,170,1)";
                $style['pointColor'] = "rgba(102,205,170,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(102,205,170,1)";
                break;
            case 'orange':
                $style['fillColor'] = "rgba(233,150,122,0.2)";
                $style['strokeColor'] = "rgba(233,150,122,1)";
                $style['pointColor'] = "rgba(233,150,122,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(233,150,122,1)";
                break;
            case 'red':
                $style['fillColor'] = "rgba(233,150,122,0.2)";
                $style['strokeColor'] = "rgba(233,150,122,1)";
                $style['pointColor'] = "rgba(233,150,122,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(233,150,122,1)";
                break;
            case 'blue':
            default:
                $style['fillColor'] = "rgba(151,187,205,0.2)";
                $style['strokeColor'] = "rgba(151,187,205,1)";
                $style['pointColor'] = "rgba(151,187,205,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(151,187,205,1)";
                break;
        }
        return $style;
    }

    public function getColor($color = 'blue') {
        switch ($color) {
            case 'red':
                $style = [
                    'backgroundColor' => 'rgb(255, 99, 132)',
                    'borderColor' => 'rgb(255, 99, 132)',
                ];
                break;
            case 'green':
                $style = [
                    'backgroundColor' => 'rgb(75, 192, 192)',
                    'borderColor' => 'rgb(75, 192, 192)',
                ];
                break;
            case 'yellow':
                $style = [
                    'backgroundColor' => 'rgb(255, 205, 86)',
                    'borderColor' => 'rgb(255, 205, 86)',
                ];
                break;
            case 'purple':
                $style = [
                    'backgroundColor' => 'rgb(153, 102, 255)',
                    'borderColor' => 'rgb(153, 102, 255)',
                ];
                break;
            case 'gray':
                $style = [
                    'backgroundColor' => 'rgb(201, 203, 207)',
                    'borderColor' => 'rgb(201, 203, 207)',
                ];
                break;
            case 'blue':
            default:
                $style = [
                    'backgroundColor' => 'rgb(54, 162, 235)',
                    'borderColor' => 'rgb(54, 162, 235)',
                ];
                break;
        }
        return $style;
    }

    /**
     * 折线图表样式
     * @param string $type 类型
     * @return array 信息
     */
    public function getBarChart($type = 'blue') {
        $style = array();
        switch ($type) {
            case 'gray':
                $style['fillColor'] = "rgba(220,220,220,0.2)";
                $style['strokeColor'] = "rgba(220,220,220,1)";
                $style['pointColor'] = "rgba(220,220,220,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(220,220,220,1)";
                break;
            case 'green':
                $style['fillColor'] = "rgba(102,205,170,0.2)";
                $style['strokeColor'] = "rgba(102,205,170,1)";
                $style['pointColor'] = "rgba(102,205,170,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(102,205,170,1)";
                break;
            case 'orange':
                $style['fillColor'] = "rgba(255,159,64,0.2)";
                $style['strokeColor'] = "rgba(255,159,64,1)";
                $style['pointColor'] = "rgba(255,159,64,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(255,159,64,1)";
                break;
            case 'red':
                $style['fillColor'] = "rgba(255,99,132,0.2)";
                $style['strokeColor'] = "rgba(255,99,132,1)";
                $style['pointColor'] = "rgba(255,99,132,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(255,99,132,1)";
                break;
            case 'purple':
                $style['fillColor'] = "rgba(153,102,255,0.2)";
                $style['strokeColor'] = "rgba(153,102,255,1)";
                $style['pointColor'] = "rgba(153,102,255,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(153,102,255,1)";
                break;
            case 'yellow':
                $style['fillColor'] = "rgba(255,206,86,0.2)";
                $style['strokeColor'] = "rgba(255,206,86,1)";
                $style['pointColor'] = "rgba(255,206,86,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(255,206,86,1)";
                break;
            default:
                $style['fillColor'] = "rgba(151,187,205,0.2)";
                $style['strokeColor'] = "rgba(151,187,205,1)";
                $style['pointColor'] = "rgba(151,187,205,1)";
                $style['pointStrokeColor'] = "#fff";
                $style['pointHighlightFill'] = "#fff";
                $style['pointHighlightStroke'] = "rgba(151,187,205,1)";
                break;
        }
        return $style;
    }

}