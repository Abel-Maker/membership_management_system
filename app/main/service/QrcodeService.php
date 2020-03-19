<?php

namespace app\main\service;

use Endroid\QrCode\ErrorCorrectionLevel;
//use Endroid\QrCode\LabelAlignment;
use Endroid\QrCode\QrCode;

/**
 * 机器二维码
 */
class QrcodeService {

    //机器序列号二维码
    public function sn($sn) {
        if (empty($sn)) {
            return false;
        }

        $file = WWW_PATH . '/upload/machine/' . $sn . '.png';
        if(!file_exists($file)) {
            // Create a basic QR code
            $qrCode = new QrCode($sn);
            $qrCode->setSize(360);

            // Set advanced options
            $qrCode->setWriterByName('png');
            $qrCode->setMargin(10);
            $qrCode->setEncoding('UTF-8');
            $qrCode->setErrorCorrectionLevel(ErrorCorrectionLevel::HIGH);
            $qrCode->setForegroundColor(['r' => 0, 'g' => 0, 'b' => 0, 'a' => 0]);
            $qrCode->setBackgroundColor(['r' => 255, 'g' => 255, 'b' => 255, 'a' => 0]);
            //$qrCode->setLabel('Scan the code', 16, __DIR__.'/../assets/fonts/noto_sans.otf', LabelAlignment::CENTER);
            $qrCode->setLogoPath(WWW_PATH . '/public/images/jack.png');
            $qrCode->setLogoWidth(100);
            $qrCode->setRoundBlockSize(true);
            $qrCode->setValidateResult(false);

            $qrCode->writeFile($file);
        }


        return true;
    }

}
