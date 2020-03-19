define(['backbone',
        'jqueryui',
        'text!components/modal/1.0.0/templates/modal.html',
        'text!components/modal/1.0.0/templates/modal_link.html',
        'text!components/modal/1.0.0/templates/modal_pane.html',
        'text!components/modal/1.0.0/templates/modal_row.html',
        'text!components/modal/1.0.0/templates/modal_tab.html',
        'text!components/modal/1.0.0/templates/modal_thead.html',
        'text!components/modal/1.0.0/templates/modal_dropdown.html',
        'text!components/modal/1.0.0/templates/modal_static.html',
        'text!components/modal/1.0.0/templates/modal_static_footer.html',
        'core/utils',
        'fileupload_validate'],
function(Backbone, jqueryui, modal, modalLink, modalPane, modalRow, modalTab, modalThead, modalDropdown, modalStaticPane, modalStaticFooter, Utils) {
    'use strict';

    $.ajaxSetup({
        cache: false
    });

    var TabModel = Backbone.Model.extend({
        defaults: {
            tab: '',
            isLink: false,
            type: '',
            text: '',
            link: '',
            groupID: null,
            isDropdown: false
        }
    });
    var TabList = Backbone.Collection.extend({
        model: TabModel
    });
    var TabView = Backbone.View.extend({
        tagName: 'li',
        className: function() {
            if (this.model.get('isLink')) {
                return 'link-group link-group-' + this.model.get('groupID');
            } else if (this.model.get('isDropdown')) {
                return 'link-group dropdown link-group-' + this.model.get('groupID');
            }
        },
        template: _.template(modalTab),
        linkTemplate: _.template(modalLink),
        dropdownTemplate: _.template(modalDropdown),

        render: function() {
            var data = this.model.toJSON();
            var groupID = this.model.get('groupID');
            if (_.isNumber(this.model.get('groupID')) &&
                _.isEqual(_.last(this.model.collection.where({groupID: groupID})), this.model)) {
                _.extend(data, {isLast: true});
            } else {
                _.extend(data, {isLast: false});
            }

            if ((this.model.collection.where({isLink: false, isDropdown: false}).length === this.model.collection.length) &&
                (this.model.collection.indexOf(this.model) === this.model.collection.length - 1)) {
                _.extend(data, {isLast: true});
            }

            if (this.model.get('isLink')) {
                this.$el.html(this.linkTemplate(data));
            } else if (this.model.get('isDropdown')) {
                this.$el.html(this.dropdownTemplate(data));
            } else {
                this.$el.html(this.template(data));
            }
            if (this.options.hide) {
                this.$el.hide();
            }
            return this;
        }
    });

    var TabTheadModel = Backbone.Model.extend({
        defaults: {
            title: '',
            time: '',
            type: ''
        }
    });
    var TabTheadView  = Backbone.View.extend({
        tagName: 'tr',
        template: _.template(modalThead),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var TabRowModel = Backbone.Model.extend({});

    var TabRowView = Backbone.View.extend({
        tagName: function() {
            if (this.model.get('type') === 'image') {
                return 'li';
            } else {
                return 'tr';
            }
        },
        template: _.template(modalRow),
        events: {
            'click .js-choose': function(e) {
                if (this.parent.multiChoose) {
                    this.toggle();
                } else {
                    var attrs = this.model.attributes;
                    if(attrs.type == 'guaguale'){
                        attrs.type = 'activity';
                        attrs._real_type = 'guaguale';
                    }
                    if(attrs.type == 'wheel'){
                        attrs.type = 'activity';
                        attrs._real_type = 'wheel';
                    }
                    if(attrs.type == 'zodiac'){
                        attrs.type = 'activity';
                        attrs._real_type = 'zodiac';
                    }
                    if(attrs.type == 'crazyguess'){
                        attrs.type = 'activity';
                        attrs._real_type = 'crazyguess';
                    }
                    if(attrs.type == 'mpNews') {
                        attrs.type = 'news';
                    }
                    CONFIG.chooseItemCallback(attrs);
                }
                e.stopPropagation();
            },
            'click .js-multi-select': 'toggleImage'
        },
        initialize: function(options) {
            this.parent = options.parent;
            var time = this.model.get('time');
            var arr = time.split(' ');
            this.model.set('time', arr.join('<br>'));
        },
        toggleImage: function(e) {
            this.toggle(true);
        },
        toggle: function(notChangeContent) {
            var $choose = this.$('.js-choose');
            $choose.toggleClass('btn-primary');
            if ($choose.hasClass('btn-primary')) {
                $choose.data('view', this);
                if (!notChangeContent) {
                    $choose.html('取消');
                }
            } else {
                if (!notChangeContent) {
                    $choose.html('选取');
                }
            }
            this.toggleConfirm();
        },
        toggleConfirm: function() {
            if (this.parent.$('.js-choose.btn-primary').length > 0) {
                this.parent.$('.js-confirm-choose').show();
            } else {
                this.parent.$('.js-confirm-choose').hide();
            }
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            if (this.model.get('type') === 'image' && this.parent.multiChoose) {
                this.$('.multi-select-container').show();
            } else {
                this.$('.multi-select-container').hide();
            }
            return this;
        }
    });

    var TabPaneModel = Backbone.Model.extend({
        defaults: {
            type: '',
            data: [],
            pageNavi: ''
        },
        getType: function(href) {
            var arr = href.slice(1).split('-');
            var type = this.get('type');
            return type === arr[arr.length - 1];
        },
        fetch: function(keyword, pageNum, callback) {
            var that = this,
                type = this.get('type');
            var url = CONFIG.url[type];
            if (_.isUndefined(url)) {
                return;
            }
            if(type != 'cards'){
                if (url.indexOf('?') >= 0) {
                    url += '&v=2';
                } else {
                    url += '?v=2';
                }
            }


            if (!_.isUndefined(keyword)) {
                url += '&keyword=' + keyword;
            }
            if (!_.isUndefined(pageNum)) {
                url += '&p=' + pageNum;
            }

            if (window._global.imageSize && type === 'image') {
                url += '&size=' + window._global.imageSize;
            }

            $.getJSON(url, function(response) {
                var data = response.data;
                if (+response.errcode === 0 || +response.code === 0) {
                    var list = data.data_list,
                        pageNavi = data.page_view,
                        dataType = data.data_type;
                    that.set({type: type, data: list, pageNavi: pageNavi, dataType: dataType});
                } else {
                    Utils.errorNotify(response.errmsg);
                }
                if (_.isFunction(callback)) {
                    callback();
                }
            });
        }
    });
    var TabPaneList  = Backbone.Collection.extend({
        model: TabPaneModel,
        fetch: function(type, isUpdate) {
            var that = this;

            var url = CONFIG.url[type];

            if (_.isUndefined(url)) {
                that.add({type: type}, {callback: isUpdate});
                return;
            }
            if(type != 'cards'){
                if (url.indexOf('?') >= 0) {
                    url += '&v=2';
                } else {
                    url += '?v=2';
                }
            }

            if (window._global.imageSize && type === 'image') {
                url += '&size=' + window._global.imageSize;
            }

            var callback;
            if (!_.isFunction(isUpdate)) {
                that.reset();
            } else {
                callback = isUpdate;
            }

            $.getJSON(url, function(response) {
                var data = response.data;
                if (+response.errcode === 0 || +response.code === 0) {
                    var list = data.data_list,
                        pageNavi = data.page_view,
                        dataType = data.data_type;
                    that.add({type: type, data: list, pageNavi: pageNavi, dataType: dataType}, {
                        callback: callback
                    });
                } else {
                    Utils.errorNotify(response.errmsg);
                }
            });
        }
    });
    var TabPaneView  = Backbone.View.extend({
        tagName: 'div',
        id: function() {
            return 'js-module-' + this.model.get('type');
        },
        className: function() {
            return 'tab-pane module-' + this.model.get('type');
        },
        template: _.template(modalPane),
        events: {
            'click .js-modal-search': function(e) {
                var that = this;
                var search  = that.search.val() || undefined,
                    type    = that.model.get('type'),
                    target  = $(e.target);
                if (that.model.getType(that.parent.tab.find('li.active a').attr('href'))) {
                    if (that.model.get('type') === 'image') {
                        that.$('.module-header').addClass('loading');
                    } else {
                        that.parent.loading();
                    }
                    that.model.fetch(search, undefined, function() {
                        if (that.model.get('type') === 'image') {
                            that.$('.module-header').removeClass('loading');
                        } else {
                            that.parent.done();
                        }
                    });
                }
            },
            'keydown .js-modal-search-input': function(e) {
                if (e.keyCode === 13) {
                    this.$('.js-modal-search').trigger('click');
                    e.preventDefault();
                }
            },
            'click .js-update': 'update'
        },
        initialize: function(options) {
            options = options || {};
            this.parent = options.parent;
            var that = this;
            this.parent.$('.pagenavi').on('click', function(e) {
                var target  = $(e.target),
                    pageNum = target.data('page-num');

                e.preventDefault();
                if (!target.hasClass('js-confirm-upload-image') && !target.hasClass('btn-cancel')) {
                    e.stopPropagation();
                }

                if (!target.hasClass('fetch_page') || target.hasClass('active')) {
                    return;
                }
                if (that.model.getType(that.parent.tab.find('li.active a').attr('href'))) {
                    that.searchKeyword(pageNum);
                }
            });
            this.parent.$('.pagenavi').on('keydown', '.goto-input', function(e) {
                if (e.keyCode === Utils.keyCode.ENTER &&
                    that.model.getType(that.parent.tab.find('li.active a').attr('href'))) {
                        that.searchKeyword(Number(e.target.innerText));
                        e.preventDefault();
                }
            });

            this.parent.$('.pagenavi').on('click', '.goto-btn', function(e) {
                if(that.model.getType(that.parent.tab.find('li.active a').attr('href'))) {
                    var $target = that.parent.$('.pagenavi .goto-input');
                    that.searchKeyword(+$target.text());
                }
            });

            this.parent.tabLink.on('active:tab', function(e) {
                var target = e.target;
                var href = target.getAttribute('href');

                if (href && that.model.getType(href)) {
                    that.renderPageNavi();
                }
            });

            if (this.model.get('type') === 'image') {
                this.parent.$el.on('show', function() {
                    that.renderRow();
                });
            }

            this.listenTo(this.model, 'change:data', this.renderRow);
            this.listenTo(this.model, 'change:pageNavi', this.renderPageNavi);
        },
        update: function() {
            var that = this;
            if (that.model.get('type') === 'image') {
                that.$('.module-header').addClass('loading');
            } else {
                that.parent.loading();
            }

            this.model.fetch(void 0, void 0, function() {
                if (that.model.get('type') === 'image') {
                    that.$('.module-header').removeClass('loading');
                } else {
                    that.parent.done();
                }
            });
        },
        searchKeyword: function(pageNum) {
            var that = this;
            if (isNaN(pageNum)) {
                pageNum = 1;
            }

            var search  = that.search.val() || undefined;
            if (that.model.get('type') === 'image') {
                that.$('.module-header').addClass('loading');
            } else {
                that.parent.loading();
            }
            that.model.fetch(search, pageNum, function() {
                if (that.model.get('type') === 'image') {
                    that.$('.module-header').removeClass('loading');
                } else {
                    that.parent.done();
                }
            });
        },
        render: function() {
            var that = this;
            this.modelData = this.model.toJSON();
            this.$el.html(this.template(this.modelData));
            this.thead = new TabTheadModel({
                title: '标题',
                time:  '创建时间',
                type: that.model.get('type')
            });
            this.renderThead();
            this.renderRow();

            this.search = this.$('.js-modal-search-input');

            var active = this.parent.tab.find('li.active a');
            if (active.length > 0 && this.model.getType(active.attr('href'))) {
                this.renderPageNavi(this.modelData.pageNavi);
            }
            return this;
        },

        renderThead: function() {
            var that = this;

            var el;
            if (this.model.get('type') === 'image') {
                el = this.$('.module-header');
            } else {
                el = this.$('thead');
            }
            el.empty();

            var view = new TabTheadView({
                el: el,
                model: that.thead
            });
            view.render();
        },

        renderRow: function() {
            var that = this;
            var arr = this.model.get('data'),
                type = this.model.get('type'),
                dataType = this.model.get('dataType');

            var el;
            if (type === 'image') {
                el = that.$('.module-body');
            } else {
                el = that.$('tbody');
            }

            el.empty();
            _.each(arr, function(item) {
                var data_title;
                if (type === 'news' || type === 'mpNews') {
                    arr = [];
                    _.each(item.news_list, function(item) {
                        arr.push(item.title);
                    });
                    data_title = arr.join('\\n');
                } else {
                    data_title = item.title;
                }

                var view = new TabRowView({
                    model: new TabRowModel({
                        title: item.title || '',
                        name: item.name || '',
                        time:  item.created_time || item.created_at || '',
                        link:  item.url || '',
                        data_url: item.url || '',
                        data_cover_attachment_id: item.cover_attachment_id || '',
                        data_cover_attachment_url: item.cover_attachment_url || '',
                        data_title: data_title || '',
                        data_alias: item.alias || '',
                        data_price: item.price || '',
                        data_buy_url: item.buy_url || '',
                        data_type: dataType || '',
                        width: item.width || '',
                        height: item.height || '',
                        type: type || '',
                        data_id: item.id || item._id || '',
                        start_time: item.valid_start_time || item.start_time || '',
                        end_time: item.valid_end_time || item.end_time || '',
                        news: item.news_list || '',
                        attachment_url: item.attachment_url || '',
                        attachment_title: item.attachment_title || '',
                        attachment_id: item.attachment_id || '',
                        thumb_url: item.thumb_url || '',
                        multiChoose: that.parent.multiChoose || false,
                        id: item.id || item._id || '',
                        image_url: item.image_url || '',
                        size: item.attachment_size || '',
                        at_least: item.at_least || '',
                        is_at_least: item.is_at_least || '',
                        value: item.value,
                        feature_num: item.num || '',
                        feature_hot_per: item.hot_per || '',
                        feature_img_url: item.img_url || '',
                        feature_intro: item.intor || '',
                        area : item.area || '',
                        address : item.address || '',
                        stock_num: item.stock_num || '',
                        min_retail_price: item.min_retail_price || '',
                        max_retail_price: item.max_retail_price || ''
                    }),
                    parent: that.parent
                });
                el.append(view.render().el);
            });
            // 数据为空时触发parentView - AppView的empty事件
            if (!arr.length) {
                this.parent.trigger('empty', this);
            }
            if (this.model.get('type') === 'image') {
                this.$('.module-header').removeClass('loading');
            } else {
                this.parent.done();
            }
        },
        renderPageNavi: function() {
            var pageNaviHTML = this.model.get('pageNavi');
            this.parent.$('.pagenavi').html(pageNaviHTML);
            this.parent.done();
        }
    });

    var TabStaticPaneView = Backbone.View.extend({
        tagName: 'div',
        id: function() {
            return 'js-module-' + this.model.get('type');
        },
        className: function() {
            return 'tab-pane module-' + this.model.get('type');
        },
        events: {
            'click .js-preview-img': 'previewImage'
        },
        template: _.template(modalStaticPane),
        footerTemplate: _.template(modalStaticFooter),
        initialize: function(options) {
            var that = this;
            options = options || {};
            this.parent = options.parent;

            this.parent.tabLink.on('active:tab', function(e) {
                var target = e.target;
                var href = target.getAttribute('href');
                if (href && that.model.getType(href)) {
                    that.renderFooter();
                }
            });

            this.parent.$el.on('click', function(e) {
                if (e.target === $('.js-confirm-upload-image')[0]) {
                    $(e.target).button('loading');
                    var isDownloadOk = that.downloadImage();
                    if (isDownloadOk) {
                        return;
                    }
                    var $upload = $('.js-fileupload');
                    if (that.uploadFiles) {
                        // $('.js-fileupload').data('upload-data').submit();
                        $upload.fileupload('send', {
                            files: that.uploadFiles
                        }).success(function (result, textStatus, jqXHR) {
                            var err = [],
                                succ = [];
                            _.each(result, function(item, index) {
                                if (item.status === 'success') {
                                    succ.push(item.success_msg);
                                } else {
                                    err.push({ index: index+1, msg: item.failed_msg });
                                }
                            });

                            if (succ.length > 1) {
                                if (that.parent.multiChoose) {
                                    CONFIG.chooseItemCallback(succ);
                                } else {
                                    CONFIG.chooseItemCallback(succ[0]);
                                }
                            } else if (succ.length === 1) {
                                CONFIG.chooseItemCallback(succ[0]);
                            }
                            if (err.length > 0) {
                                var msg = _.reduce(err, function(memo, item) {
                                    if (item.msg.upload_file === 'size') {
                                        return memo + '第' + item.index + ' 张图片大于 1MB 上传失败；';
                                    } else {
                                        return memo + '第' + item.index + ' 张图片上传失败（请联系客服）；';
                                    }
                                }, '');
                                Utils.errorNotify(msg);
                            }
                            that.clearDownload();
                        });
                    } else {
                        Utils.errorNotify('至少选择一张图片。');
                        that.clearDownload();
                    }
                }
            });
        },
        render: function() {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        renderFooter: function() {
            var that = this;
            this.parent.$('.pagenavi').html(this.footerTemplate(this.model.attributes));
            this.uploadImage();
        },
        uploadImage: function() {
            var that = this;
            if (!that.initUploadImage) {
                that.initUploadImage = true;
            } else {
                return;
            }

            var $input = $('.js-fileupload');

            $input.fileupload({
                dataType: 'json',
                add: function() {},
                xhrFields: {
                    withCredentials: true
                }
            }).fileupload('option', {
                formData: {
                    'media_type': 'image',
                    'v': '2',
                    'mp_id': window._global.kdt_id
                },
                maxFileSize: 1000000,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
            }).on('change', function(e) {
                var len = e.target.files.length;
                if (len === 0) {
                    return;
                } else if ( len > 10 ) {
                    Utils.errorNotify('一次只能选择 10 张图片。');
                    return;
                }
                var $container = $('.js-upload-img');
                $container.empty();
                _.each(e.target.files, function(file) {
                    var imageReader = new FileReader();
                    imageReader.onload = function(event) {
                        $container.append($('<img>').attr('src', event.target.result));
                    };
                    imageReader.readAsDataURL(file);
                });
                that.uploadFiles = e.target.files;
            });

        },
        /**
         * 预览下载图片
         */
        previewImage: function() {
            var src = $('.js-web-img-input').val();
            if ($.trim(src) === '') {
                $('.js-web-img-input').focus();
                return;
            }
            this.model.set('src', src);
            var $container = this.$('.js-download-img');
            var img = $('<img>').on('load', function() {
                $container.removeClass('loading');
            }).attr('src', src);
            $container.html(img).addClass('loading');
        },
        /**
         * 下载图片
         */
        downloadImage: function() {
            var that = this;
            if ($.trim(this.model.get('src')) === '') {
                return;
            }
            var data = {
                attachment_url: this.model.get('src'),
                media_type: 'image',
                v: 2,
                mp_id: window._global.kdt_id
            };

            $.post(window._global.url.img + '/download?format=json', data, function(response) {
                if (response.success) {
                    CONFIG.chooseItemCallback(response.success);
                }
            }, 'json').always(function() {
                that.clearDownload();
            }).fail(function() {
                Utils.errorNotify('网络出现错误啦。');
            });
            return true;
        },
        clearDownload: function() {
            this.$('.js-download-img').html('');
            this.$('.js-upload-img').html('');
            this.$('.js-web-img-input').val('');
            this.uploadFiles = null;
            this.model.set('src', '');
            var $confirm = $('.js-confirm-upload-image');
            $confirm.button('reset');
        }
    });

    var AppView = Backbone.View.extend({
        initialize: function(options) {
            options = options || {};
            this.type = options.type;
            this.multiChoose = options.multiChoose || false;

            this.tab = this.$('.modal-tab');
            this.tabContent = this.$('.tab-content');
            this.modalBody = this.$('.modal-body');

            this.listenTo(tabLists[options.type], 'add', this.addTabs);
            this.listenTo(tabPaneLists[options.type], 'add', this.addPanes);
            this.listenTo(tabPaneLists[options.type], 'reset', this.reset);

            tabLists[options.type].add(options.list);
            this.tabList = options.tab;

            var that = this;

            var tabLink = this.tabLink = this.tab.find('.js-modal-tab');
            var tabLinkCb = function(e) {
                var activeTab = $(e.target),
                    id = tabLink.index(activeTab);
                that.tab.find('.link-group').css({display: 'none'});
                that.tab.find('.link-group-' + id).css({display: 'inline-block'});
                if (that.tabContent.find('#' + activeTab.attr('href').substring(1)).length > 0) {
                    activeTab.tab('show').trigger('active:tab');
                }

                e.preventDefault();
                e.stopPropagation();
            };

            tabLink.on('click', tabLinkCb);
            tabLink.one('click', function(e) {
                var $activeTab = $(e.target);
                var type = $activeTab.data('type');
                that.loading();
                if (tabPaneLists[that.options.type]) {
                    tabPaneLists[that.options.type].fetch(type, function() {
                        $activeTab.tab('show').trigger('active:tab');
                    });
                }
            });
            this.$el.on('click', '.js-confirm-choose .btn', function() {
                var arr = [];
                that.$('.js-choose.btn-primary').each(function(index, item) {
                    arr.push($(item).data('view').model.attributes);
                });
                CONFIG.chooseItemCallback(arr);
            });
            this.on('hide', function() {
                if (that.type === 'image') {
                    this.$('.js-multi-select:checked').prop('checked', false);
                }
                that.$('.js-choose.btn-primary').each(function(index, item) {
                    if (that.type === 'image') {
                        $(item).data('view').toggle(true);
                    } else {
                        $(item).data('view').toggle();
                    }
                });
            });
            this.on('show', function() {
                var flag = true;
                for (var i = 0; i < tabLink.length; i++) {
                    var $link = $(tabLink[i]);
                    if ($link.parent('li').hasClass('active')) {
                        $link.trigger('click');
                        flag = false;
                        break;
                    }
                }

                if (flag) {
                    tabLink.first().trigger('click');
                }
            });
        },
        addTabs: function(model) {
            var config = {
                model: model
            };
            // 判断顶部 tab 是否显示
            if (!_.isUndefined(this.options.hide) &&
                model.type !== '' &&
                _.indexOf(this.options.hide, model.get('type')) >= 0) {
                    _.extend(config, {
                        hide: true
                    });
            }
            var view = new TabView(config);
            this.tab.append(view.render().$el);
        },
        addPanes: function(model, collection, options) {
            var that = this;
            var view;
            var isStaticPane = _.isUndefined(CONFIG.url[model.get('type')]);
            if (isStaticPane) {
                view = new TabStaticPaneView({
                    model: model,
                    parent: that
                });
            } else {
                view = new TabPaneView({
                    model: model,
                    parent: that
                });
            }
            this.tabContent.append(view.render().$el);
            if (_.isFunction(options.callback)) {
                options.callback();
            }
            this.done();
        },
        reset: function() {
            this.tabContent.empty();
        },
        update: function() {
            var that = this;
            this.loading();
            _.each(this.tabList, function(item) {
                if (tabPaneLists[that.type]) {
                    tabPaneLists[that.type].fetch(item, true);
                }
            });
        },
        loading: function() {
            this.modalBody.addClass('loading');
        },
        done: function() {
            this.modalBody.removeClass('loading');
            this.$('.js-confirm-choose').hide();
        },
        fetchAll: function() {
            var that = this;

            _.each(this.options.tab, function(item) {
                if (tabPaneLists[that.options.type]) {
                    tabPaneLists[that.options.type].fetch(item);
                }
            });
        }
    });

    var tabPaneLists = {},
        tabLists = {};

    var ModalModel = Backbone.Model.extend({
        defaults: {
            type: 'other'
        }
    });
    var ModalView = Backbone.View.extend({
        template: _.template(modal),
        render: function() {
            return $(this.template(this.model.attributes)).appendTo('body');
        }
    });

    var CONFIG = {},
        cached = {};

    return {
        initialize: function(options) {
            if (cached[options.type]) {
                if (_.isArray(options.hide) && options.hide.length > 0) {
                    cached[options.type].find('.modal-tab li:not(.link-group)>a').each(function(index, item) {
                        var name = $.trim($(item).attr('href').replace('#js-module-', ''));
                        if (options.hide.indexOf(name) >= 0) {
                            $(item).parent('li').hide();
                        }
                    });
                } else {
                    cached[options.type].find('.modal-tab li:not(.link-group)').removeAttr('style');
                }

                if (options.multiChoose) {
                    cached[options.type].app.multiChoose = true;
                } else {
                    cached[options.type].app.multiChoose = false;
                }

                return cached[options.type];
            }
            if (_.isUndefined(CONFIG.url)) {
                CONFIG.url = options.url || {
                    goods: window._global.url.www + '/showcase/goods/shortList.json',
                    topic: window._global.url.v1 + '/topic/list/get',
                    category: window._global.url.www + '/showcase/category/shortList.json',
                    component: window._global.url.www + '/showcase/component/shortList.json',
                    feature_category: window._global.url.www + '/showcase/category/shortList.json',
                    survey: window._global.url.www + '/apps/vote/selectList.json',
                    image: window._global.url.www + '/showcase/attachment/alert.json?media_type=1',
                    article: window._global.url.v1 + '/article/list/get',
                    tag: window._global.url.www + '/showcase/tag/shortList.json',
                    goods_tag: window._global.url.www + '/showcase/tag/shortList.json',
                    f_category: window._global.url.www + '/showcase/category/shortList.json',
                    tag_feature: window._global.url.www + '/showcase/tag/shortList.json',
                    tag_feature_2: window._global.url.www + '/showcase/feature/shortList.json',
                    news: window._global.url.v1 + '/news/list/get',
                    mpNews: window._global.url.www + '/weixin/imagetext/minilist.json',
                    activity: window._global.url.v1 + '/activity/list/modal',
                    guaguale: window._global.url.www + '/apps/cards/shortlist.json',
                    wheel: window._global.url.www + '/apps/wheel/shortlist.json',
                    zodiac: window._global.url.www + '/apps/zodiac/shortlist.json',
                    crazyguess: window._global.url.www + '/apps/crazyguess/shortlist.json',
                    grab: window._global.url.www + '/apps/grab/shortList.json',
                    guang_activity: window._global.url.v1 + '/activity/list/modal?is_guangyiguang=1',
                    feature: window._global.url.www + '/showcase/feature/shortList.json',
                    articles: window._global.url.www + '/sinaweibo/articles/atricleselectionlist.json',
                    tradeincard: window._global.url.www + '/ump/tradeincard/listForSelection.json',
                    storelist : window._global.url.www + '/setting/teamphysical/storelist.json',
                    recommend_goods: window._global.url.fenxiao + '/pinjian/activity/goodsList.json',
                    fenxiao_goods: window._global.url.fenxiao + '/supplier/goods/shortlist.json',
                    fenxiao_imagetext: window._global.url.fenxiao + '/supplier/imagetext/shortlist.json',
                    fenxiao_enterprise_imagetext: window._global.url.fenxiao + '/supplier/imagetext/shortlist.json'
                };

                _.each(CONFIG.url, function(value, key) {
                    tabPaneLists[key] = new TabPaneList();
                    tabLists[key] = new TabList();
                });
            }

            CONFIG.chooseItemCallback = function() {
                options.chooseItemCallback.apply($el, arguments);
                $el.modal('hide');
                app.trigger('hide');
            } || function() {};

            var modalView = new ModalView({
                model: new ModalModel({
                    type: options.type
                })
            });
            var $el = modalView.render();
            $el.view = modalView;

            $el.on('show', function(e) {
                var $tar = $(e.target);
                if ($tar.hasClass('modal')) {
                    app.trigger('show');
                }
            });

            // 重新设置callback
            $el.setChooseItemCallback = function(callback) {
                CONFIG.chooseItemCallback = null;
                CONFIG.chooseItemCallback = function() {
                    callback.apply($el, arguments);
                    $el.modal('hide');
                    app.trigger('hide');
                };

                return this;
            };

            var config;
            switch(options.type) {
                case 'mass_news':
                    config = {
                        list: [ {tab: '微信图文', type: 'mpNews'},
                                {link: window._global.url.www + '/weixin/imagetext#list', text: '微信图文素材管理', isLink: true, groupID: 0}
                                ],
                        tab: ['mpNews'],
                        type: 'news'
                    };
                    break;
                case 'news':
                    config = {
                        list: [ {tab: '高级图文', type: 'news'},
                                {tab: '微信图文', type: 'mpNews'},
                                {link: window._global.url.www + '/weixin/advancednews#list', text: '高级图文素材管理', isLink: true, groupID: 0},
                                {link: window._global.url.www + '/weixin/imagetext#list', text: '微信图文素材管理', isLink: true, groupID: 1}
                                ],
                        tab: ['news', 'mpNews'],
                        type: 'news'
                    };
                    break;
                case 'fenxiao_imagetext':
                    config = {
                        list: [ {tab: '图文素材', type: 'fenxiao_imagetext'},
                                {link: '/supplier/imagetext', text: '图文素材管理', isLink: true, groupID: 0}
                                ],
                        tab: ['fenxiao_imagetext'],
                        type: 'fenxiao_imagetext'
                    };
                    break;
                case 'fenxiao_enterprise_imagetext':
                    config = {
                        list: [ {tab: '图文素材', type: 'fenxiao_enterprise_imagetext'},
                                {link: '/supplier/enterprise/imagetext/index', text: '图文素材管理', isLink: true, groupID: 0}
                                ],
                        tab: ['fenxiao_enterprise_imagetext'],
                        type: 'fenxiao_enterprise_imagetext'
                    };
                    break;
                case 'articles':
                    config = {
                        list: [ {tab: '新浪微博图文素材', type: 'articles'},
                                {link: window._global.url.www + '/sinaweibo/articles', text: '新浪微博图文素材管理', isLink: true, groupID: 0}],
                        tab: ['articles'],
                        type: 'articles'
                    };
                    break;
                // 不要用tag，用goods替代这个
                case 'tag':
                    config = {
                        list: [ {tab: '商品分组', type: 'goods_tag'},
                                {link: '/v2/showcase/tag', text: '分组管理', isLink: true, groupID: 0}],
                        tab: ['goods_tag'],
                        type: 'goods_tag'
                    };
                    break;
                case 'tag_feature':
                    config = {
                        list: [ {tab: '商品分组', type: 'tag_feature'},
                                {tab: '微页面', type: 'tag_feature_2'},
                                {link: '/v2/showcase/tag', text: '分组管理', isLink: true, groupID: 0},
                                {link: '/v2/showcase/feature#create', text: '新建微页面', isLink: true, groupID: 1},
                                {link: '/v2/showcase/feature#list&is_display=0', text: '草稿管理', isLink: true, groupID: 1}],
                        tab: ['tag_feature', 'tag_feature_2'],
                        type: 'tag_feature'
                    };
                    break;
                case 'feature':
                    config = {
                        list: [ {tab: '微页面', type: 'feature'},
                                {tab: '微页面分类', type: 'category'},
                                {link: '/v2/showcase/feature#create', text: '新建微页面', isLink: true, groupID: 0},
                                {link: '/v2/showcase/feature#list&is_display=0', text: '草稿管理', isLink: true, groupID: 0},
                                {link: '/v2/showcase/category', text: '分类管理', isLink: true, groupID: 1}],
                        tab: ['feature', 'category'],
                        type: 'feature'
                    };
                    break;
                case 'feature_only':
                    config = {
                        list: [ {tab: '微页面', type: 'feature'},
                                {link: '/v2/showcase/feature#create', text: '新建微页面', isLink: true, groupID: 0},
                                {link: '/v2/showcase/feature#list&is_display=0', text: '草稿管理', isLink: true, groupID: 0}],
                        tab: ['feature'],
                        type: 'feature'
                    };
                    break;
                // 不要用category，用feature替代这个
                case 'category':
                    config = {
                        list: [ {tab: '微页面分类', type: 'f_category'},
                                {link: '/v2/showcase/category', text: '分类管理', isLink: true, groupID: 0}],
                        tab: ['f_category'],
                        type: 'f_category'
                    };
                    break;
                case 'feature_category':
                    config = {
                        list: [ {tab: '微页面分类', type: 'feature_category'},
                                {link: '/v2/showcase/category', text: '分类管理', isLink: true, groupID: 0}],
                        tab: ['feature_category'],
                        type: 'feature_category'
                    };
                    break;
                case 'activity':
                    config = {
                        list: [ {tab: '在有效期内的活动', type: 'activity'},
                                {tab: '刮刮乐', type: 'guaguale'},
                                {tab: '幸运大抽奖', type: 'wheel'},
                                {tab: '翻翻看', type: 'zodiac'},
                                {tab: '疯狂猜', type: 'crazyguess'},
                                {link: '/activity/list?activity_type=1', text: '新建营销活动', groupID: 0, isDropdown: true},
                                {link: '/v2/apps/cards#create', text: '新建刮刮乐', groupID: 1, isLink: true},
                                {link: '/v2/apps/wheel#create', text: '新建幸运大抽奖', groupID: 2, isLink: true},
                                {link: '/v2/apps/zodiac#create', text: '新建翻翻看', groupID: 3, isLink: true},
                                {link: '/v2/apps/crazyguess#create', text: '新建疯狂猜', groupID: 4, isLink: true}],
                        tab: ['activity'],
                        type: 'activity'
                    };
                    break;
                case 'grab':
                    config = {
                        list: [ {tab: '抢楼活动', type: 'grab'},
                                {link: _global.url.www + '/apps/grab/create', text: '新建抢楼活动', groupID: 0, isLink: true}],
                        tab: ['grab'],
                        type: 'grab'
                    };
                    break;
                case 'guang_activity':
                    config = {
                        list: [ {tab: '在有效期内的活动', type: 'guang_activity'},
                                {tab: '刮刮乐', type: 'guaguale'},
                                {tab: '幸运大抽奖', type: 'wheel'},
                                {tab: '翻翻看', type: 'zodiac'},
                                {tab: '疯狂猜', type: 'crazyguess'},
                                {link: '/activity/list?activity_type=1', text: '新建营销活动', groupID: 0, isDropdown: true},
                                {link: '/v2/apps/cards#create', text: '新建刮刮乐', groupID: 1, isDropdown: true},
                                {link: '/v2/apps/wheel#create', text: '新建幸运大抽奖', groupID: 2, isDropdown: true},
                                {link: '/v2/apps/zodiac#create', text: '新建翻翻看', groupID: 3, isDropdown: true},
                                {link: '/v2/apps/crazyguess#create', text: '新建疯狂猜', groupID: 4, isDropdown: true}],
                        tab: ['guang_activity'],
                        type: 'guang_activity'
                    };
                    break;
                case 'goods':
                    config = {
                        list: [ {tab: '已上架商品', type: 'goods'},
                                {tab: '商品分组', type: 'tag'},
                                {link: '/v2/showcase/goods/edit', text: '新建商品', isLink: true, groupID: 0},
                                {link: '/v2/showcase/goods#list&is_display=0', text: '草稿管理', isLink: true, groupID: 0},
                                {link: '/v2/showcase/tag', text: '分组管理', isLink: true, groupID: 1}],
                        tab: ['goods', 'tag'],
                        type: 'goods'
                    };
                    $.widget.bridge('uitooltip', $.ui.tooltip);
                    // 商品弹出层显示图片
                    $(document).uitooltip({
                        items: ".js-goods-modal #js-module-goods tbody .title a",
                        position: {
                            my: "top+20",
                            at: "center",
                            collision: "none"
                        },
                        content: function() {
                            var element = $( this );
                            var url = element.data('cover-attachment-url');
                            return '<div class="arrow"></div><div class="loading" style="width: 200px;height: 200px;background-color: #fff;"><img class="picture-tooltip" style="height: 200px;" width="200" height="200" src="' + url + '"/></div>';
                        }
                    });
                    break;
                case 'fenxiao_goods':
                    config = {
                        list: [ {tab: '已上架商品', type: 'fenxiao_goods'},
                                {link: _global.url.fenxiao + '/supplier/goods/create', text: '新建商品', isLink: true, groupID: 0}],
                        tab: ['fenxiao_goods'],
                        type: 'fenxiao_goods'
                    };
                    break;
                case 'recommend_goods':
                    config = {
                        list: [ {tab: '掌柜推荐商品', type: 'recommend_goods'},
                                {link: _global.url.fenxiao + '/supplier/goods/create', text: '新建商品', isLink: true, groupID: 0}],
                        tab: ['recommend_goods'],
                        type: 'recommend_goods'
                    };
                    break;
                case 'survey':
                    config = {
                        list: [ {tab: '投票调查', type: 'survey'},
                                {link: '/v2/apps/vote#create', text: '新建投票调查', groupID: 0, isLink: true}],
                        tab: ['survey'],
                        type: 'survey'
                    };
                    break;
                case 'storelist':
                    config = {
                        list: [ {tab: '线下门店', type: 'storelist'},
                                {link: '/v2/setting/store#physical_store', text: '新建线下门店', groupID: 0, isLink: true}],
                        tab: ['storelist'],
                        type: 'storelist'
                    };
                    break;
                case 'component':
                    config = {
                        list: [ {tab: '自定义页面模块', type: 'component'},
                                {link: '/v2/showcase/component#create', text: '新建自定义页面模块', groupID: 0, isLink: true}],
                        tab: ['component'],
                        type: 'component'
                    };
                    break;
                case 'image':
                    config = {
                        list: [ {tab: '用过的图片', type: 'image'},
                                {tab: '新图片', type: 'uploadImage'} ],
                        tab: ['image', 'uploadImage'],
                        type: 'image'
                    };
                    break;
                case 'tradeincard':
                    config = {
                        list: [ {tab: '优惠券', type: 'tradeincard'},
                                {link: '/v2/ump/tradeincard#add', text: '新建优惠券', groupID: 0, isLink: true}],
                        tab: ['tradeincard'],
                        type: 'tradeincard'
                    };
                    break;
                default:
                    config = options.config;
                    break;
            }

            _.extend(config, {
                modal: $el,
                hide: options.hide || [],
                multiChoose: options.multiChoose || false
            });

            if (options.size) {
                window._global.imageSize = options.size || false;
            }

            var app = new AppView(_.extend({}, {el: $el}, config));
            $el.app = app;

            cached[options.type] = $el;

            return $el;
        }
    };
});
