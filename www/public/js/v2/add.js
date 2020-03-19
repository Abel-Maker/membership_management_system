define(function(require) {
    'use strict';

    var
        _ = require('underscore'),
        $ = require('jquery'),
        BaseView = require('edit_base'),
        template = require('text!templates/add_content.html'),
        Utils = require('utils');

    return BaseView.extend({

        template: _.template(template),

        events: {
            'click .js-new-field': 'handleAddField'
        },

        // 添加组件
        handleAddField: function(e) {
            e.stopPropagation();
            var MAX_LENGTH = this.layout.collection.MAX_LENGTH || 8;
            if (this.layout.collection.length >= MAX_LENGTH) {
                Utils.errorNotify('内容最多' + MAX_LENGTH + '个。');
                return;
            }

            var type = $(e.target).data('field-type');
            var model = window.SHOWCASE_CONFIG.models[type].initialize();

            if(this.model.collection) {
                this.layout.collection.add(model, {at: this.model.index() + 1, silent: true});
                this.layout.collection.trigger('reset');
            } else {
                this.layout.collection.add(model);
            }

            this.layout.displayEditView(model);
        },
    });
});
