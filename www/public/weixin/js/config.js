//form
Do.add('form', {
    path: miConfig.baseDir + 'form/Validform.min.js'
});
//weui
Do.add('weui', {
    path: miConfig.weuiDir + 'js/jquery-weui.min.js'
});

Do.add('swiper', {
    path: miConfig.weuiDir + 'js/swiper.min.js'
});

//webuploader
Do.add('webuploaderCss', {
    path: miConfig.weixinDir + 'webuploader/webuploader.css',
    type: 'css'
});
Do.add('webuploader', {
    path: miConfig.weixinDir + 'webuploader/webuploader.withoutimage.min.js',
    requires: ['webuploaderCss']
});

//sortable
Do.add('sortable', {
    path: miConfig.baseDir + 'sortable/jquery.sortable.js'
});
//图表
Do.add('chartJs', {
    path: miConfig.baseDir + 'chart/Chart.min.js'
});
Do.add('chart', {
    path: miConfig.baseDir + 'chart/jquery.easypiechart.min.js'
});
//base载入
Do.add('base', {
    path: miConfig.weixinDir + 'weixin.js'
});

//调试函数
function debug(obj) {
    if (typeof console != 'undefined') {
        console.log(obj);
    }
}