;(function (factory) {
    "use strict";
    if (typeof define === 'function' && (define.cmd || define.cmd)) {
        // using AMD; register as anon module
        define(['jquery'], factory);
    } else {
        // no AMD; invoke directly
        factory( (typeof(jQuery) != 'undefined') ? jQuery : window.Zepto );
    }
}
(function() {
    var win = window;
    var winTop = $(win.top || win),
        docTop = $(win.top.document);

    /**
     * 弹出框组件
     * @class dialog
     * @param content {Element|String} 用来填充弹出框的内容，可以为字符串或者dom元素
     * @param options {Object} 弹出框配置项
     * @grammar new dialog( el, options )
     * @return dialog
     */

    function dialog(content, options) {
        var _self = this;
        $.isPlainObject(content) && (options = content) && (content = null);
        //合并配置项
        var _options = $.extend({}, dialog._options, options);
        var _cache = dialog.cache.get(_options.cache);
        //检查是否缓存
        if (_cache) {
            _self = _cache;
            _self._options = _options;
        } else {
            //检测是否实例化构造函数
            if (!(this instanceof dialog)) {
                return new dialog(content, options);
            }
            _self._options = _options;
            //组建弹出层结构元素
            _self.frameElement = $(dialog._tpl.frame).addClass(_self._options.style);
            _self.mainElement = $(dialog._tpl.main).appendTo(_self.frameElement);
            _self.mixedElement = $(dialog._tpl.mixed).appendTo(_self.frameElement);
            _self.utilElement = $(dialog._tpl.util).appendTo(_self.mixedElement);
            _self.borderElement = _self.mainElement.children('.dialog-border');
            _self.contElement = $(dialog._tpl.cont).appendTo(_self.borderElement.find('.dialog-border-inner'));
            _self.headElement = $(dialog._tpl.head).appendTo(_self.contElement);
            _self.bodyElement = $(dialog._tpl.body).appendTo(_self.contElement);
            //设置操作按钮
            _self.setButton(_self._options.button);
            //记录弹出层的父元素
            _self._appendToElement = docTop.find('body');
            //将弹出层假隐藏并添加到DOM中
            _self.frameElement.appendTo(_self._appendToElement);
            //弹出层绑定指定显示事件
            _self.frameElement.mousedown(function() {
                _self._isToper && _self.toper(true);
            });
        }
        //设置假隐藏
        _self.frameElement.css({
            'display': 'block',
            'left': -9999,
            'top': -9999
        });
        //设置弹出层内容
        _self.content(_self._options.content || content);
        //设置弹出层标题
        _self.title(_self._options.title);
        //设置关闭按钮
        if (_self._options.close) {
            _self._closeElement && _self._closeElement.remove();
            _self._closeElement = $(dialog._tpl.close).appendTo(_self.headElement);
            _self._closeElement.html(_self._options.close);
            _self._closeElement.click(function() {
                _self.close();
            }).mousedown(function(event) {
                event.stopPropagation();
            });
        } else {
            _self._closeElement && _self._closeElement.remove();
        }
        //设置是否置顶显示弹出层
        _self.toper(_self._options.toper);
        //设置弹出层定位方式
        _self.position(_self._options.position);
        //设置弹出层宽度
        _self.width(_self._options.width);
        //设置弹出层高度
        _self.height(_self._options.height);
        //设置弹出层是否拖拽
        _self.drag(_self._options.drag);
        //设置遮罩层
        _self.mask(_self._options.mask);
        //设置层叠级数
        _self.zIndex(_self._options.zIndex);
        //设置弹出层偏移距离
        _self.offset(_self._options.offset[0], _self._options.offset[1]);
        //将弹出层显示并根据参数是否打开弹出层
        _self.frameElement.hide() && _self._options.show && _self.open();
        if (!_cache) {
            //缓存弹出层
            _self._options.cache && dialog.cache.set(_self._options.cache, _self);
            //弹出层实例化后触发回调函数
            $.isFunction(_self._options.onCreate) && _self._options.onCreate.call(_self);
            $.isFunction($.dialog.onCreate) && $.dialog.onCreate.call(_self);
        }
        return _self;
    }
    /**
     * 设置弹出层操作按钮
     * @method dialog.setButton(content)
     * @param button {Array}
     * @return dialog._content
     */
     dialog.prototype.setButton = function(button){
        if(button.length){
            if(!this.footElement){
                this.footElement = $('<div class="dialog-foot"></div>');
                this.bodyElement.after(this.footElement);
            }
            for(var i = 0; i< button.length; i++){
                if($.isFunction(button[i])){
                    var _btn = button[i].call(this);
                    this.footElement.append(_btn);
                }else if($.isPlainObject(button[i])){
                    var _btn = $('<button type="button">'+button[i].text+'</button>').addClass(button[i].cls);
                    this.footElement.append(_btn);
                    $.isFunction(button[i].callback) && button[i].callback.call(this, _btn);
                }
            }
        }
     }
    /**
     * 设置或返回弹出层内容
     * @method dialog.setContent(content)
     * @param content {String|Element}
     * @return dialog._content
     */
    dialog.prototype.content = function(content) {
        if (arguments.length) {
            if (content || content === 0 || content === '') {
                content = $.isFunction(content) ? content.call(this) : content;
                this._content = this.contentEle = $('<div class="dialog-content"></div>').append(content);
                this.contentEle.data('dialog', this);
                this.bodyElement.empty().append(this.contentEle);
            }
        } else {
            return this.bodyElement;
        }
        return this;
    }
    /**
     * 设置或返回弹出层标题
     * @method dialog.setTitle(title)
     * @param title {String|Element}
     * @return dialog._title
     */
    dialog.prototype.title = function(title) {
        if (arguments.length) {
            if (title || title === 0 || title === '') {
                if (!this.titleElement) {
                    this.titleElement = $(dialog._tpl.title).appendTo(this.headElement);
                }
                this._title = title;
                this.titleElement.empty().append(this._title);
            }
        } else {
            return this._title;
        }
        return this;
    }
    /**
     * 设置或返回弹出层的偏移距离
     * @method dialog.setOffset(x,y)
     * @param x {String|number} x标识水平偏移,为百分比时则始终相对于当前可视区域
     * @param y {String|number} y标识垂直偏移,为百分比时则始终相对于当前可视区域
     * @return dialog._offset
     */
    dialog.prototype.offset = function(x, y) {
        if (arguments.length) {
            var _x = dialog.translated($.isFunction(x) ? x.call(this.frameElement) : x),
                _y = dialog.translated($.isFunction(y) ? y.call(this.frameElement) : y);
            if (typeof _x == 'string') {
                if (_x.indexOf('!') == 0) {
                    if (_x.indexOf('%') >= 0) {
                        _x = (docTop.width() - this.frameElement.outerWidth()) * (Math.max(parseInt(_x.substr(1)), 0) / 100);
                    } else {
                        _x = Math.max(parseInt(_x), 0);
                    }
                } else {
                    if (_x.indexOf('%') >= 0) {
                        _x = (winTop.width() - this.frameElement.outerWidth()) * (Math.max(parseInt(_x), 0) / 100);
                    }
                    this._positoin == 'absolute' && (_x = Math.max(parseInt(_x), 0) + docTop.scrollLeft());
                }
            }
            if (typeof _y == 'string') {
                if (_y.indexOf('!') == 0) {
                    if (_y.indexOf('%') >= 0) {
                        _y = (docTop.height() - this.frameElement.outerHeight()) * (Math.max(parseInt(_y.substr(1)), 0) / 100);
                    } else {
                        _y = Math.max(parseInt(_y), 0);
                    }
                } else {
                    if (_y.indexOf('%') >= 0) {
                        _y = (winTop.height() - this.frameElement.outerHeight()) * (Math.max(parseInt(_y), 0) / 100);
                    }
                    this._positoin == 'absolute' && (_y = Math.max(parseInt(_y), 0) + docTop.scrollTop());
                }
            };
            (isNaN(parseInt(_x)) || _x < 0) && (_x = this._offset ? this._offset.left : 0);;
            (isNaN(parseInt(_y)) || _y < 0) && (_y = this._offset ? this._offset.top : 0);
            this._offset = {
                left: _x,
                top: _y
            }
            this.frameElement.css({
                'left': this._offset.left,
                'top': this._offset.top
            });
        } else {
            return this._offset;
        }
        return this;
    }
    /**
     * 设置或返回弹出层定位方式
     * @method dialog.setPosition(position)
     * @param position {String} 可以设置absolute和fixed两种定位方式
     * @return dialog._positoin
     */
    dialog.prototype.position = (function() {
        var _positoinType = ['absolute', 'fixed'];
        return function(position) {
            if (arguments.length) {
                $.inArray(position, _positoinType) <= 0 && (position = _positoinType[0]);
                this._positoin = position;
                this.frameElement.css('position', this._positoin);
            } else {
                return this._positoin;
            }
            return this;
        }
    })();
    /**
     * 设置或返回弹出层是否拖拽
     * @method dialog.drag(status)
     * @param status {Boolean}
     * @return dialog._isDrag
     */
    dialog.prototype.drag = function(status) {
        if (arguments.length) {
            this._isDrag = status ? true : false;
            if (this._isDrag) {
                dialog.drag(this);
                this.frameElement.addClass('think-dialog-drag');
            } else {
                this.frameElement.removeClass('think-dialog-drag');
            }
        } else {
            return this._isDrag;
        }
        return this;
    }
    /**
     * 设置或返回弹出层宽度
     * @method dialog.drag(status)
     * @param number {String|Number}
     * @return dialog._width
     */
    dialog.prototype.width = function(number) {
        if (arguments.length) {
            var _number = parseInt(number);
            if (!isNaN(_number)) {
                typeof number == 'string' && number.indexOf('%') >= 0 && (_number = _number + '%');
                this.frameElement.css('width', number);
                this.borderElement.css('width', '100%');
            } else {
                this.frameElement.width('auto');
                this.borderElement.css('width', 'auto');
            }
        } else {
            return this.frameElement.width();
        }
        return this;
    }
    /**
     * 设置或返回弹出层高度
     * @method dialog.drag(status)
     * @param number {String|Number}
     * @return dialog._height
     */
    dialog.prototype.height = function(number) {
        if (arguments.length) {
            var _number = parseInt(number);
            if (!isNaN(_number)) {
                typeof number == 'string' && number.indexOf('%') >= 0 && (_number = _number + '%');
                this.frameElement.css('height', number);
                var _contParent = this.contElement.parent();
                var _contHeight = _contParent.height();
                this.contElement.add(_contParent).height(_contHeight);
                this.bodyElement.height(function(i, n) {
                    var _h = n;
                    $(this).siblings().each(function() {
                        _h = _contHeight - $(this).outerHeight();
                    });
                    return _h;
                });
            } else {
                this.frameElement.height('auto');
                this.contElement.height('auto');
                this.bodyElement.height('auto');
            }
        } else {
            return this.frameElement.height();
        }
        return this;
    }
    /**
     * 设置或返回弹出层层叠级数
     * @method dialog.zIndex(status)
     * @param number {Number}
     * @return dialog._zIndex
     */
    dialog.prototype.zIndex = function(number) {
        if (arguments.length) {
            var _zIndex = parseInt(number);
            if (!isNaN(_zIndex)) {
                this._zIndex = _zIndex;
                dialog.zIndex = Math.max(this._zIndex, dialog.zIndex);
            }
            this.frameElement.css('zIndex', this._zIndex);
            this._markElement && this._markElement.css('zIndex', this._zIndex - 1);
        } else {
            return this._zIndex;
        }
        return this;
    }
    /**
     * 是否需要将弹出层始终指定显示
     * @method dialog.toper()
     * @param number {Number}
     * @return dialog
     */
    dialog.prototype.toper = function(status) {
        if (arguments.length) {
            this._isToper = status ? true : false;
            this._isToper && this.zIndex(dialog.zIndex += 2);
        } else {
            return this._isToper;
        }
        return this;
    }
    /**
     * 设置或返回弹出层是否遮罩
     * @method dialog.zIndex(status)
     * @param number {Number}
     * @return
     */
    dialog.prototype.mask = function(status) {
        var _self = this;
        if (arguments.length) {
            if (status && !this._markElement) {
                this._markElement = $(dialog._tpl.mask).appendTo(this._appendToElement);
                this._markElement.opacity = this._markElement.css('opacity');
                this._markElement.click(function() {
                    _self._options.maskClose && _self.close();
                });
            }
            this._isMask = status ? true : false;
        } else {
            return this._isMask;
        }
        return this;
    }
    /**
     * 打开弹出层
     * @method dialog.open()//可以指定一个删除的动作，作为打开弹出层回调函数的参数
     * @return dialog
     */
    dialog.prototype.open = function(action) {
        var _self = this;
        if (!this.isOpen) {
            this.isOpen = true;
            $.isFunction(_self._options.onBeforeOpen) && _self._options.onBeforeOpen.call(_self, action);
            dialog.effect[this._options.effect]['open'].call(this, function() {
                $.isFunction(_self._options.onOpen) && _self._options.onOpen.call(_self, action);
            });
            this._isMask && this._markElement && this._markElement.fadeTo(300, this._markElement.opacity);
        }
        return this;
    }
    /**
     * 关闭弹出层
     * @method dialog.close()
     * @param action {String} //可以指定一个删除的动作，作为关闭弹出层回调函数的参数
     * @return
     */
    dialog.prototype.close = function(action) {
        var _self = this,
            _arguments = arguments;
        if (this.isOpen) {
            this.isOpen = false;
            dialog.effect[this._options.effect]['close'].call(this, function() {
                $.isFunction(_self._options.onClose) && _self._options.onClose.apply(_self, _arguments);
                _self._options.cache || _self.destroy();
                $.isFunction(action) && action.call(_self);
            });
            this._isMask && this._markElement && this._markElement.fadeTo(300, 0, function() {
                $(this).hide();
            });
        }
        return this;
    }
    /**
     * 销毁弹出层
     * @method dialog.destroy()
     * @return
     */
    dialog.prototype.destroy = function() {
        dialog.cache.del(this._options.cache);
        if(this.content().children('iframe.dialog-iframe').length){
            this._options.content[0].contentWindow.document.write('');
            this._options.content[0].contentWindow.close();
            this._options.content.remove();
        }
        this.frameElement.remove();
        this._markElement && this._markElement.remove();
        for (var i in this) {
            delete this[i];
        }
    }
    /**
     * 弹出层缓存操作类
     */
    dialog.cache = (function() {
        var _cacheList = win.top.__THINKCACHE__ = $.isPlainObject(win.top.__THINKCACHE__) ? win.top.__THINKCACHE__ : {};
        return {
            /**
             * 设置缓存
             * @method dialog._cache.set(name,object)
             * @param name {String} 缓存名称
             * @param object {Object} 缓存对象实例
             * @return Void
             */
            set: function(name, object) {
                if (typeof name == 'string') {
                    _cacheList[name] = object;
                } else if (dialog.isElement(name)) {
                    $(name).data('thinkDialog', object);
                }
            },
            /**
             * 删除缓存
             * @method dialog._cache.del(name,object)
             * @param name {String} 缓存名称
             * @return Void
             */
            del: function(name) {
                if (typeof name == 'string') {
                    delete _cacheList[name];
                } else if (dialog.isElement(name)) {
                    $(name).removeData('thinkDialog');
                }
            },
            /**
             * 获取缓存
             * @method dialog._cache.get(name)
             * @param name {String} 缓存名称
             * @return Object
             */
            get: function(name) {
                if (typeof name == 'string') {
                    return _cacheList[name];
                } else if (dialog.isElement(name)) {
                    return $(name).data('thinkDialog');
                }
            }
        }
    })();
    //禁用或启用文本选中
    dialog.unselectable = function(element, status) {
        element.each(function() {
            if (status) {
                this.onselectstart = function() {
                    return false
                };
                this.unselectable = 'on';
                this.style.MozUserSelect = 'none';
                this.style.WebkitUserSelect = 'none';
            } else {
                this.onselectstart = function() {
                    return true
                };
                this.unselectable = 'off';
                this.style.MozUserSelect = 'auto';
                this.style.WebkitUserSelect = 'auto';
            }
        });
    }
    /**
     * 对元素执行拖拽
     * @method dialog.drag(element)
     * @param element 待检测的参数
     * @return Boolean
     */
    dialog.drag = (function() {
        var _dragWrap = [];
        return function(self) {
            var _self = self,
                _status = false,
                _maxLeft, _maxTop,
                _x, _y,
                _mouseX, _mouseY;
            if ($.inArray(_self, _dragWrap) < 0) {
                _self.headElement.bind('mousedown.thinkdialog', function(event) {
                    if (_self._isDrag) {
                        _status = true;
                        _offset = _self.frameElement.offset();
                        if (_self._positoin == 'fixed') {
                            _offset.left -= docTop.scrollLeft();
                            _offset.top -= docTop.scrollTop();
                            _maxLeft = Math.max(winTop.width() - _self.frameElement.outerWidth(), 0);
                            _maxTop = Math.max(winTop.height() - _self.frameElement.outerHeight(), 0);
                        } else {
                            _maxLeft = Math.max(docTop[0].documentElement.scrollWidth - _self.frameElement.outerWidth(), 0);
                            _maxTop = Math.max(docTop[0].documentElement.scrollHeight - _self.frameElement.outerHeight(), 0);
                        }
                        _mouseX = event.pageX - _offset.left;
                        _mouseY = event.pageY - _offset.top;
                        dialog.unselectable(_self._appendToElement.add(_self.frameElement), true);
                        $.isFunction(_self._options.onDragStart) && _self._options.onDragStart.call(_self, _mouseX, _mouseY, event);
                    }
                });
                docTop.bind('mousemove.thinkdialog', function(event) {
                    if (_self._isDrag && _status) {
                        _x = event.pageX - _mouseX;
                        _y = event.pageY - _mouseY;
                        if (_x < 0) {
                            _x = 0;
                        } else if (_x > _maxLeft) {
                            _x = _maxLeft;
                        }
                        if (_y < 0) {
                            _y = 0;
                        } else if (_y > _maxTop) {
                            _y = _maxTop;
                        }
                        _self.frameElement.css({
                            'left': _x,
                            'top': _y
                        });
                        $.isFunction(_self._options.onDraging) && _self._options.onDraging.call(_self, _x, _y, event);
                    }
                }).bind('mouseup.thinkdialog', function(event) {
                    if (_status) {
                        _status = false;
                        dialog.unselectable(_self._appendToElement.add(_self.frameElement), false);
                        $.isFunction(_self._options.onDragEnd) && _self._options.onDragEnd.call(_self, event);
                    }
                });
                _dragWrap.push(dialog);
            }
        }
    })();
    /**
     * 判断是否为合法dom元素
     * @method dialog.isElement(element)
     * @param element 待检测的参数
     * @return Boolean
     */
    dialog.isElement = function(element) {
        if (element && typeof element[0] == 'object' && element[0].nodeName) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 将英文位置字符转换标准数值
     * @method dialog.isElement(element)
     * @param param 待转换的参数
     * @return Number
     */
    dialog.translated = function(param) {
        var _table = {
            'left': '0%',
            'center': '50%',
            'right': '100%',
            'top': '0%',
            'bottom': '100%'
        };
        if (typeof param == 'string' && param in _table) {
            return _table[param];
        } else {
            return param;
        }
    }
    // 弹出层层叠起始基数
    dialog.zIndex = 5555;
    //扩展jquery动画算法
    $.extend($.easing, {
        easeOutExpo: function(x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        }
    });
    /**
     * 弹出层打开关闭效果支持类型
     */
    dialog.effect = {
        visibility: {
            open: function(callback) {
                return this.frameElement.show(0, callback);
            },
            close: function(callback) {
                return this.frameElement.hide(0, callback);
            }
        },
        opacity: {
            open: function(callback) {
                return this.frameElement.stop(false, true).fadeIn(400, callback);
            },
            close: function(callback) {
                return this.frameElement.stop(false, true).fadeOut(400, callback);
            }
        },
        scroll: {
            open: function(callback) {
                var _offset = this._offset;
                this.frameElement.css({
                    'opacity': 1,
                    'left': _offset.left,
                    'top': _offset.top
                }).show();
                if (this.position() == 'absolute') {
                    var _e = this.frameElement.offset().top;
                    var _s = $(document).scrollTop() - this.frameElement.outerHeight();
                } else {
                    var _e = this.frameElement.offset().top - $(document).scrollTop();
                    var _s = -this.frameElement.outerHeight();
                }
                this.frameElement.stop(false, false).css({
                    'top': _s
                }).animate({
                    'top': _e
                }, 250, 'easeOutExpo', callback);
            },
            close: function(callback) {
                var _self = this;
                if (this.position() == 'absolute') {
                    var _s = this.frameElement.offset().top;
                    var _e = $(document).scrollTop() - this.frameElement.outerHeight();
                } else {
                    var _s = this.frameElement.offset().top - $(document).scrollTop();
                    var _e = -this.frameElement.outerHeight();
                }
                this.frameElement.stop(false, false).css('top', _s).animate({
                    'top': _e,
                    'opacity': 0
                }, 500, 'easeOutExpo', function() {
                    _self.isOpen || $(this).hide();
                    $.isFunction(callback) && callback();
                });
            }
        }
    }
    /**
     * 弹出框默认配置项
     */
    dialog._options = {
        style: 'think-dialog', //弹出框样式名称
        title: null, //弹出层标题
        content: null, //弹出层内容
        close: '×', //弹出层关闭按钮
        drag: true, //弹出层允许拖拽
        width: 'auto', //宽度自动
        height: 'auto', //高度度自动
        position: 'absolute', //设置弹出层定位方式
        offset: ['50%', '20%'], //设置弹出层的偏移距离,偏移距最小为0
        mask: true, //是否需要遮罩层
        maskClose: true, //点击遮罩层关闭弹出层
        show: true, //初始是否显示
        toper: true, //是否需要置顶显示弹出层
        zIndex: null, //设置弹出层的层叠级数
        button: [], //设置操作按钮
        cache: null, //指定一个缓存标识符，如果为null则不缓存，标识符可以为字符串获取dom元素
        effect: 'scroll', //弹出层的打开关闭方式
        onCreate: null, //弹出层创建完成后相应回调函数
        onOpen: null, //弹出层打开时相应回调函数
        onDragStart: null, //弹出层拖拽开始响应回调函数
        onDraging: null, //弹出层拖拽响应回调函数
        onDragEnd: null, //弹出层拖拽结束响应回调函数
        onClose: null //弹出层关闭时相应回调函数
    }
    /**
     * 弹出框框架模版
     */
    dialog._tpl = {
        frame: '<div style="left:0;top:0;"></div>',
        main: '<div class="dialog-main" style="height: 100%;"><table class="dialog-border" style="border-collapse: collapse; border-spacing:0;height: 100%;"><tr><td class="dialog-border-inner" style="vertical-align: top;"></td></tr></table></div>',
        mixed: '<div class="dialog-mixed"></div>',
        util: '<div class="dialog-util"></div>',
        head: '<div class="dialog-head"></div>',
        body: '<div class="dialog-body"></div>',
        cont: '<div class="dialog-wrap"></div>',
        title: '<strong class="dialog-title"></strong>',
        close: '<span class="dialog-close"></span>',
        mask: '<div class="think-dialog-mask" style="display: none;"></div>',
        loading: '<span><b>&nbsp;</b></span>'
    }
    /**
     * 扩展弹出层
     */
    if (!winTop[0].$.dialog) {
        winTop[0].$.dialog = function(content, options) {
            return new dialog(content, options);
        }
        $.extend(winTop[0].$.dialog, {
            /**
             * 从服务器取得内容填充弹出层
             * @method dialog.load(url,options)
             * @param url {String|Object} 服务器地址或标准的ajax参数字面量
             * @param options {Object} 弹出层配置项，同dialog.options对应
             * @return dialog
             */
            load: function(url, options) {
                var _options = $.extend({
                    style: 'think-dialog-load'
                }, options);
                var _dialog = $.dialog.get(_options.cache);
                if (!_dialog) {
                    var _content = $(dialog._tpl.loading).addClass('dialog-loading');
                    var _ajax = {};
                    var _onOpen = _options.onOpen;
                    var _isLoaded = false, _isOpened = false;
                    _options.onOpen = function(){
                        if(_isLoaded){
                            $.isFunction(_options.onComplete) && _options.onComplete.call(this);
                        }
                        _isOpened = true;
                        $.isFunction(_onOpen) && _onOpen.call(this);
                    }
                    _dialog = $.dialog(_content, _options);
                    if ($.type(url) == 'string') {
                        _ajax.url = url;
                    } else if ($.isPlainObject(url)) {
                        $.extend(_ajax, url);
                    }
                    var _success = _ajax.success;
                    _ajax.success = function(data) {
                        var _data = data;
                        if($.isFunction(_options.praseData)){
                            _data = _options.praseData.call(_dialog,_data);
                        }
                        if($.isFunction($.dialog.praseData)){
                            _data = $.dialog.praseData.call(_dialog,_data);
                        }
                        if(_data !== false){
                            var _offset = _dialog.offset();
                            _dialog.content(_data);
                            _dialog.offset(_dialog._options.offset[0], _dialog._options.offset[1]);
                        }
                        $.isFunction(_options.onLoad) && _options.onLoad.call(_dialog, data);
                        if(_isOpened){
                            $.isFunction(_options.onComplete) && _options.onComplete.call(_dialog);
                        }
                        _isLoaded = true;
                    }
                    _ajax.beforeSend = function(){
                        $.isFunction(_options.beforeSend) && _options.beforeSend.call(_dialog);
                    }
                    $.ajax(_ajax);
                } else {
                    _dialog.open();
                }
                return _dialog;
            },
            /**
             * 创建iframe用来展示指定服务器段页面
             * @method dialog.iframe(src,options)
             * @param src {String} 服务器段页面地址
             * @param options {Object} 弹出层配置项，同dialog.options对应
             * @return dialog
             */
            iframe: function(src, options) {
                if ($.type(src) == 'string') {
                    var _dialog = null;
                    var _name = (new Date()).getTime().toString();
                    var _options = $.extend({
                        style: 'think-dialog-iframe'
                    }, options);
                    var _onCreate = _options.onCreate;
                    var _onDragStart = _options.onDragStart;
                    var _onDragEnd = _options.onDragEnd;
                    var _onCreate = _options.onCreate;
                    if (!$.dialog.get(_options.cache)) {
                        _options.content = $('<iframe class="dialog-iframe" name="' + _name + '" src="' + src + '" width="100%" height="100%" frameborder="0" scrolling="no" style="vertical-align: top;"></iframe>');
                        _options.onCreate = function() {
                            var _self = this;
                            _self.dragMask = $('<div class="dialog-mask" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: none; zIndex: 10; background-color: #fff">&nbsp;</div>').css('opacity', 0).appendTo(_self.mixedElement);
                            _self.loading = $(dialog._tpl.loading).addClass('dialog-loading').appendTo(_self.mixedElement);
                            _self._content.load(function() {
                                _self.loading.hide();
                                $.isFunction(_self._options.onLoad) && _self._options.onLoad.call(this, _self);
                            });
                        }
                        _options.onDragStart = function() {
                            this.dragMask.css('top', this.headElement.outerHeight()).show();
                            $.isFunction(_onDragStart) && _onDragStart.apply(this, arguments);
                        }
                        _options.onDragEnd = function() {
                            this.dragMask.hide();
                            $.isFunction(_onDragEnd) && _onDragEnd.apply(this, arguments);
                        }
                    }
                    _dialog = $.dialog(_options);
                    dialog.cache.set(_name, _dialog);
                    return _dialog;
                }
            },
            /**
             * 将dialog包装成成功样式框
             * @method dialog.success(content,callback)
             * @param content {String} 弹出层内容
             * @param callback {Function} 关闭弹出层时的回调函数
             * @return dialog
             */
            success: function(content, callback) {
                var _options = {
                    style: 'think-dialog-success',
                    content: content,
                    title: null,
                    close: null,
                    time: 1500, //自动关闭等待秒数，整数值
                    drag: false,
                    mask: false,
                    maskClose: false,
                    offset: ['50%', '0'],
                    cache: 'success',
                    position: 'fixed',
                    onClose: callback,
                    onOpen: function() {
                        var _self = this;
                        setTimeout(function() {
                            _self.close();
                        }, _self._options.time);
                    }
                }
                if($.isFunction(callback)){
                    _options.onClose = callback;
                }else{
                    $.extend(_options, callback);
                }
                return $.dialog(_options);
            },
            /**
             * 将dialog包装成失败样式框
             * @method dialog.error(content,callback)
             * @param content {String} 弹出层内容
             * @param callback {Function} 关闭弹出层时的回调函数
             * @return dialog
             */
            error: function(content, callback) {
                var _options = {
                    style: 'think-dialog-error',
                    content: content,
                    close: null,
                    title: null,
                    time: 1500, //自动关闭等待秒数，整数值
                    drag: false,
                    mask: false,
                    maskClose: false,
                    offset: ['50%', '0'],
                    cache: 'error',
                    position: 'fixed',
                    onClose: callback,
                    onOpen: function() {
                        var _self = this;
                        setTimeout(function() {
                            _self.close();
                        }, _self._options.time);
                    }
                };
                if($.isFunction(callback)){
                    _options.onClose = callback;
                }else{
                    $.extend(_options, callback);
                }
                return $.dialog(_options);
            },
            /**
             * 将dialog包装成失败样式框
             * @method dialog.error(content,callback)
             * @param content {String} 弹出层内容
             * @param callback {Function} 关闭弹出层时的回调函数
             * @return dialog
             */
            loading: function(content, callback) {
                return $.dialog({
                    style: 'think-dialog-loading',
                    title: null,
                    content: content,
                    close: null,
                    drag: false,
                    maskClose: false,
                    mask: false,
                    cache: 'loading',
                    position: 'fixed',
                    offset: ['50%', '0'],
                    onClose: callback
                });
            },
            /**
             * 模拟window对象alert弹出框
             * @method dialog.alert(content,callback)
             * @param content {String} 弹出层内容
             * @param callback {Function} 关闭弹出层时的回调函数
             * @return dialog
             */
            alert: (function() {
                var _callback;
                return function(content, callback) {
                    var _callback = callback;
                    return $.dialog({
                        style: 'think-dialog-alert',
                        title: '提示',
                        content: content,
                        drag: false,
                        maskClose: false,
                        cache: 'alert',
                        position: 'fixed',
                        onOpen: function() {
                            this.defineElement && this.defineElement.focus();
                        },
                        onCreate: function() {
                            var _self = this;
                            this.footElement = $('<div class="dialog-foot"></div>');
                            this.bodyElement.after(this.footElement);
                            this.defineElement = $('<button class="dialog-btn dialog-define" type="button">确定</button>').appendTo(this.footElement);
                            this.defineElement.unbind('click.thinkdialog').bind('click.thinkdialog', function() {
                                _self.close('1');
                                $.isFunction(_callback) && _callback(1);
                            });
                        }
                    });
                }
            })(),
            /**
             * 模拟警告弹出框
             * @method dialog.wran(content,callback)
             * @param content {String} 弹出层内容
             * @param callback {Function} 关闭弹出层时的回调函数
             * @return dialog
             */
            wran: (function() {
                var _callback;
                return function(content, callback) {
                    _callback = callback;
                    return $.dialog({
                        style: 'think-dialog-wran',
                        title: '警告',
                        content: content,
                        drag: false,
                        maskClose: false,
                        cache: 'wran',
                        position: 'fixed',
                        onOpen: function() {
                            this.defineElement && this.defineElement.focus();
                        },
                        onCreate: function() {
                            var _self = this;
                            this.footElement = $('<div class="dialog-foot"></div>');
                            this.bodyElement.after(this.footElement);
                            this.defineElement = $('<button class="dialog-btn dialog-define" type="button">确定</button>').appendTo(this.footElement);
                            this.defineElement.bind('click.thinkdialog', function() {
                                _self.close('1');
                                $.isFunction(_callback) && _callback(1);
                            });
                        }
                    });
                }
            })(),
            /**
             * 模拟window对象confirm弹出框
             * @method dialog.confirm(content,defineCallback,cancelCallback)
             * @param content {String} 弹出层内容
             * @param defineCallback {Function} 确定时的回调函数
             * @param cancelCallback {Function} 成功时的回调函数
             * @return dialog
             */
            confirm: (function() {
                var _callback;
                return function(content, callback) {
                    _callback = callback;
                    return $.dialog(content, {
                        style: 'think-dialog-confirm',
                        title: '确定',
                        drag: false,
                        maskClose: false,
                        cache: 'confirm',
                        position: 'fixed',
                        onOpen: function() {
                            this.defineElement && this.defineElement.focus();
                        },
                        onCreate: function() {
                            var _self = this;
                            this.footElement = $('<div class="dialog-foot"></div>');
                            this.bodyElement.after(this.footElement);
                            this.defineElement = $('<button class="dialog-btn dialog-define" type="button">确定</button>').appendTo(this.footElement);
                            this.cancelElement = $('<button class="dialog-btn dialog-cancel" type="button">取消</button>').appendTo(this.footElement);
                            this.defineElement.unbind('click.thinkdialog').bind('click.thinkdialog', function() {
                                _self.close('1');
                                $.isFunction(_callback) && _callback(1);
                            });
                            this.cancelElement.unbind('click.thinkdialog').bind('click.thinkdialog', function() {
                                _self.close('2');
                                $.isFunction(_callback) && _callback(2);
                            });
                        }
                    });
                }
            })(),
            /**
             * 获取弹出层对象
             * @method dialog.get(param)
             * @param param {String|Element} 弹出层缓存的标识
             * @return dialog
             */
            get: function(param) {
                if(dialog.isElement(param)){
                    return param.data('dialog');
                }else{
                    if ($.isWindow(param)) {
                        param = param.name;
                    }
                    return dialog.cache.get(param);
                }
            }
        });
    }
    $.dialog = winTop[0].$.dialog;
    /**
     * 将jquery对象填充到弹出层中
     * @method dialog
     * @param options {Object} 弹出层配置项
     * @return {self}
     */
    $.fn.dialog = function(options) {
        if (this.length) {
            return this.each(function() {
                new dialog($(this), options);
            });
        } else {
            return new dialog(this.selector, options);
        }
    }
}));
