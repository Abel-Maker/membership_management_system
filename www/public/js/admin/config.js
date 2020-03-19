//base载入
Do.add('base', {
    path: miConfig.baseDir + 'admin/base.js'
});

//图表
Do.add('chartJs', {
    path: miConfig.baseDir + 'chart/Chart.min.js'
});
Do.add('chart', {
    path: miConfig.baseDir + 'chart/jquery.easypiechart.min.js'
});

//editor
Do.add('editorCss',{
    path : miConfig.baseDir + 'keditor/themes/default/default.css',
    type : 'css'
});
Do.add('editorSrc', {
    path: miConfig.baseDir + 'keditor/kindeditor-all-min.js',
    requires : ['editorCss']
});
Do.add('editor', {
    path: miConfig.baseDir + 'keditor/lang/zh-CN.js',
    requires: ['editorSrc']
});


//form
Do.add('form', {
    path: miConfig.baseDir + 'form/Validform.min.js'
});

//dialog
Do.add('dialog', {
    path : miConfig.baseDir + 'dialog/layer.min.js'
});
Do.add('layer', {
    path : miConfig.baseDir + 'layer/layer.js'
});

Do.add('layer3', {
    path : miConfig.baseDir + 'layer3.1.1/layer.js'
});

//tip
Do.add('tipsCss', {
    path: miConfig.baseDir + 'tips/toastr.css',
    type : 'css'
});
Do.add('tips', {
    path: miConfig.baseDir + 'tips/toastr.min.js',
    requires : ['tipsCss']
});

//time
Do.add('timeCss', {
    path: miConfig.baseDir + 'time/jquery.datetimepicker.css',
    type: 'css'
});
Do.add('time', {
    path: miConfig.baseDir + 'time/jquery.datetimepicker.js',
    requires: ['timeCss']
});

//webuploader
Do.add('webuploaderCss', {
    path: miConfig.baseDir + 'webuploader/webuploader.css',
    type: 'css'
});
Do.add('webuploader', {
    path: miConfig.baseDir + 'webuploader/webuploader.withoutimage.min.js',
    requires: ['webuploaderCss']
});

//sortable
Do.add('sortable', {
    path: miConfig.baseDir + 'sortable/jquery.sortable.js'
});

//selectbox
Do.add('selectbox', {
    path: miConfig.baseDir + 'jquery.selectboxes.js'
});

//tagsinput
Do.add('jstagsCss', {
    path: miConfig.baseDir + 'tagsinput/jquery.tagsinput.min.css',
    type: 'css'
});
Do.add('jstags', {
    path: miConfig.baseDir + 'tagsinput/jquery.tagsinput.min.js',
    requires: ['jstagsCss']
});

//copy
Do.add('clipboard', {
    path: miConfig.baseDir + 'clipboard.min.js'
});


//调试函数
function debug(obj) {
    if (typeof console != 'undefined') {
        console.log(obj);
    }
}