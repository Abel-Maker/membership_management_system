<?php

namespace app\base\model;

use framework\ext\UploadFile;
use framework\ext\image\Image;
/**
 * 上传模块
 */
class UploadModel extends BaseModel {

    //上传数据
    public function upload($config = []) {
        $baseConfig = load_config(CONFIG_PATH . 'upload.php');
        $config = array_merge((array)$baseConfig, (array)$config);
        if (empty($config['DIR_NAME'])) {
            $config['DIR_NAME'] = date('Ymd');
        }
        $path = UPLOAD_DIR . '/' . $config['DIR_NAME'] . '/';
        //上传
        $upload = new UploadFile();
        $upload->savePath = WWW_PATH . $path;
        $upload->allowExts = explode(',', $config['UPLOAD_EXTS']);
        $upload->maxSize = intval($config['UPLOAD_SIZE']) * 1024 * 1024;
        $upload->saveRule = 'md5_file';
        if (!$upload->upload()) {
            $this->error = $upload->getErrorMsg();
            return false;
        }
        //上传信息
        $info = $upload->getUploadFileInfo();
        $info = current($info);
        //设置基本信息
        $file = $path . $info['savename'];
        $fileUrl = ROOT_URL . $file; //返回的地址
        $filePath = pathinfo($info['savename']);
        $fileName = $filePath['filename'];
        $fileExt = $info['extension'];
        $fileTitle = mb_substr($info['name'], 0, strlen($info['name']) - strlen($info['extension']) - 1);

        //设置保存文件名(针对图片有效，如统一保存为jpg)
        if ($config['SAVE_EXT']) {
            $saveName = $fileName . '.' . $config['SAVE_EXT'];
        } else {
            $saveName = $info['savename'];
        }

        //处理图片数据
        $imgType = array('jpg', 'jpeg', 'png', 'gif', 'bmp');
        //设置缩图和水印
        if (in_array(strtolower($fileExt), $imgType) && $config['THUMB_STATUS']) {
            //设置图片驱动
            $image = new Image();

            //读取文件后缀
            $pos = strrpos($saveName, '.');
            $tmpName = substr($saveName, 0, $pos);

            //150x150
            $image->open(WWW_PATH . $file);
            $thumb150 = $path . $tmpName . '_150x150.' . $fileExt;
            $image->thumb(150, 150, 2)->save(WWW_PATH . $thumb150);

            //300x300
            $image->open(WWW_PATH . $file);
            $thumb300 = $path . $tmpName . '_300x300.' . $fileExt;
            $image->thumb(300, 300, 2)->save(WWW_PATH . $thumb300);

            //原图用800以内的缩略图代替
            $image->open(WWW_PATH . $file);
            $image->thumb(800, 800, 1)->save(WWW_PATH . $file);
        }
        //读取缩略图的文件大小
        $size = filesize(WWW_PATH . $file);

        //录入文件信息
        $data = array();
        $data['url'] = $fileUrl;
        $data['title'] = $fileTitle;
        $data['ext'] = $fileExt;
        //$data['size'] = $info['size'];
        $data['size'] = $size;
        $data['time'] = time();
        return $data;
    }

    //获取错误信息
    public function getErrorMsg() {
        return $this->error;
    }

}
