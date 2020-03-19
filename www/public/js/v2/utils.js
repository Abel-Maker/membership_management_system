define(function(require) {


    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var emojiRanges = [
        // U+1F300 to U+1F3FF
        '\ud83c[\udf00-\udfff]',
        // U+1F400 to U+1F64F
        '\ud83d[\udc00-\ude4f]',
        // U+1F680 to U+1F6FF
        '\ud83d[\ude80-\udeff]',
        // 其他特殊字符
        '[\u2600-\u27bf]'
    ]
    var emojiReg = new RegExp(emojiRanges.join('|'));

    require('notify');

    return {
        /**
         *    是否是分销系统
         */
        isFenxiao: function() {
            return window.location.search.indexOf('from=fenxiao') >= 0
                || window.location.search.indexOf('from=fx') >= 0
                || window.location.host.indexOf('fx') >= 0
                || window.location.search.indexOf('from=fx_supplier') >= 0
                || window.location.search.indexOf('from=fx_seller') >= 0;
        },
        insertFenxiaoInto: function(data) {
            if (this.isFenxiao()) {
                data.is_fenxiao = true;
            } else {
                data.is_fenxiao = false;
            }
        },
        getFenxiaoType: function() {
            if (window.location.search.indexOf('type=seller') >= 0 ||
                window.location.search.indexOf('fx_seller') >= 0 ||
                window.location.hash.indexOf('seller') >= 0) {
                return 'seller';
            } else if (window.location.search.indexOf('type=supplier') >= 0 ||
                window.location.search.indexOf('fx_supplier') >= 0 ||
                window.location.hash.indexOf('supplier') >= 0) {
                return 'supplier';
            } else {
                return 'supplier';
            }
        },
        getFenxiaoTypeName: function() {
            var type = this.getFenxiaoType();
            if (type === 'seller') {
                return '分销商';
            } else if (type === 'supplier') {
                return '供货商';
            } else {
                return '';
            }
        },
        /**
         * 通用的ajax
         * 要求服务器返回json格式
         * @param  {String|Object}      url     URL
         * @param  {Object|undefined}   options 选项
         * @return {Promise}
         * @example
         * var Utils = require('core/utils');
         *
         * // GET
         * Utils.ajax(url)
         *     .done(function(data){
         *         // ...
         *     })
         *     .fail(function(msg){
         *         // ...
         *     });
         *
         * // POST
         * Utils.ajax(url, {
         *     method: 'POST',
         *     data: someData
         * }).done(function(data) {
         *     // ...
         * }).fail(function(msg) {
         *     // ...
         * })
         */
        ajax: function(url, options) {
            var def = $.Deferred();

            if (typeof url === 'object') {
                options = url;
                url = undefined;
            }

            options = _.defaults(options || {}, {
                dataType: 'json'
            });

            var success;
            var error;
            var overrideBackboneSync = options.overrideBackboneSync;

            if (overrideBackboneSync) {
                success = options.success;
                error = options.error;
                delete options.success;
                delete options.error;
                delete options.overrideBackboneSync;
            }

            var csrf_token = (window._global || {}).csrf_token;

            if (csrf_token) {
                options.data = _.extend({
                    csrf_token: csrf_token
                }, options.data);
            }

            def.xhr = $.ajax(url, options).done(function(resp, textStatus, jqXHR) {
                if (resp.errcode !== void 0) {
                    resp.code = resp.errcode;
                    resp.msg = resp.errmsg;
                }

                if (+resp.code === 0) {
                    def.resolve(resp.data, resp, jqXHR);
                } else if (resp.code === void 0) { // for old api
                    def.resolve(resp, resp, jqXHR);
                } else {
                    def.reject(resp.msg, resp, jqXHR);
                }
            }).fail(function(jqXHR, msg) {
                var code = 99999;

                if (msg === 'error') {
                    msg = '网络错误'
                }

                msg = msg || '数据错误';

                if (msg === 'parsererror') {
                    msg = window._global.debug ? 'JSON Parse Error' : '请求错误，请稍后重试';
                }

                if (msg === 'abort') {
                    code = -1;
                }

                def.reject(msg, {code: code, msg: msg}, jqXHR);
            });

            if (overrideBackboneSync) {
                def.done(function(data) {
                    success && success(data);
                }).fail(function(data) {
                    error && error(data);
                });
            }

            return def;
        },

        // when all defer finished
        //
        // Utils.whenAll([promise1, promise2, promise3])
        //      .done(fn).fail(fn).always(fn);
        //
        // Utils.whenAll(promise1, promise2, promise3)
        //      .done(fn).fail(fn).always(fn);
        whenAll: function(promises) {
            promises = _.isArray(promises) ? promises : [].slice.call(arguments);

            var total = promises.length;
            var defer = $.Deferred();
            var hasFail = false;

            _.each(promises, function(promise) {
                promise
                    .fail(function() {
                        hasFail = true;
                    })
                    .always(function() {
                        total--;
                        if (total === 0) {
                            hasFail ? defer.reject() : defer.resolve();
                        }
                    })
            });

            return defer.promise();
        },

        validMobile: function(value) {
            return /^((\+86)|(86))?(1)\d{10}$/.test('' + value);
        },

        validPhone: function(value) {
            return /^(\(\d{3,4}\)|\d{3,4}(-|\s)?)?\d{7,8}(-\d{1,4})?$/.test('' + value);
        },

        validPostalCode: function(value) {
            return /^\d{6}$/.test('' + value);
        },

        getFormData: function($form) {
            var unindexed_array = $form.serializeArray();
            var indexed_array = {};

            $.map(unindexed_array, function(n) {
                indexed_array[n.name] = n.value;
            });

            return indexed_array;
        },
        focus: function($el) {
            if (!$el) {
                return;
            }
            var x = $(document).scrollLeft();
            var y = $(document).scrollTop();

            $el.focus();

            window.scrollTo(x, y);
        },
        highlight: function(params, container) {
            if (arguments.length !== 2) {
                console.error('参数错误！');
                return;
            }
            var $container = $(container);

            var found = false;
            $container.find('a').each(function(i, a) {
                var $a = $(a);
                var arr = [];
                if ($a.attr('href').indexOf(params.params) >= 0 && !found) {
                    $a.parents('li').first().addClass('active');
                    found = true;
                } else {
                    arr.push($a);
                }

                _.each(arr, function(item) {
                    item.parents('li').removeClass('active');
                });
            });
        },
        parse: function(response, callback) {
            callback = callback || {};
            if (+response.code === 0) {
                if (_.isFunction(callback.success)) {
                    callback.success(response.data);
                } else {
                    return response.data;
                }
            } else {
                if (_.isFunction(callback.fail)) {
                    callback.fail(response);
                } else {
                    this.errorNotify(response.msg);
                    return;
                }
            }
        },
        // 用户abort ajax请求，不弹出错误。
        userAborted: function(xhr) {
            return xhr.status === 0 || xhr.readyState === 0;
        },
        handleAjaxError: function(callback) {
            var that = this;
            return function(xhr) {
                if (!that.userAborted(xhr)) {
                    if (callback && _.isFunction(callback)) {
                        callback(xhr);
                    } else {
                        that.errorNotify('出错啦，请重试。');
                    }
                }
            };
        },
        // 获取店铺主页等静态地址
        // 店铺主页 type: homepage
        // 会员主页 type: usercenter
        // 会员主页 type: history
        // 签到     type: checkin
        // 联系商家 type: contact
        getStaticUrl: function(type, callback) {
            var that = this;
            if (_.isUndefined(type)) {
                return;
            }

            that.urlData = that.urlData || {};

            that._titleMap = that._titleMap || {
                'homepage': '店铺主页',
                'usercenter': '会员主页',
                'history': '历史消息',
                'cart': '购物车',
                'offlinelist': '网点列表',
                'contact': '联系商家'
            };

            if (that.urlData && that.urlData[type]) {
                return callback(that.urlData[type], that._titleMap[type]);
            }

            $.getJSON(window._global.url.www + '/showcase/shop/url.json', {
                type: type
            }, function(response) {
                if (+response.code === 0) {
                    var result = that.urlData[type] = response.data.short_url;
                    callback(result, that._titleMap[type]);
                } else {
                    that.errorNotify(response.msg || '出错啦。');
                }
            }).fail(function() {
                that.errorNotify('出错啦');
            });
        },
        onlyNumber: function(value, fixed) {
            var number = Number(value);
            if (isNaN(number)) {
                return;
            }
            if (!_.isUndefined(fixed)) {
                return number.toFixed(fixed);
            } else {
                return number;
            }
        },
        fetchTemplateData: function(cb) {
            // cache template Data
            if (this._templateData) {
                this.clearNotify();
                cb(this._templateData);
                return this._templateData;
            }
            var that = this;
            $.getJSON(window._global.url.www + '/showcase/shop/defaultcategorytag.json',
                function(response) {
                    if (+response.code === 0) {
                        that._templateData = response.data;
                        that.clearNotify();
                        cb(that._templateData);
                        return that._templateData;
                    } else {
                        that.errorNotify('获取模板出错，重新试试看。');
                    }
                }
            );
        },
        getTemplateData: function() {
            return this._templateData;
        },
        myriadNum: function(num, unitStr) {
            unitStr = unitStr || 'W';
            return num > 10000 ? (num / 10000).toFixed(1) + unitStr : num;
        },
        /**
         * 判断屏幕是否为 retina
         * @return {[type]} [description]
         */
        isRetina: (function() {
            return window.devicePixelRatio > 1;
        })(),
        getTimestamp: function(date) {
            var _d;

            if (typeof date === 'string') {
                _d = new Date(date);
            } else if (typeof date === 'object') {
                _d = date;
            } else {
                _d = new Date();
            }
            return Math.round(_d / 1000);
        },
        /**
         * 获取字符串中文长度
         * @param  {string} str 欲计算长度的字符串
         * @return {number}     字符串长度
         */
        wbLength: function(str) {
            var theLen = 0;
            var count = 0;
            var _str;

            if (typeof str !== 'string') {
                console.error('参数错误。');
                return false;
            }
            if ($.trim(str) === '') {
                _str = '';
            } else {
                _str = str;
            }

            var urlPattern = /http:\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;

            _str = _str.replace(urlPattern, '我是一个超链接占位符');

            _str = _str.replace(/[\x21-\x7f]/gi, function() {
                count++;
                return '';
            });

            theLen = Math.ceil(_str.length + count / 2);
            return theLen;
        },
        /**
         * 获取元素选中的文字
         * @param  {object} ele 原生dom元素对象
         * @return {string}     选中的文字
         */
        getSelectedText: function(el) {
            if (!el) {
                return 'ERROR: el(input or textarea) is need.';
            }
            if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
                return 'ERROR: Only Support input & textarea.';
            }
            if (!window.getSelection) {
                //IE浏览器
                return document.selection.createRange().text;
            } else {
                return el.value.substr(el.selectionStart, el.selectionEnd - el.selectionStart);
            }
        },
        /**
         * 插入文字到光标处
         * @param {String} text 要插入的文字
         */
        insertText: function(el, text) {
            if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
                return;
            }
            if (document.selection) {
                el.focus();
                var cr = document.selection.createRange();
                cr.text = text;
                cr.collapse();
                cr.select();
            } else if (el.selectionStart || el.selectionStart == '0') {
                var start = el.selectionStart;
                var end = el.selectionEnd;

                el.value = el.value.substring(0, start) + text + el.value.substring(end, el.value.length);

                el.selectionStart = el.selectionEnd = start + text.length;

            } else {
                el.value += text;
            }
        },
        toggleBr: function(dateStr, flag) {
            var str = $.trim(dateStr);
            if (!str) {
                return false;
            }
            if (typeof flag === 'undefined' || flag) {
                str = str.replace(' ', '<br />');
            } else {
                str = str.replace('<br />', ' ');
            }
            return str;
        },
        successNotify: function(msg, callback, options) {
            options = options || {};
            if (!_.isFunction(callback) && _.isObject(callback)) {
                _.extend(options, callback);
            }
            this.ensureNotifyEle();

            $('.js-notifications').notify({
                transition: 'fade',
                closable: options.closeable || false,
                message: msg,
                type: 'success',
                fadeOut: {
                    enabled: _.isUndefined(options.fade) ? true : options.fade,
                    delay: options.delay || 2000
                },
                uncloseable: options.uncloseable || false,
                onClosed: function() {
                    if (typeof callback == 'function') {
                        callback();
                    }
                }
            }).show();
        },
        clearNotify: function() {
            $('.js-notifications').empty();
            $('.notify-backdrop').remove();
        },
        ensureNotifyEle: function() {
            if ($('.js-notifications').length <= 0) {
                $('<div class="js-notifications notifications"></div>').appendTo('body');
            }
        },
        errorNotify: function(msg, callback, delay) {
            this.ensureNotifyEle();

            $('.js-notifications').notify({
                transition: 'fade',
                closable: false,
                message: msg,
                type: 'error',
                fadeOut: {
                    enabled: true,
                    delay: 2000
                },
                uncloseable: false,
                onClosed: function() {
                    if (typeof callback == 'function') {
                        callback();
                    }
                }
            }).show();
        },
        getParameterByName: function(name, url) {
            name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
            var regexS = '[\\?&]' + name + '=([^&#]*)';
            var regex = new RegExp(regexS);
            var results = url ? regex.exec(url) : regex.exec(window.location.search);
            if (results === null) {
                return '';
            } else {
                return decodeURIComponent(results[1].replace(/\+/g, ' '));
            }
        },
        getCurrentDay: function(time) {
            time = time || new Date();
            var month = time.getMonth() + 1;
            month = month.toString().length === 1 ? '0' + month : month;
            var day = time.getDate();
            day = day.toString().length === 1 ? '0' + day : day;
            return time.getFullYear() + '-' + month + '-' + day;
        },
        getFullTime: function(time, shortVersion) {
            time = time || new Date();
            shortVersion = shortVersion || false;

            function format(str) {
                return str.toString().length === 1 ? '0' + str : str;
            }
            var month = time.getMonth() + 1;
            month = format(month);
            var day = time.getDate();
            day = format(day);
            var hour = time.getHours();
            hour = format(hour);
            var min = time.getMinutes();
            min = format(min);
            var sec = time.getSeconds();
            sec = format(sec);
            if (shortVersion) {
                return month + '-' + day + ' ' + hour + ':' + min;
            }
            return time.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
        },
        //button状态
        toggleButton: function(action_type, reset) {
            var $btn = $('.form-actions .btn');
            if (!reset) {
                $btn.each(function() {
                    var $this = $(this);
                    if ($this.attr('onclick').indexOf(action_type) >= 0) {
                        $this.button('loading');
                    } else {
                        $this.button('disabling');
                    }
                });
            } else {
                $btn.each(function() {
                    $(this).button('reset');
                });
            }
        },
        //获取url参数名
        getUrlParam: function(paramName, type) {
            var reg = new RegExp('(^|&)' + paramName + '=([^&]*)(&|$)');
            var url = (type === 'router') ? window.location.href : window.location.search;
            var r = url.substr(1).match(reg);
            if (r !== null) {
                return window.decodeURIComponent(r[2]);
            }
            return null;
        },
        // 修改地址栏参数
        editUrlParam: function(param_name, param_val, del_param) {
            var href = window.location.href;
            var vyes = window.location.search;
            var now_href;
            if (vyes !== '') {
                var r;
                var rtop;
                var rend;
                r = vyes.search(param_name);
                if (r != -1) {
                    rtop = vyes.substr(0, r);
                    rend = vyes.substr(r);
                    var r2 = rend.search('&');
                    if (r2 != -1) {
                        rend = rend.substr(r2);
                        now_href = window.location.pathname + rtop + param_name + '=' + param_val + rend;
                    } else {
                        now_href = window.location.pathname + rtop + param_name + '=' + param_val;
                    }
                } else {
                    now_href = href + '&' + param_name + '=' + param_val;
                }
            } else {
                now_href = href + '?' + param_name + '=' + param_val;
            }
            //如果参数的值 param_val 为空，则删除该参数
            if (param_val === '' && del_param) {
                var nr;
                var nrtop;
                var nrend;
                nr = now_href.indexOf(param_name);
                if (nr != -1) {
                    nrtop = now_href.substr(0, nr);
                    nrend = now_href.substr(nr);
                    var nr2 = nrend.search('&');
                    if (nr2 != -1) {
                        nrend = nrend.substr(nr2 + 1);
                        now_href = nrtop + nrend;
                    } else {
                        nrtop = now_href.substr(0, nr - 1);
                        now_href = nrtop;
                    }
                }
            }
            return now_href;
        },
        // 判断是否ie6
        isIE6: function() {
            return ($.browser.msie && $.browser.version == '6.0') ? true : false;
        },
        // 判断是否是苹果手持设备
        isIOS: function() {
            var regex = /(iPad|iPhone|iPod)/gi;
            return regex.test(navigator.userAgent);
        },
        // 判断是否chrome
        isChrome: function() {
            return (window.navigator.userAgent.indexOf('Chrome') !== -1) ? true : false;
        },
        // 去掉首尾空字符
        trim: function(str) {
            return str.replace(/(^\s*)|(\s*$)/g, '');
        },
        // 去掉首空字符
        lTrim: function(str) {
            return str.replace(/(^\s*)/g, '');
        },
        // 去掉尾空字符
        rTrim: function(str) {
            return str.replace(/(\s*$)/g, '');
        },
        isNumber: function(evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;

            if (charCode != 45 && charCode != 46 && charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            return true;
        },
        //获取字符串中文长度
        getStrLength: function(str) {
            str = $.trim(str);
            // var theLen = 0,
            //  strLen = str.replace(/[^\x00-\xff]/g, "**").length;
            // theLen = parseInt(strLen / 2) == strLen / 2 ? strLen / 2 : parseInt(strLen / 2) + 0.5;
            // kdt 统一使用 无论 中英文数字标点 都作为一个 字符 统计
            var theLen = str.length;
            return theLen;
        },
        // 计算字符串中英文长度
        calculateStrLength: function(str) {
            var length = 0;

            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 255) {
                    length += 3;
                } else {
                    length++;
                }
            }

            return length;
        },
        // 截取一定长度的中英文字符串并转全角
        substring4ChAndEn: function(str, maxLength) {
            var strTmp = str.substring(0, maxLength * 2);
            while (this.getStrLength(strTmp) > maxLength) {
                strTmp = strTmp.substring(0, strTmp.length - 1);
            }
            return strTmp;
        },
        // 截取一定长度的字符串
        ellipse: function(str, len) {
            var boolLimit = this.getStrLength(str) * 2 > len;
            if (str && boolLimit) {
                return str.replace(new RegExp('([\\s\\S]{' + len + '})[\\s\\S]*'), '$1...');
            }
            return str;
        },
        // 校验是否为空
        isEmpty: function(v) {
            return $.trim(v) !== '' ? false : true;
        },
        // URL自动补上 'http://'
        urlCheck: function(url) {
            return url.indexOf('://') == -1 ? 'http://' + url : url;
        },
        AddZero: function(num) {
            return (num >= 0 && num < 10) ? '0' + num : num + '';
        },
        twoDecimal: function(num) {
            if (isNaN(num)) {
                return num;
            } else {
                return Number(num).toFixed(2);
            }
        },
        transEntity: function(str) {
            return str.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"');
        },
        // 秒数倒计时 - zhugao
        countdown: function(obj, second, callback) {
            var self = this;
            $(obj).text(second);
            if (--second >= 0) {
                setTimeout(function() {
                    self.countdown(obj, second, callback);
                }, 1000);
            } else {
                callback();
            }
        },
        str_replace: function(search, replace, subject, count) {
            // http://kevin.vanzonneveld.net
            // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   improved by: Gabriel Paderni
            // +   improved by: Philip Peterson
            // +   improved by: Simon Willison (http://simonwillison.net)
            // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
            // +   bugfixed by: Anton Ongson
            // +      input by: Onno Marsman
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +    tweaked by: Onno Marsman
            // +      input by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   input by: Oleg Eremeev
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // +   bugfixed by: Oleg Eremeev
            // %          note 1: The count parameter must be passed as a string in order
            // %          note 1:  to find a global variable in which the result will be given
            // *     example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
            // *     returns 1: 'Kevin.van.Zonneveld'
            // *     example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
            // *     returns 2: 'hemmo, mars'
            var i = 0;
            var j = 0;
            var temp = '';
            var repl = '';
            var sl = 0;
            var fl = 0;
            var f = [].concat(search);
            var r = [].concat(replace);
            var s = subject;
            var ra = Object.prototype.toString.call(r) === '[object Array]';
            var sa = Object.prototype.toString.call(s) === '[object Array]';
            s = [].concat(s);
            if (count) {
                this.window[count] = 0;
            }

            for (i = 0, sl = s.length; i < sl; i++) {
                if (s[i] === '') {
                    continue;
                }
                for (j = 0, fl = f.length; j < fl; j++) {
                    temp = s[i] + '';
                    repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
                    s[i] = (temp).split(f[j]).join(repl);
                    if (count && s[i] !== temp) {
                        this.window[count] += (temp.length - s[i].length) / f[j].length;
                    }
                }
            }
            return sa ? s : s[0];
        },
        addParameter: function(url, obj) {
            var hashArray = url.split('#');
            url = hashArray[0];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if ($.trim(obj[key]) === '') {
                        continue;
                    }
                    if (url.indexOf('?') < 0) {
                        url += '?' + $.trim(key) + '=' + $.trim(obj[key]);
                    } else {
                        var para = {};
                        var temp = url.split('?');
                        /* jshint loopfunc: true */
                        $.each(temp[1].split('&'), function(index, item) {
                            var arr = item.split('=');
                            if ($.trim(arr[1]) === '') {
                                return;
                            }
                            para[arr[0]] = arr[1];
                        });
                        /* jshint loopfunc: true */
                        $.each(obj, function(key, value) {
                            if ($.trim(value) !== '') {
                                para[key] = value;
                            }
                        });

                        var paraArr = [];
                        /* jshint loopfunc: true */
                        $.each(para, function(key, value) {
                            paraArr.push(key + '=' + value);
                        });
                        url = temp[0] + '?' + paraArr.join('&');
                    }
                }
            }
            if (hashArray.length === 2) {
                url += '#' + hashArray[1];
            }

            return url;
        },
        deparam: function(text) {
            // The object to be returned.
            var result = {};
            // Iterate over all key=value pairs.
            if (!text) {
                return result;
            }
            // 去除url字符串里的分组
            text = text.replace(/\|[^:]+:/ig, '&');
            $.each(text.replace(/\+/g, ' ').split('&'), function(index, pair) {
                // The key=value pair.
                var kv = pair.split('=');
                // The key, URI-decoded.
                var key = decodeURIComponent(kv[0]);
                // Abort if there's no key.
                if (!key) {
                    return result;
                }
                // The value, URI-decoded. If value is missing, use empty string.
                var value = decodeURIComponent(kv[1] || '');
                // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
                // into its component parts.
                var keys = key.split('][');
                var last = keys.length - 1;
                // Used when key is complex.
                var i = 0;
                var current = result;

                // If the first keys part contains [ and the last ends with ], then []
                // are correctly balanced.
                if (keys[0].indexOf('[') >= 0 && /\]$/.test(keys[last])) {
                    // Remove the trailing ] from the last keys part.
                    keys[last] = keys[last].replace(/\]$/, '');
                    // Split first keys part into two parts on the [ and add them back onto
                    // the beginning of the keys array.
                    keys = keys.shift().split('[').concat(keys);
                    // Since a key part was added, increment last.
                    last++;
                } else {
                    // Basic 'foo' style key.
                    last = 0;
                }

                if (last) {
                    // Complex key, like 'a[]' or 'a[b][c]'. At this point, the keys array
                    // might look like ['a', ''] (array) or ['a', 'b', 'c'] (object).
                    for (; i <= last; i++) {
                        // If the current key part was specified, use that value as the array
                        // index or object key. If omitted, assume an array and use the
                        // array's length (effectively an array push).
                        key = keys[i] !== '' ? keys[i] : current.length;
                        if (i < last) {
                            // If not the last key part, update the reference to the current
                            // object/array, creating it if it doesn't already exist AND there's
                            // a next key. If the next key is non-numeric and not empty string,
                            // create an object, otherwise create an array.
                            current = current[key] = current[key] || (isNaN(keys[i + 1]) ? {} : []);
                        } else {
                            // If the last key part, set the value.
                            current[key] = value;
                        }
                    }
                } else {
                    // Simple key.
                    if ($.isArray(result[key])) {
                        // If the key already exists, and is an array, push the new value onto
                        // the array.
                        result[key].push(value);
                    } else if (key in result) {
                        // If the key already exists, and is NOT an array, turn it into an
                        // array, pushing the new value onto it.
                        result[key] = [result[key], value];
                    } else {
                        // Otherwise, just set the value.
                        result[key] = value;
                    }
                }
            });

            return result;
        },
        keyCode: {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        },

        /* 三级导航高亮
         * activeElem 传空的话，表示清除当前导航的所有高亮
         */
        navActive: function(activeElem, options) {
            var $uiNav = $('.ui-nav');
            if ($uiNav.length > 0) {
                $('li.active', $uiNav).removeClass('active');
                $(activeElem).addClass('active');
                return;
            }
            var opts = $.extend(options, {
                navBlock: '.third-nav__links'
            });
            $(opts.navBlock).children('li.active').removeClass('active');
            if (activeElem) {
                $(activeElem).addClass('active');
            }
        },

        sidebarNavActive: function(selector) {
            if (window._global.isNewUI) {
                var $nav = $('#app-sidebar #app-second-sidebar');
            } else {
                var $nav = $('aside.ui-sidebar');
            }
            if (!$nav.length) {
                $nav = $('aside#sidebar');
            }
            $nav.find('li.active').removeClass('active');
            $(selector).addClass('active');
        },

        /**
         * 切换三级导航
         * @param  {string} selector 需要被显示的元素的选择器
         * @param  {string} text     如果显示的元素是 breadcrumb 切指定了 text 值，那么该值将作为breadcrumb最后一个span元素的内容
         */
        switchThirdSidebar: function(selector, text) {
            var $thirdSidebar = $('.js-app-third-sidebar');
            $thirdSidebar.find('.ui-nav, .zent-breadcrumb').hide();

            var $el = $thirdSidebar.find(selector);
            $el.show();

            if ($el.hasClass('zent-breadcrumb') && text !== void 0) {
                var $span = $el.find('span:last-child');
                if ($span.length === 1) {
                    $span.html(text)
                }
            }
        },

        // rgb颜色转成十六进制
        rgb2hex: function(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

            function hex(x) {
                return ('0' + parseInt(x, 10).toString(16)).slice(-2);
            }
            return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        },
        // 编辑页底部按钮悬浮
        fixedButton: function(_this, Collection) {
            var $button = $('.app-design .app-actions .form-actions');
            var $field = $('.app-design .pin');
            var calculator = function() {
                var top = $(window).scrollTop() + $(window).height();
                var pin = $field.offset().top + $field.outerHeight() + 80;

                if (top > pin) {
                    $button.css({
                        position: 'static'
                    });
                } else {
                    var bottom;
                    if ($('.js-notify .alert').length > 0 && $('.js-notify').css('display') === 'block') {
                        bottom = $(window).height() - $('.js-notify').position().top;
                    } else {
                        bottom = 0;
                    }
                    $button.css({
                        position: 'fixed',
                        bottom: bottom,
                        width: '850px',
                        boxSizing: 'border-box',
                        zIndex: 100
                    });
                }
            };
            calculator();
            _this.listenTo(Collection, 'done', function() {
                calculator();
            });
            var cb = _.throttle(calculator, 100);

            if ($button.length > 0) {
                window.addEventListener('scroll', cb, false);
            }
        },

        REG: {
            url: /^(https?|ftp|weixin):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
            tel: /^(tel|callto):\/\/[-\s\d,]+$/i
        },

        ANIMITION_END: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

        Cache: {},

        /**
         * 把页面元素的数据更新到视图对应的Model上
         */
        updateModel: function(e) {
            var $target = $(e.target);
            var view = this;
            var type;
            var datatype;
            var name;
            var value;
            var tagName;
            var multiple;

            if (!view.model) return;

            // 数据名称
            // <input name="title">
            // <input name="title[cid]">
            name = ($target.attr('name') || '').split('[')[0];
            if (!name) return;

            // Input Type
            // <input type="checkbox">
            // <input type="radio">
            type = ($target.attr('type') || '').toLowerCase();

            // 数据值
            if (type === 'checkbox') {
                value = $target.prop('checked');
            } else if (type === 'radio') {
                value = view.$('[name=' + $target.attr('name') + ']:checked').val();
            } else {
                value = $target.val();
            }

            // 期望保存的数据类型 number string boolean ...
            // <input data-type="number">
            datatype = ($target.data('type') || '').toLowerCase();
            // 如果没有指定data-type，就使用默认值
            datatype = datatype || (type === 'checkbox' ? 'number' : 'string');
            // number => Number
            datatype = datatype.substring(0, 1).toUpperCase() + datatype.substring(1);

            // 元素类型
            // <input>
            // <select>
            tagName = e.target && e.target.tagName.toLowerCase();
            if (tagName === 'select') {
                // <select multiple>
                multiple = !!$target.attr('multiple');
            }

            // 数据类型转换
            if (_.isFunction(window[datatype])) {
                if (tagName === 'select' && multiple) {
                    if (value !== null) {
                        value = _.map(value, function(_v) {
                            return window[datatype](_v);
                        });
                    }
                } else {
                    value = window[datatype](value);
                }
            }

            // 保存到Model中
            this.model.set(name, value, {
                validate: false
            });

            // 数据校验
            if (this.model.validate && $target.data('validate') !== 'no') {
                var attrs = {};
                attrs[name] = value;
                this.model.validate(attrs);
            }

            // 阻止事件冒泡
            e.stopPropagation();
        },

        handleScroll: function(evt) {
            var $target = $(evt.currentTarget);
            var delta;
            var _ref1;
            var _ref2;

            delta = -((_ref1 = evt.originalEvent) != null ? _ref1.wheelDelta : void 0) || ((_ref2 = evt.originialEvent) != null ? _ref2.detail : void 0);
            if (delta != null) {
                evt.preventDefault();
                if (evt.type === 'DOMMouseScroll') {
                    delta = delta * 40;
                }
                return $target.scrollTop(delta + $target.scrollTop());
            }
        },

        // 检查身份证号码是否合法
        checkIdentifyCard: function(id) {
            function rid18(id) {
                if (!/\d{17}[\dxX]/.test(id)) {
                    return false;
                }
                var modcmpl = function(m, i, n) {
                    return (i + n - m % i) % i;
                };
                var f = function(v, i) {
                    return v * (Math.pow(2, i - 1) % 11);
                };
                var s = 0;
                for (var i = 0; i < 17; i++) {
                    s += f(+id.charAt(i), 18 - i);
                }
                var c0 = id.charAt(17);
                var c1 = modcmpl(s, 11, 1);
                return c0 - c1 === 0 || (c0.toLowerCase() === 'x' && c1 === 10);
            }

            function rid15(id) {
                var pattern = /[1-9]\d{5}(\d{2})(\d{2})(\d{2})\d{3}/;
                var matches;
                var y;
                var m;
                var d;
                var date;
                matches = id.match(pattern);
                if (matches == null) {
                    return false;
                }
                y = +('19' + matches[1]);
                m = +matches[2];
                d = +matches[3];
                date = new Date(y, m - 1, d);
                return (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d);
            }

            return rid18(id) || rid15(id);
        },

        // 保留数字后面的小数点
        //
        // decimalFix('12', 2) => '12.00'
        decimalFix: function(value, fixed) {
            if (!value) return '';

            var number = Number(value);

            if (isNaN(number)) return number;

            return _.isUndefined(fixed) ? number : number.toFixed(fixed);
        },

        deepCopy: function(data) {
            return JSON.parse(JSON.stringify(data));
        },


        /**
         * 将文件的Byte转换为可读性更好的GB\MB\KB\B
         * @param  {number} size    大小，单位Byte
         * @param  {number} toFixed 保留几位小数，默认值为1
         * @return {string}         格式化后的字符串
         * @example
         * formatFileSize(1024) => '1 MB'
         */
        formatFileSize: function(size, toFixed) {
            size = +size || 0;

            if (toFixed === void 0) {
                toFixed = 1;
            }

            if (size >= 1024 * 1024 * 1024) {
                return (size / (1024 * 1024 * 1024)).toFixed(toFixed) + ' GB'
            } else if (size >= 1024 * 1024) {
                return (size / (1024 * 1024)).toFixed(toFixed) + ' MB'
            } else if (size >= 1024) {
                return (size / 1024).toFixed(toFixed) + ' KB'
            } else {
                return size.toFixed(toFixed) + ' B'
            }
        },

        /**
         * 将持续时间格式化成适合阅读的字符串
         * @param  {number} duration 秒
         * @return {string}
         * @example
         * formatDuration(100) => '01:40'
         * formatDuration(10000) => '02:46:40'
         */
        formatDuration: function(duration) {
            duration = Math.max(0, (+duration || 0).toFixed(0));

            var secondPart = duration % 60;
            var minutePart = ((duration - secondPart) / 60) % 60;
            var hourPart = (duration - minutePart * 60 - secondPart) / 3600;

            // 补零
            var padding = function(n) { return n < 10 ? '0' + n : n}

            var result = [padding(minutePart), padding(secondPart)];

            if (hourPart > 0) {
                result.unshift(padding(hourPart));
            }

            return result.join(':');
        },

        /**
         * 修正toFixed的四舍五入的方法
         * @example
         * adjustFixed(3.955, 2) => 3.96
         */
        adjustFixed: function(num, len) {
            return (Math.round(num * Math.pow(10, len)) / Math.pow(10, len)).toFixed(len);
        },

        classNames: (function() {
            var hasOwn = {}.hasOwnProperty;

            /**
             * A simple javascript utility for conditionally joining classNames together.
             *
             * @return {string}
             * @example
             * classNames('foo', 'bar'); // => 'foo bar'
             * classNames('foo', { bar: true }); // => 'foo bar'
             * classNames({ 'foo-bar': true }); // => 'foo-bar'
             * classNames({ 'foo-bar': false }); // => ''
             * classNames({ foo: true }, { bar: true }); // => 'foo bar'
             * classNames({ foo: true, bar: true }); // => 'foo bar'
             */
            return function classNames() {
                var classes = [];

                for (var i = 0; i < arguments.length; i++) {
                    var arg = arguments[i];
                    if (!arg) continue;

                    var argType = typeof arg;

                    if (argType === 'string' || argType === 'number') {
                        classes.push(arg);
                    } else if (_.isArray(arg)) {
                        classes.push(classNames.apply(null, arg));
                    } else if (argType === 'object') {
                        for (var key in arg) {
                            if (hasOwn.call(arg, key) && arg[key]) {
                                classes.push(key);
                            }
                        }
                    }
                }

                return classes.join(' ');
            }
        })(),

        hasEmoji: function(str) {
            return emojiReg.test(str);
        }
    };
});
