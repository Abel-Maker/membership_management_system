$.ajaxSetup({
    cache: false
});

(function ($) {
    //弹窗
    $('.J_dialog').on('click', function () {
        var url = $(this).attr('href') + '&timestamp=' + new Date().getTime(), title = $(this).attr('title'),
            w = $(this).data('w'), h = $(this).data('h');
        w = typeof (w) == "undefined" ? "820" : w;
        h = typeof (h) == "undefined" ? "500" : h;
        top.layer.open({
            type: 2,
            title: title,
            shadeClose: true,
            shade: 0.3,
            maxmin: true,
            area: [w + 'px', h + 'px'],
            content: url
        });
        return false;
    });

    //省市切换
    Do.ready('selectbox', function () {
        $('.js-city').on('change', function () {
            var id = $(this).attr('id'), province = $('#province'), city = $('#city'), district = $('#district'),
                val = $(this).val();
            if (val != '') {
                switch (id) {
                    case 'country':
                        province.removeOption(/./);
                        province.ajaxAddOption("index.php?r=www/Region/ajaxget", {pid: $(this).val()}, false);
                        city.removeOption(/./);
                        district.removeOption(/./);
                        break;
                    case 'province':
                        city.removeOption(/./);
                        city.ajaxAddOption("index.php?r=www/Region/ajaxget", {pid: $(this).val()}, false);
                        district.removeOption(/./);
                        break;
                    case 'city':
                        district.removeOption(/./);
                        district.ajaxAddOption("index.php?r=www/Region/ajaxget", {pid: $(this).val()}, false);
                        break;
                }
            }
        });
    });

    //表格处理
    $.fn.miTable = function (options) {
        var defaults = {
            selectAll: '#selectAll',
            selectSubmit: '#selectSubmit',
            selectAction: '#selectAction',
            deleteUrl: '',
            actionUrl: '',
            actionParameter: function () {
            }
        }
        var options = $.extend(defaults, options);
        this.each(function () {
            var table = this;
            var id = $(this).attr('id');
            //处理多选单选,id方式
            $(options.selectAll).click(function () {
                $(table).find("[name='id[]']").each(function () {
                    if ($(this).prop("checked")) {
                        $(this).prop("checked", false);
                    } else {
                        $(this).prop("checked", true);
                    }
                })
            });

            //class 方式多选,class方式,可以设置多个
            $('.selectAll').click(function () {
                $(table).find("[name='id[]']").each(function () {
                    if ($(this).prop("checked")) {
                        $(this).prop("checked", false);
                    } else {
                        $(this).prop("checked", true);
                    }
                })
            });

            //处理批量提交
            $(options.selectSubmit).click(function () {
                Do.ready('tips', 'dialog', function () {
                    //记录获取
                    var ids = new Array();
                    $(table).find("[name='id[]']").each(function () {
                        if ($(this).prop("checked")) {
                            ids.push($(this).val());
                        }
                    })
                    toastr.options = {
                        "positionClass": "toast-bottom-right"
                    }
                    if (ids.length == 0) {
                        toastr.warning('请先选择操作记录');
                        return false;
                    }
                    //操作项目
                    var dialog = layer.confirm('你确认要进行本次批量操作！', function () {
                        var parameter = $.extend({
                                ids: ids,
                                type: $(options.selectAction).val()
                            },
                            options.actionParameter()
                        );
                        $.post(options.actionUrl, parameter, function (json) {
                            if (json.status) {
                                toastr.success(json.info);
                                setTimeout(function () {
                                    window.location.reload();
                                }, 2000);
                            } else {
                                toastr.warning(json.info);
                            }
                        }, 'json');
                        layer.close(dialog);
                    });

                });
            });

            //处理删除
            $(table).find('.js-del').click(function () {
                var obj = this;
                var div = $(obj).parent().parent();
                var url = $(obj).attr('url');
                if (url == '' || url == null || url == 'undefined') {
                    url = options.deleteUrl;
                }
                operat(
                    obj,
                    url,
                    function () {
                        div.remove();
                    },
                    function () {
                    }
                );
            });

            //切换状态，打勾的 soitif
            $(table).find('.js-toggle').on('click', function () {
                var url = $(this).data('url'), id = $(this).data('id'),
                    val = ($(this).attr("src").match(/yes.gif/i)) ? 0 : 1, field = $(this).data('field'),
                    img_obj = this;
                if (url == '' || url == null || url == 'undefined') {
                    url = options.toggleUrl;
                }
                $.post(url, {id: id, val: val, field: field, is_ajax: 1}, function (res) {
                    if (res.error == 0) {
                        img = (res.message > 0) ? '/public/images/yes.gif' : '/public/images/no.gif';
                        $(img_obj).attr("src", img);
                    } else {
                        alert(res.message);
                    }
                }, 'json');
                return false;
            });

            //编辑指定内容 soitif
            $(table).find('.js-edit').on('click', function () {
                var url = $(this).data('url'), id = $(this).data('id'), field = $(this).data('field');
                if (url == '' || url == null || url == 'undefined') {
                    url = options.editUrl;
                }

                if ($(this).children()[0] && $(this).children()[0].tagName.toLowerCase() == 'input') {
                    return;
                }

                var sp = $(this);
                var revert = $(this).html();

                /* 创建一个输入框 */
                var txt = document.createElement("INPUT");
                var oldval = (revert == 'N/A') ? '' : revert;
                var pbox = this;
                txt.value = oldval;
                txt.style.width = ($(this).width() + 12) + "px";
                $(txt).data('oldval', oldval);

                $(this).html('');
                $(this).append(txt);
                $(this).removeClass('mi-edit');
                txt.focus();

                /* 编辑区输入事件处理函数 */
                $(txt).keypress(function () {
                    if (window.event.keyCode == 13) {
                        $(txt).blur();
                        return false;
                    }

                    if (window.event.keyCode == 27) {
                        $(txt).parent().html(revert);
                    }
                });

                /* 编辑区失去焦点的处理函数 */
                $(txt).blur(function () {
                    val = unescape($.trim($(txt).val()));
                    if (val.length > 0 && val != oldval) {
                        $.post(url, {id: id, val: val, field: field, is_ajax: '1'}, function (res) {
                            if (res.error == 0) {
                                $(txt).parent().html(res.message);
                                $(pbox).addClass('mi-edit');
                            } else {
                                alert(res.message);
                            }
                        }, 'json');
                    } else {
                        $(txt).parent().html(oldval);
                        $(pbox).addClass('mi-edit');
                    }
                })
            });

            //处理其他动作
            $(table).find('.js-action').click(function () {
                var obj = this;
                var div = $(obj).parent().parent();
                var url = $(obj).attr('url');
                operat(
                    obj,
                    url,
                    function () {
                        var success = $(obj).attr('success');
                        if (success) {
                            eval(success);
                        }
                    },
                    function () {
                        var failure = $(obj).attr('failure');
                        if (failure) {
                            eval(failure);
                        }
                    }
                );
            });

            //处理动作
            function operat(obj, url, success, failure) {
                Do.ready('tips', 'dialog', function () {
                    var text = $(obj).attr('title');
                    var dialog = layer.confirm('你确认执行' + text + '操作？', function () {
                        var dload = layer.load('操作执行中，请稍候...');
                        $.post(url, {data: $(obj).data('id')},
                            function (json) {
                                layer.close(dload);
                                layer.close(dialog);
                                if (json.status) {
                                    toastr.success(json.info);
                                    success();
                                } else {
                                    toastr.warning(json.info);
                                    failure();
                                }
                            }, 'json');
                    });
                });
            }

            //处理编辑
            $(table).find('.table_edit').blur(function () {
                var obj = this;
                var data = $(obj).attr('data');
                var url = $(obj).attr('url');
                if (url == '' || url == null || url == 'undefined') {
                    url = options.editUrl;
                }
                Do.ready('tips', function () {
                    $.post(url, {
                            data: $(obj).attr('data'),
                            name: $(obj).attr('name'),
                            val: $(obj).val(),
                        },
                        function (json) {
                            if (json.status) {
                                toastr.success(json.info);
                            } else {
                                toastr.warning(json.info);
                            }
                        }, 'json');
                });
            });
        });
    };

    //表单处理
    $.fn.miForm = function (options) {
        var defaults = {
            postFun: {},
            returnFun: {}
        }
        var options = $.extend(defaults, options);
        this.each(function () {
            //表单提交
            var form = this;
            Do.ready('form', 'dialog', function () {
                $(form).Validform({
                    ajaxPost: true,
                    postonce: true,
                    tiptype: function (msg, o, cssctl) {
                        if (!o.obj.is("form")) {
                            //设置提示信息
                            var objtip = o.obj.siblings(".input-note");
                            if (o.type == 2) {
                                //通过
                                var className = ' ';
                                $('#tips').html('');
                                objtip.next('.js-tip').remove();
                                objtip.show();
                            }
                            if (o.type == 3) {
                                //未通过
                                var html = '<div class="alert alert-yellow"><strong>注意：</strong>您填写的信息未通过验证，请检查后重新提交！</div>';
                                $('#tips').html(html);
                                var className = 'check-error';
                                if (objtip.next('.js-tip').length == 0) {
                                    objtip.after('<div class="input-note js-tip">' + msg + '</div>');
                                    objtip.hide();
                                }
                            }
                            //设置样式
                            o.obj.parents('.form-group').removeClass('check-error');
                            o.obj.parents('.form-group').addClass(className);
                        }
                    },
                    callback: function (data) {
                        layer.load('表单正在处理中，请稍等 ...');
                        if (data.status == 1) {
                            //成功返回
                            if ($.isFunction(options.returnFun)) {
                                options.returnFun(data);
                            } else {
                                if (data.url == null || data.url == '' || data.url == 'dialog') {
                                    //不带连接
                                    layer.alert(data.info, 1, function () {
                                        if (data.url == 'dialog') {
                                            window.location.reload();
                                            top.frames["mi-iframe"].document.location.reload();
                                            //layer.parent.close();
                                        } else {
                                            window.location.reload();
                                        }
                                    });
                                } else {
                                    //带连接
                                    $.layer({
                                        shade: [0],
                                        area: ['auto', 'auto'],
                                        dialog: {
                                            msg: data.info,
                                            btns: 2,
                                            type: 4,
                                            btn: ['继续操作', '返回'],
                                            yes: function () {
                                                window.location.reload();
                                            },
                                            no: function () {
                                                window.location.href = data.url;
                                            }
                                        }
                                    });
                                }
                            }
                        } else {
                            //失败返回
                            layer.alert(data.info, 8);
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

    //时间插件
    $.fn.miTime = function (options) {
        var defaults = {
            lang: 'ch'
        };
        var options = $.extend(defaults, options);
        this.each(function () {
            var id = this;
            Do.ready('time', function () {
                $(id).datetimepicker(options);
            });
        });
    };

    //tags插件
    $.fn.miTags = function (options) {
        this.each(function () {
            var id = this;
            Do.ready('jstags', function () {
                $(id).tagsInput({width: 'auto', defaultText: $(id).data('text')});
            });
        });
    };

    //省市区
    $.fn.miCity = function (options) {
        this.each(function () {
            var id = this;
            Do.ready('selectbox', function () {
                $(id).ajaxAddOption("{url('region/ajaxget')}&" + "pid=" + $(id).data('pid'), {}, $(id).data('sel'));
                $(id).on('change', function () {
                    var sub = $(id).data('sub');
                    if (sub != 'undefined') {
                        $('#' + sub).removeOption(/./);
                        $('#' + sub).ajaxAddOption("{url('region/ajaxget')}&" + "pid=" + $('#province').val(), {}, this.data('sel'));
                    }
                });
            });
        });
    };

    //上传调用
    $.fn.miFileUpload = function (options) {
        var defaults = {
            uploadUrl: miConfig.uploadUrl,
            type: '',
            uploadParams: function () {
            },
            complete: function () {
            }
        };
        options = $.extend(defaults, options);
        this.each(function () {
            var upButton = $(this), field = $(this).data('field'), urlVal = upButton.data('field'),
                tipId = urlVal + '_tip',
                fileVal = typeof (upButton.data('type')) == "undefined" ? urlVal : upButton.data('type');
            urlVal = $('#' + urlVal);

            var preview = upButton.data('preview');
            preview = $('#' + preview);
            /* 图片预览 */
            preview.click(function () {
                if (urlVal.val() == '') {
                    alert('没有发现已上传图片！');
                } else {
                    window.open(urlVal.val());
                }
                return;
            });
            /*创建上传*/
            Do.ready('webuploader', function () {
                var uploader = WebUploader.create({
                    swf: miConfig.baseDir + 'webuploader/Uploader.swf',
                    server: options.uploadUrl,
                    pick: {
                        id: upButton,
                        multiple: false
                    },
                    resize: false,
                    fileVal: fileVal,
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
                        'thumb_status': $('#thumb_status').val(),
                        'old_file': $('#file').val()
                    }));
                    upButton.attr('disabled', true);
                    upButton.find('.webuploader-pick span').text(' 等待');
                });
                //上传完毕
                uploader.on('uploadSuccess', function (file, data) {
                    upButton.attr('disabled', false);
                    upButton.find('.webuploader-pick span').text(' 上传');
                    if (data.status) {
                        //制版文件
                        //if (fileVal == 'cad' || fileVal == 'mb' || fileVal == 'ota') {
                        if (fileVal != 'image') {
                            $('#' + tipId).html('上传成功');
                            $('#size').val(data.data.size);
                            $('#filename').val(data.data.title);
                        }
                        urlVal.val(data.data.url);
                        options.complete(data.data);
                    } else {
                        alert(data.info);
                    }
                });
                uploader.on('uploadError', function (file) {
                    alert('文件上传失败');
                });
            });
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
        }
        var options = $.extend(defaults, options);
        this.each(function () {
            var upButton = $(this);
            //var dataName = upButton.attr('data');
            var dataName = upButton.data('field');
            var div = $('#' + dataName);
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
                    upButton.find('.webuploader-pick span').text(' 等待');
                });
                //上传完毕
                uploader.on('uploadSuccess', function (file, data) {
                    upButton.attr('disabled', false);
                    upButton.find('.webuploader-pick span').text(' 上传');
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
                    div.sortable();
                });
                /*
                 //处理图片预览
                 function zoomPic() {
                 xOffset = 10;
                 yOffset = 30;
                 var maxWidth = 400;
                 div.on('mouseenter', '.pic img', function (e) {
                 $("body").append("<div id='imgZoom'><img class='pic' src='" + $(this).attr('src') + "' /></div>");
                 $("#imgZoom").css("top", (e.pageY - xOffset) + "px").css("left", (e.pageX + yOffset) + "px").fadeIn("fast");
                 var imgZoom = $("#imgZoom").find('.pic');
                 imgZoom.css("width", 300).css("height", 200);
                 });
                 div.on('mouseleave', '.pic img', function (e) {
                 $("#imgZoom").remove();
                 });
                 div.on('mousemove', '.pic img', function (e) {
                 $("#imgZoom").css("top", (e.pageY - xOffset) + "px").css("left", (e.pageX + yOffset) + "px");
                 });
                 }
                 zoomPic();
                 */
                div.sortable();

                //处理上传列表
                function htmlList(file) {
                    var html = '<div class="media radius clearfix">\
                    <a href="javascript:;"><img src="' + file.url_s + '" ></a>\
					<b class="del" title="删除"></b>\
                    <div class="media-body">\
                    <input name="' + dataName + '[url][]" type="hidden" class="input" value="' + file.url + '" />\
                    <input name="' + dataName + '[title][]" type="text" class="input" value="' + file.title + '" />\
                    </div>\
                    </div>\
                    ';
                    div.append(html);
                }

                //处理删除
                div.on('click', '.del', function () {
                    debug('xxxxxx');
                    $(this).parent().remove();
                });
            });
        });
    };

    //编辑器调用
    $.fn.miEditor = function (options) {
        //console.log(options);
        var defaults = {
            uploadUrl: miConfig.editorUploadUrl,
            uploadParams: function () {
            },
            config: {}
        };
        options = $.extend(defaults, options);
        var uploadParams = {
            session_id: miConfig.sessId
        };
        //console.log($.extend(uploadParams, options.uploadParams()));
        this.each(function () {
            var id = this;
            var idName = $(this).attr('id') + '_editor';
            Do.ready('editor', function () {
                //编辑器
                var editorConfig = {
                    allowFileManager: false,
                    uploadJson: options.uploadUrl,
                    filterMode: false,
                    extraFileUploadParams: $.extend(uploadParams, options.uploadParams()),
                    afterBlur: function () {
                        this.sync();
                    },
                    //编辑器默认是总体，这样4个空格是2个字，前台设置好class="content-text"也设置为宋体
                    cssData: 'img{max-width:100%}.ke-content{font-family:SimSun;}',
                    //缩进，取消了，这样可以通过空格缩进
                    //'.ke-content p{text-indent:2em;}',
                    //宽度在页面设置
                    //,width: '100%'
                };
                editorConfig = $.extend(editorConfig, options.config);
                //console.log(editorConfig);
                var str = idName + ' = KindEditor.create(id, editorConfig);';
                eval(str);
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
    //柱状图
    $.fn.miBarChart = function (options) {
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
            var myBarChart = new Chart(ctx).Bar(options.data, chartOptions);
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
        }
        var options = $.extend(defaults, options);
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
            //文件上传
            if (form.find(".js-file-upload").length > 0) {
                form.find('.js-file-upload').miFileUpload({
                    type: '*',
                    uploadUrl: options.uploadUrl,
                    complete: options.uploadComplete,
                    uploadParams: options.uploadParams
                });
            }
            //图片上传
            if (form.find(".js-img-upload").length > 0) {
                form.find('.js-img-upload').miFileUpload({
                    type: 'jpg,png,gif,bmp,jpeg',
                    uploadUrl: options.uploadUrl,
                    complete: options.uploadComplete,
                    uploadParams: options.uploadParams
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
            //编辑器
            if (form.find(".js-editor").length > 0) {
                form.find('.js-editor').miEditor({
                    uploadUrl: options.editorUploadUrl,
                    uploadParams: options.uploadParams,
                    config: options.config
                });
            }

            //时间选择
            if (form.find(".js-time").length > 0) {
                //form.find('.js-time').miTime();
                form.find('.js-time').miTime({format: 'Y-m-d H:i'});
            }
            if (form.find(".js-day").length > 0) {
                form.find('.js-day').miTime({timepicker: false, format: 'Y-m-d'});
            }

            //jstags
            if (form.find(".js-tags").length > 0) {
                $('.js-tags').miTags();
            }

        });
    };

})(jQuery);