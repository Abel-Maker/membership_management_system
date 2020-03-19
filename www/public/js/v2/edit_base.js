define(function(require) {
    'use strict';

    var
        _ = require('underscore'),
        $ = require('jquery'),
        Backbone = require('backbone'),
        Marionette = require('marionette'),
        Utils = require('utils');

    return Marionette.Layout.extend({

        initialize: function(options) {
            this._setOptions(options);
            this._bind();

            this.triggerMethod('init', options);
        },

        _setOptions: function(options) {
            this.options = options || {};
            this.layout = this.options.layout;
        },

        _bind: function() {
            this.listenTo(this, 'before:close', this._handleViewBeforeClose);
            this.listenTo(this, 'close', this._handleViewClose);
            this.listenTo(this.model, 'destroy', this.close);
            this.listenTo(this.model, 'change', this._handleModelChange);

            this.bindValidation();
        },

        bindValidation: function() {
            Backbone.Validation.bind(this);
        },

        _handleViewBeforeClose: function() {
            this.$(':focus').blur();
            this.save();
        },

        _handleViewClose: function() {
            this.layout = null;
            Backbone.Validation.unbind(this);
        },

        _handleModelChange: function() {
            if(_.isFunction(this.model.validate)) {
                this.model.validate(this.model.changed);
            }
        },

        // 用于视图关闭时保存数据用，需要继承的类自己重写该函数
        save: function() {
        },

        updateModel: Utils.updateModel,

        fullfillUrl: function(e, modelName) {
            var $target = $(e.target);
            var value = $.trim($target.val());
            value = Utils.urlCheck(value);
            this.model.set(modelName, value);
            $target.val(value);

            e.stopPropagation();
            e.stopImmediatePropagation();
        },

        sort: function(start, end, arr){
            // 删除元素
            var item = arr.splice(start, 1)[0];
            // 插入元素
            arr.splice(end, 0, item);
            return arr;
        }
    });
});
