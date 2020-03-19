$.ajaxSetup({
    cache: false
});

(function ($) {
    //表单处理
    $.fn.miForm = function (options) {
        var defaults = {
            postFun: {},
            returnFun: {}
        };
        options = $.extend(defaults, options);
        this.each(function () {
            //表单提交
            var form = this;
            Do.ready('form', 'weui', function () {
                //表单验证
                $(form).Validform({
                    ajaxPost: true,
                    postonce: true,
                    tipSweep: true,

                    tiptype: function (msg, o, cssctl) {
                        if (!o.obj.is("form")) {
                            if (o.type == 3) {
                                $.alert(o.obj.attr('errormsg'));
                            }
                        }
                    },

                    callback: function (data) {
                        if (data.status == 1) {
                            //成功返回
                            if ($.isFunction(options.returnFun)) {
                                options.returnFun(data);
                            } else {
                                if (data.url == null || data.url == '' || data.url == 'dialog') {
                                    $.alert(data.info, function () {
                                        window.location.reload();
                                    });

                                } else {
                                    $.alert(data.info, function () {
                                        window.location.href = data.url;
                                    });
                                }
                            }
                        } else {
                            //失败返回
                            $.alert(data.info);
                        }
                    }
                });

                //下拉赋值
                var assignObj = $(form).find('.js-assign');
                assignObj.each(function () {
                    var assignTarget = $(this).attr('target');
                    $(this).change(function () {
                        $(assignTarget).val($(this).val());
                    });
                });

            });
        });
    };

    //输入框字数显示，并显示还能输入多少
    $.fn.showLimitLength = function (options) {
        var defaults = {
            maxLen: 200
        };
        options = $.extend(defaults, options);
        $(this).keyup(function () {
            var len = this.value.length;
            if (len > options.maxLen) {
                $.alert('最多只能输入' + options.maxLen + '个字符')
            } else {
                $(this).next().html('<span>' + len + '</span>/' + options.maxLen);
            }
        });
    };

    //多图上传
    $.fn.miMultiUpload = function (options) {
        var defaults = {
            uploadUrl: miConfig.uploadUrl,
            uploadParams: function () {
            },
            complete: function () {
            },
            type: ''
        };
        options = $.extend(defaults, options);
        this.each(function () {
            var upButton = $(this), field = upButton.data('field'), imageBox = $('#' + field), max = options.maxImage || 9;

            $('.weui-uploader__info').html('0/' + max);

            /*创建上传*/
            Do.ready('webuploader', 'sortable', function () {
                var uploader = WebUploader.create({
                    swf: miConfig.baseDir + 'webuploader/Uploader.swf',
                    server: options.uploadUrl,
                    pick: upButton,
                    fileVal: 'image',
                    resize: false,
                    auto: true,
                    accept: {
                        title: '指定格式文件',
                        extensions: options.type
                    }
                });

                //上传开始
                uploader.on('uploadStart', function (file) {
                    uploader.option('formData', $.extend(options.uploadParams(), {
                        'water_status': $('#water_status').val(),
                        'thumb_status': $('#thumb_status').val()
                    }));

                    upButton.attr('disabled', true);
                    //upButton.find('.webuploader-pick span').text(' 等待');
                });
                //上传完毕
                uploader.on('uploadSuccess', function (file, data) {
                    upButton.attr('disabled', false);
                    if (data.status) {
                        htmlList(data.data);
                        options.complete(data.data);
                    } else {
                        alert(data.info);
                    }
                });
                uploader.on('uploadError', function (file) {
                    alert('文件上传失败');
                });
                uploader.on('uploadComplete', function (file) {
                    //图片排序
                    imageBox.sortable();

                    imageCount();
                });
                imageBox.sortable();

                //处理上传列表
                function htmlList(file) {
                    var html = '<div class="mi-multi-image">' +
                        '<li class="weui-uploader__file" style="background-image:url(' + file.url_s + ')">' +
                        '<b class="del" title="删除"></b></li>' +
                        '<input name="' + field + '[url][]" type="hidden" class="input" value="' + file.url + '" />' +
                        '<input name="' + field + '[title][]" type="hidden" class="input" value="' + file.title + '" />' +
                        '</div>';
                    imageBox.append(html);
                };

                function imageCount() {
                    var num = imageBox.children('.mi-multi-image').length;
                    if(num >= max) {
                        $('.weui-uploader__input-box').hide()
                    } else {
                        $('.weui-uploader__input-box').show()
                    }

                    $('.weui-uploader__info').html(num + '/' + max);
                };

                //处理删除
                imageBox.on('click', '.del', function () {
                    $(this).parents('.mi-multi-image').remove();
                    imageBox.sortable();
                    imageCount();
                });
            });
        });
    };
    //图表插件
    $.fn.miChart = function (options) {
        var defaults = {
            data: []
        }
        var options = $.extend(defaults, options);
        var chartObj = this;
        Do.ready('chartJs', function () {
            var ctx = $(chartObj).get(0).getContext("2d");
            var chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                multiTooltipTemplate: "<%= value %>",
            };
            var myLineChart = new Chart(ctx).Line(options.data, chartOptions);
        });
    };
    //表单页面处理
    $.fn.miFormPage = function (options) {
        var defaults = {
            uploadUrl: miConfig.uploadUrl,
            editorUploadUrl: miConfig.editorUploadUrl,
            uploadComplete: function () {
            },
            uploadParams: function () {
            },
            uploadType: [],
            postFun: {},
            returnUrl: '',
            returnFun: {},
            form: true
        };
        options = $.extend(defaults, options);
        this.each(function () {
            var form = this;
            form = $(form);
            //表单处理
            if (options.form) {
                form.miForm({
                    postFun: options.postFun,
                    returnUrl: options.returnUrl,
                    returnFun: options.returnFun
                });
            }
            //多图片上传
            if (form.find(".js-multi-upload").length > 0) {
                form.find('.js-multi-upload').miMultiUpload({
                    type: 'jpg,png,gif,bmp,jpeg',
                    uploadUrl: options.uploadUrl,
                    complete: options.uploadComplete,
                    uploadParams: options.uploadParams
                });
            }
            //输入框字数限制
            if (form.find(".js-textarea").length > 0) {
                form.find('.js-textarea').showLimitLength();
            }
            //时间，日期
            if (form.find(".js-day").length > 0) {

            }
            if (form.find(".js-time").length > 0) {
                form.find(".js-time").datetimePicker();
            }

        });
    };
    //由于jquery-weui中toptip在pc端和安卓手机端浏览器无效果，自定义
    var timeout = null;
    $.fn.msg = function (options) {
        var defaults = {
            type: 'toptip',
            time: 2000,
            mode: 'success',
            text: '操作成功'
        };
        options = $.extend(defaults, options || {});
        var bgColor = options.mode === 'success' ? '#4CD964' : '#F6383A';
        clearTimeout(timeout);
        switch (options.type) {
            case 'toptip':
                var target = $('<div></div>');
                target.text(options.text);
                target.addClass('toptip').css('background-color', bgColor);
                $(this).append(target);
                target.show('fast');
                timeout = setTimeout(function () {
                    target.hide('fast');
                    target.hide('fast');
                }, options.time);
                break;
        }
    };

})(jQuery);