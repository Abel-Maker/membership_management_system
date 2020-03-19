<?php
return array(
    /* 上传设置 */
    'UPLOAD_SIZE' => 10,
    'UPLOAD_EXTS' => 'jpg,gif,bmp,png',
    //开启缩略图
    'THUMB_STATUS' => 1,
    //1=等比例缩放，2=缩放后填充，3=居中裁剪，4=左上角裁剪，5=右下角裁剪，6=固定尺寸缩放
    'THUMB_TYPE' => 1,
    'THUMB_WIDTH' => 800,
    'THUMB_HEIGHT' => 800,
    //水印位置记录下，实际在系统设置里每个用户自己设置
    //1=左上角水印，2=上居中水印，3=右上角水印，4=左居中水印
    //5=居中水印，6=右居中水印，7=左下角水印，8=下居中水印，9=右下角水印
    'WATER_STATUS' => 1
);