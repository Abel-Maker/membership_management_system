function getQueryString(name) {
    var result = window.location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

function msg (text) {
    Do.ready('base', function () {
        $('body').msg({
            text: text,
            mode: 'error'
        })
    });
}

//合作方式选择
$('#type').change(function (e) {
    var type = $(this).val();
    switch (type) {
        case '0':
            $('#rent, #payment, .empty-rent').hide();
            break;
        case '1':
            if($('.weui-navbar__item.active').hasClass('repeater')) {
                $('.empty-rent').removeClass('sr-only').show();
                $('#rent').hide();
            }else {
                $('#rent').removeClass('sr-only').show();
                $('.empty-rent').hide();
            }
            $('#payment').hide();
            break;
        case '2':
            $('#rent, .empty-rent').hide();
            $('#payment').removeClass('sr-only').show();
            break;
    }
});

$('.weui-navbar__item:not(.back)').on('click', function () {
    $(this).addClass('active');
    $(this).siblings().removeClass('active');
   $('#type').triggerHandler('change');
});

//标准分期和自定义分期切换
$('.weui-check__label').on('click', function () {
    var payment_type = $(this).find('input[name="radio"]').attr('id');
    if(payment_type === 'custom-radio') {
        $('#custom-payment').removeClass('sr-only').show();
        $('#standard-payment').hide();
    }else if (payment_type === 'standard-radio') {
        $('#standard-payment').removeClass('sr-only').show();
        $('#custom-payment').hide();
    }
});
// 日期选择初始化
function initDate() {
    $('input[data-toggle="date"]').each(function() {
        $(this).calendar();
    });
}
initDate();

//计数器
var MAX = 99, MIN = 1;
$('.weui-count__decrease').click(function (e) {
    var $input = $(e.currentTarget).parent().find('.weui-count__number');
    var number = parseInt($input.val() || "0") - 1;
    if (number < MIN) number = MIN;
    $input.val(number)
});
$('.weui-count__increase').click(function (e) {
    var $input = $(e.currentTarget).parent().find('.weui-count__number');
    var number = parseInt($input.val() || "0") + 1;
    if (number > MAX) number = MAX;
    $input.val(number)
});

//增加分期期数
$('#custom-payment').on('click', '.add-payment', function () {
    var index = $('#custom-payment .weui-cells').length + 1;
    var str = '<div class="weui-cells__title">第'+ index +'期' +
        '<button class="btn-circle add-payment">+</button></div>' +
        '<div class="weui-cells"><div class="weui-cell"><div class="weui-cell__bd">'+ $.i18n.prop('repaymentAmount') +'</div>' +
        '<div class="weui-cell__ft">￥<input class="weui-input form-control" type="number" pattern="[0-9.]*" placeholder="0.00"></div>' +
        '</div><div class="weui-cell"><div class="weui-cell__bd">'+ $.i18n.prop('repaymentDate') +'</div><div class="weui-cell__ft">' +
        '<input type="text" data-toggle=\'date\' class="weui-input form-control"/></div></div></div>';
    $(this).remove();
    $('#custom-payment').prepend(str);
    initDate();
});

//批量增加机器
$('#content').on('click', '#add-machine', function () {
    var str = '<div class="weui-cell machine-add">' +
        '<div class="weui-cell__hd"><div class="weui-label"></div></div>' +
        '<div class="weui-cell__bd"><input class="weui-input form-control" name="sn" placeholder="'+ $.i18n.prop('snHint') +'"></div>' +
        '<div class="weui-cell__ft"><button class="btn-circle del-machine" onclick="deleteMachineLine(this)">-</button></div>' +
        '</div>';
    $('.machine-add:last').after(str);
});

function deleteMachineLine (r) {
    var cell = $(r).parents('.weui-cell');
    cell.remove();
}

//提交按钮
$('#submit').on('click', function () {
    var json = {}, key = null, flag = true, sn = [];
    var info_flag = $('.flag').text();
    var machine_id = $('#machine_id').text();
    var url = info_flag === '0' ? '/index.php?r=agent/machine/add' : '/index.php?r=agent/machine/edit';

    $('#content .form-control:not("#custom-payment .form-control")').each(function () {
       if(!$(this).is(':hidden')) {
           if(!$(this).val()) {
               if($(this).attr('name') === 'sn') {
                   msg($.i18n.prop('snHint'));
               }else {
                   msg($.i18n.prop('pleaseInput') + ':' + $(this).parent().prev('div').text());
               }
               flag = false;
               return false;
           }else if ($(this).attr('name') === 'sn') {
               sn.push($(this).val());
           }else {
               json[$(this).attr('name')] = $(this).val();
           }
       }
    });

    json.company_id = $('#company_id').val();
    json.sn = sn;

    if(!flag) {//当存在空时阻止提交
        return false;
    }

//    中继器无法租赁
    if(!$('.empty-rent').is(':hidden')) {
        msg($.i18n.prop('selectOtherMethod'));
        return false;
    }

//    租赁机器
//    判断起始日期和截止日期
    if(json.bg_time && json.end_time) {
        var d = parseInt(new Date(json.end_time) - new Date(json.bg_time));
        if (d < 0) {
            msg($.i18n.prop('wrongEndDate'));
            return false;
        }else {
            json.bg_time = json.bg_time.replace(/\//g, '-');
            json.end_time = json.end_time.replace(/\//g, '-');
            json.is_rent = '1';
            if(parseInt(json.min_num) > 0) {
                json['is_min'] = '1';
            }
         }
    }else if (json.bg_time || json.end_time) {
        msg($.i18n.prop('fixTime'));
        return false;
    }

//    分期信息
    var standard = $('#standard-payment'), custom = $('#custom-payment');
    if(custom.is(':hidden') && !standard.is(':hidden')) {
    //    标准分期
        if(!/^([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0|[1-9]\d*)$/.test(parseFloat($.trim(json.total_price)))) {
            msg($.i18n.prop('wrongAmount'));
            return false;
        }
        var pay = [], i = 1,
            amount = Math.ceil(parseFloat($.trim(json.total_price)) / parseInt(json.count_num)),
            time_space = parseInt($.trim(json.time_space)),
            start_date = json.start_date;

        start_date =  new Date(start_date);
        for (i; i <= parseInt(json.count_num); i ++) {
            start_date.setDate(start_date.getDate() + time_space);
            pay.push({
                index: i,
                amount: amount,
                repay_time: dateFormat(new Date(start_date))
            })
        }

        delete json['time_space'];
        delete json['start_date'];
        delete json['total_price'];
        delete json['count_num'];

    }else if (!custom.is(':hidden') && standard.is(':hidden')) {
    //    自定义
        var amount = 0,
            repay_time = null,
            len = custom.find('.weui-cells').length,
            index = 0;
            pay = [],
            i = len,
            obj = {};
        for (i; i>0; i--) {
            index = len - i;
            amount = $.trim(custom.find('.weui-cells:eq('+ (i-1) + ')').find('input[type="number"]').val());
            repay_time = custom.find('.weui-cells:eq('+ (i-1) + ')').find('input[type="text"]').val();

            if(amount && repay_time) {
                if(!/^([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0|[1-9]\d*)$/.test(amount)) {
                    msg($.i18n.prop('No') + i + ':' + $.i18n.prop('wrongAmountOfPeriod'));
                    flag = false;
                    return false;
                }else {
                    obj = {
                        amount: amount,
                        repay_time: repay_time.replace(/\//g, '-'),
                        index: index + 1
                    };
                    if(info_flag === '1' && machine_id) obj['order_id'] = custom.find('.weui-cells__title:eq('+ (i-1) + ')').find('.order_id').val();
                    pay.push(obj);
                }
            }else if (amount || repay_time) {
                msg($.i18n.prop('No') + i + ':' + $.i18n.prop('fixPeriodInfo'));
                flag = false;
                return false;
            }
            if(i === 1 && len > 0) {
                if(pay) {
                    if(pay.length <= 0) {
                        msg($.i18n.prop('atLeastOnePeriod'));
                        return false;
                    }
                }
            }
        }
        if(!flag) {
            return false;
        }
    }
    if(pay) {
        json.staging = pay;
    }

    if(info_flag === '1' && machine_id) {//修改
        json.machine_id = machine_id;

    }

    //添加子设备
    var repeater_id = $('.repeater-machine-id').text();
    if (repeater_id) {
        json.relay_machine_id = repeater_id;
        url = '/index.php?r=agent/machine/addBinding';
    }

    console.log('json', json);
    $.ajax({
       url: url,
       type: 'POST',
       data: {machine: json},
       success: function (res) {
           if(res.status) {
               if(repeater_id) {
                   location.href = '/?r=agent/machine/detail&machine_id='+ repeater_id;
               }else {
                   location.href = '/?r=agent/machine/index&t=list';
               }
           }else {
               msg(res.info);
           }
       },
        error: function (e) {
            console.log('error', e);
            msg($.i18n.prop('tryLater'));
        }
    });
});

function dateFormat (time) {
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var date = time.getDate();

    month = month >= 10 ? month : '0' + month;
    date = date >= 10 ? date : '0' + date;
    return year + "-" + month + "-" + date;
}

wx.ready(function () {
    wx.checkJsApi({
        jsApiList: ['scanQRCode'],
        success: function (res) {
            $('body').append(JSON.stringify(res));
            $('.scanCode').show();
        }
    });
    //点击按钮扫描二维码
    $('.scanCode').on('click', function () {
        msg('点击');
        var _this = this;
        wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            desc: 'scanQRCode desc',
            scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
                msg('扫描' + res.result);
                _this.parents('.weui-cell').find('input[name="sn"]').val(res.resultStr);
            }
        });
    });
});

wx.error(function (res) {
    console.log('出错了' + res);
});