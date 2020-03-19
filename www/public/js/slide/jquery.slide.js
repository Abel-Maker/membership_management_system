var effects = [ "fade", "scrollX", "scrollY" ];
// Slider构造函数
function Slider(config) {
	// 将用户配置和默认配置合并后得到最终配置赋给slider对象
	// 参考jQuery.extend的用法
	this.config = $.extend({}, Slider._defaults, config);
	// 根据config进行设置（比如显示默认，设置循环播放，设置按钮）
	this.element = $(this.config.element).eq(0);
	// 只取第一个元素，传入选择器或者jq对象都可以
	this.panels = this.element.children();
	if (!this.element.length || this.panels.length <= 1) {
		return;
	}
	this.initPanels();
	this.setTriggers();
	this.addViewArea(this.element);
	this.display(this.config.active);
	if (this.config.autoPlay) {
		this.autoPlay();
	}
}
// 默认设置
Slider._defaults = {
	element: "",
	effect: "fade",
	autoPlay: true,
	circular: true,
	interval: 3e3,
	duration: 800,
	triggerWrap: "",
	triggerType: "hover",
	active: 0,
	onChange: function(index) {}
};
Slider.prototype = {
	// 重置构造函数
	constructor: Slider,
	// 根据配置的effect初始panels样式
	initPanels: function() {
		var _effect = this.config.effect;
		_effect = effects.join("").indexOf(_effect) > -1 ? _effect : effects[0];
		switch (_effect) {
		  case "fade":
			this.panels.css({
				position: "absolute"
			}).eq(this.config.active).show().siblings().hide();
			break;

		  case "scrollX":
			this.panels.css("float", "left");
			this.gap = this.panels.eq(0).clone().attr("role", "clone").appendTo(this.element).width();
			this.direct = "left";
			this.element.css("width", this.gap * (this.panels.length + 1));
			break;

		  case "scrollY":
			this.gap = this.panels.eq(0).clone().attr("role", "clone").appendTo(this.element).height();
			this.direct = "top";
			this.element.css("height", "auto");
			break;
		}
	},
	// 显示第index个元素
	display: function(index, callback) {
		var that = this, _config = this.config, duration = _config.duration, target = this.direct ? this.element : this.panels.eq(index), props = {}, activeIndex;
		if (typeof index === "undefined" || index === this.active) {
			return;
		}
		if (!this.direct) {
			if (typeof this.active !== "undefined") {
				this.panels.eq(this.active).fadeOut(duration);
			}
			props["opacity"] = "show";
		} else {
			props["margin-" + this.direct] = -this.gap * index;
		}
		if (that.direct && index === that.panels.length) {
			activeIndex = 0;
		} else {
			activeIndex = index;
		}
		that.triggers && that.triggers.removeClass().eq(activeIndex).addClass("active");
		that.active = activeIndex;
		if ($.isFunction(_config.onChange)) {
			_config.onChange.call(that, activeIndex);
		}
		// 执行动画
		this.anim = target.animate(props, duration, function() {
			that.anim = null;
			// 有回调则执行回调
			if ($.isFunction(callback)) {
				callback.call(that, index);
			}
		});
	},
	// 显示下一个元素
	displayNext: function() {
		var length = this.panels.length, next = this.direct ? this.active + 1 : (this.active + 1) % length;
		this.display(next, function() {
			// 滚动效果的时候，最后个执行完设置到初始位置
			if (this.direct && next === length) {
				this.element.css("margin-" + this.direct, 0);
			}
		});
	},
	// 显示前一个元素
	displayPrev: function() {
		var length = this.panels.length, active = this.active, prev = active === 0 ? length - 1 : active - 1;
		// 重置到最后位置
		if (this.direct && active === 0) {
			this.element.css("margin-" + this.direct, -(length * this.gap));
		}
		this.display(prev);
	},
	// 自动播放
	autoPlay: function() {
		var that = this;
		if (!this._interval) {
			this._interval = setInterval(function() {
				that.displayNext();
			}, this.config.interval);
		}
	},
	// 暂停播放
	pause: function() {
		if (this._interval) {
			clearInterval(this._interval);
			this._interval = null;
		}
	},
	// 设置1，2，3…按钮
	setTriggers: function() {
		var $btnWrap = $(this.config.triggerWrap);
		if ($btnWrap.length) {
			var that = this, eventType = this.config.triggerType || "hover", timer = null, str = "";
			for (var i = 0; i < this.panels.length; i++) {
				str += '<i data-rel="' + i + '">' + (i + 1) + "</i>";
			}
			this.triggers = $(str).appendTo($btnWrap);
			this.triggers[eventType](function() {
				var index = +this.getAttribute("data-rel");
				timer && clearTimeout(timer);
				timer = setTimeout(function() {
					that.display(index);
					timer = null;
				}, 200);
			}).on("mouseleave", function() {
				timer && clearTimeout(timer);
			});
			this.addViewArea($btnWrap);
		}
	},
	// 设定区域停止播放
	addViewArea: function(elem) {
		var that = this, autoPlay = that.config.autoPlay;
		$(elem).on("mouseover", function() {
			autoPlay && that.pause();
		}).on("mouseout", function() {
			autoPlay && that.autoPlay();
		});
	}
};
