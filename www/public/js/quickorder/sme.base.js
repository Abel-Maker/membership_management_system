var sme = {};
sme.data = {};
sme.fn = {};
(function ()
{
    String.prototype.Trim = function ()
    {
        var d = this;
        d = d.replace(/^\s\s*/, "");
        var b = /\s/;
        var c = d.length;
        while (b.test(d.charAt(--c))) {}
        return d.slice(0, c + 1);
    };
    String.prototype.ReplaceAll = function (b, d, c)
    {
        if (!RegExp.prototype.isPrototypeOf(b)) {
            return this.replace(new RegExp(b, (c ? "gi" : "g")), d)
        }
        else {
            return this.replace(b, d);
        }
    };
    var a = window.sme || {};
    a = 
    {
        _INSTALL : function ()
        {
            window.sme = a;
        },
        Config : {}, UI : {}
    };
    a.Config = 
    {
        CookieDomain : "yijintong.com", WwwDomain : "http://www.yijintong.com"
    };
    
    a.UI = 
    {
        Loading : 
        {
            Close : function ()
            {
                if ($(".gbox-wrapper").length != 0) {
                    $(".gbox-close").trigger("click")
                }
            },
            Show : function ()
            {
                this.Close();
                $.gbox($("#popLoading").html(), {
                    isShowMask : false
                })
            }
        }
    };
    a._INSTALL()
})();
jQuery.extend(
{
    sme_Ajax : function (a)
    {
		if (a.url == undefined) {
            return;
        }
        if (a.type == undefined) {
            a.type = "POST";
        }
        if (a.cache == undefined) {
            a.cache = false;
        }
        if (a.dataType == undefined) {
            //a.dataType = "jsonp";
        }
        if (a.success == undefined) {
            a.success = function (b)
            {
                alert(b);
            }
        }
        if (a.data == undefined) {
            a.data = "";
        }
        $.ajax(a);
    }
});
