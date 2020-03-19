$.ajaxSetup({
    cache : false
});
var SumTotalMoney;
function DeleteSelect()
{
    $("#qtable tbody tr").each(function ()
    {
        var a = $(this);
        var b = a.find("input:checkbox").attr("checked");
        if (b == "checked")
        {
            a.find(".itemDiv").html("");
            a.find(".priceDiv").html("");
            a.find(".discountDiv").html("");
            a.find(".subtotalDiv").html("");
            a.find(".amount").val("");
            a.find(".sku").val("");
            a.find("input:checkbox").attr("checked", false);
            SumTotalMoney()
        }
    })
}

(function ()
{
	var prod_url = $('.quick-order').data('product');
    SumTotalMoney = function ()
    {
        var a = 0;
        $(".quick-order").find(".sku").each(function (b)
        {
            var c = $(this).parent().parent().find(".subtotalVal").html();
            if (c != "" && c != undefined) {
                a += parseFloat(c)
            }
        });
        a = a.toFixed(2);
        $(".totalamount").html(a)
    };
    AddEvent = function ()
    {
        $(".sku").blur(function ()
        {
            var d = $(this).val().toUpperCase().Trim();
            if (d != "")
            {
                var c = $(this);
                var a = $(".quick-order").find(".sku").index(c);
                var b = false;
                $(".quick-order").find(".sku").each(function (e)
                {
                    if (a != e)
                    {
                        var f = $(this).val().toUpperCase();
                        if (f != "" && f == d)
                        {
                            b = true;
                            $.gbox.alert("该SKU订货号已存在！", {
                                ok : function ()
                                {
                                    this.hide()
                                }
                            });
                            c.val("");
                            return false;
                        }
                    }
                });
                if (b == false)
                {
					sme.UI.Loading.Show();
                    $.sme_Ajax(
                    {
                        url : prod_url+"&t=" + Math.random(),
						data : "data=" + d,
                        success : function (h)
                        {
							sme.UI.Loading.Close();
                            var f = c.parent().parent();
                            if (h.status == true)
                            {
								//var g = jQuery.parseJSON(h.data);
								var g = h.data;
                                var e = '<a class="p-img" href="' + encodeURI(g.result.url) + '" target="_blank"><img src="' + g.result.image + '" alt="' + g.result.title + '" width="57" /></a><p class="item"><a href="' + encodeURI(g.result.url) + '" target="_blank">' + g.result.title + "</a><br /><span>款号：" + g.result.product_no + "</span></p>";
                                f.find(".itemDiv").html(e);
								//价格
								var bj = '<table border="0" class="quote-table"><tbody><tr><td class="text-right">≥50件</td><td class="text-right"><strong>65.00</strong>元/件</td></tr><tr><td class="text-right">≥100件</td><td class="text-right"><strong>58.00</strong>元/件</td></tr></tbody></table>';
                                f.find(".bjDiv").html(bj);
                                f.find(".discountDiv").html("￥" + g.result.discount + "");
                                f.find(".subtotalDiv").html('￥<i class="subtotalVal">' + g.result.sub_total + "</i>");
								f.find(".amount").val(g.result.package_qty);
								f.find(".amount").data('pkg', g.result.package_qty);
                                f.find(".sku").val(g.item_no);
                                SumTotalMoney()
                            } else {
                                f.find(".itemDiv").html("");
                                f.find(".cleanstock").html("").hide();
                                f.find(".sku").val("");
                                f.find(".amount").val("");
                                $.gbox.alert(h.data, {
                                    ok : function ()
                                    {
                                        this.hide()
                                    }
                                })
                            }
                        },//success
						error: function(XMLHttpRequest, textStatus, errorThrown){
							sme.UI.Loading.Close();
							$.gbox.alert('ajax error', {
								ok : function ()
								{
									this.hide()
								}
							})
						}//error
                    })
                }
            }
        });
		//数量手动输入
        $(".amount").blur(function ()
        {
            $(this).parent().children(".cart-alarm").text("").hide();
            var a = $(this);
            var d = $(this).val();
            if (d != "")
            {
                d = parseInt(d);
                if (/^[1-9]\d{0,4}$/.test(d) == false)
                {
                    $(this).parent().children(".cart-alarm").text("数量在1-99999之间").show();
                    $(this).focus();
                    return;
                }
				var pkg = parseInt(a.data('pkg'), 10);
				if (d % pkg != 0)
				{
					alert('请按包装量 '+pkg+' 的倍数购买!!比如：'+pkg+'*3='+pkg*3+'个。');
					return false;
				}
				
                var e = $(this).parent().parent().find(".sku").val();
                var c = [e, d];
				var b = $(this).parent().parent();
                $.sme_Ajax(
                {
                    url : "/ajax/quickorder.php?act=price&r=" + Math.random(), data : "data=" + c.join("|"), 
                    success : function (f)
                    {
                        sme.UI.Loading.Close();
                        if (f.status == false) {
                            a.parent().children(".cart-alarm").text("库存不足，2周补齐？").show();
                        }
                        else {
                            a.parent().children(".cart-alarm").text("").hide();
                        }
						if (b.find(".subtotalDiv").html().length > 0)
						{
							//b.find(".subtotalDiv").html('￥<i class="subtotalVal">' + Math.round(parseFloat(b.find(".final-price").html()) * d * 100) / 100 + "</i>");
							b.find(".subtotalDiv").html('￥<i class="subtotalVal">' + f.sub_total + "</i>");
							b.find(".final-price").html(f.price);
							b.find(".assist-price").html(f.assist_price);
							b.find(".discountDiv").html('￥'+f.discount);
						}
						SumTotalMoney();
                    }
                });
                //SumTotalMoney();
            }
        });
		//-
		$(".reduce").click(function ()
        {
			$(this).parent().children(".cart-alarm").text("").hide();
			var a = $(this).parent().parent().find(".amount");
			var d = a.val();
			
			if (d != "")
			{
				var d = parseInt(d);
				var pkg = parseInt(a.data('pkg'), 10);
				
				if (d % pkg != 0)
				{
					alert('请按包装量 '+pkg+' 的倍数购买!!比如：'+pkg+'*3='+pkg*3+'个。');
					return false;
				}
				d = d - pkg;
				if (d <= 0)
				{
					alert('购买数量必须大于等于最小包装量'+pkg+'!');				
					return false;
				}
				a.val(d);
				
				var e = $(this).parent().parent().find(".sku").val();
				var c = [e, d];
				var b = $(this).parent().parent();
				$.sme_Ajax(
				{
					url : "/ajax/quickorder.php?act=price&r=" + Math.random(), data : "data=" + c.join("|"), 
					success : function (f)
					{
						sme.UI.Loading.Close();
						if (f.status == false) {
							a.parent().children(".cart-alarm").text("库存不足，2周补齐？").show();
						}
						else {
							a.parent().children(".cart-alarm").text("").hide();
						}
						if (b.find(".subtotalDiv").html().length > 0)
						{
							b.find(".subtotalDiv").html('￥<i class="subtotalVal">' + f.sub_total + "</i>");
							b.find(".final-price").html(f.price);
							b.find(".assist-price").html(f.assist_price);
							b.find(".discountDiv").html('￥'+f.discount);
						}
						SumTotalMoney();
					}
				});
			}			
		});
		//+
		$(".increase").click(function ()
        {
			$(this).parent().children(".cart-alarm").text("").hide();
			var a = $(this).parent().parent().find(".amount");
			var d = a.val();
			
			if (d != "")
			{
				var d = parseInt(d);
				var pkg = parseInt(a.data('pkg'), 10);

				if (d % pkg != 0)
				{
					alert('请按包装量 '+pkg+' 的倍数购买!!比如：'+pkg+'*3='+pkg*3+'个。');
					return false;
				}
				d = d + pkg;
				a.val(d);
				if (/^[1-9]\d{0,4}$/.test(d) == false)
				{
					$(this).parent().children(".cart-alarm").text("数量在1-99999之间").show();
					$(this).focus();
					return false;
				}
				var e = $(this).parent().parent().find(".sku").val();
				var c = [e, d];
				var b = $(this).parent().parent();
				
				$.sme_Ajax(
				{
					url : "/ajax/quickorder.php?act=price&r=" + Math.random(), data : "data=" + c.join("|"), 
					success : function (f)
					{
						sme.UI.Loading.Close();
						if (f.status == false) {
							a.parent().children(".cart-alarm").text("库存不足，2周补齐？").show();
						}
						else {
							a.parent().children(".cart-alarm").text("").hide();
						}
						if (b.find(".subtotalDiv").html().length > 0)
						{
							b.find(".subtotalDiv").html('￥<i class="subtotalVal">' + f.sub_total + "</i>");
							b.find(".final-price").html(f.price);
							b.find(".assist-price").html(f.assist_price);
							b.find(".discountDiv").html('￥'+f.discount);
						}
						SumTotalMoney();
					}
				});
			}
		});
		
        $(".operation a").bind("click", function ()
        {
            var b = $(this);
            var a = 
            {
                ok : function ()
                {
                    var c = b.parent().parent();
                    c.find(".itemDiv").html("");
                    c.find(".priceDiv").html("");
                    c.find(".discountDiv").html("");
                    c.find(".subtotalDiv").html("");
                    c.find(".amount").val("");
                    c.find(".sku").val("");
					c.find(".cleanstock").html("").hide();
                    SumTotalMoney();
                    this.hide()
                },
                cancel : function ()
                {
                    this.hide()
                }
            };
            $.gbox.confirm("确定删除此SKU吗？", a)
        });
    };
    AddEvent();
	
    AddCart = function ()
    {
        var c = "";
        var a = true;
        var b = false;
        $(".quick-order").find(".sku").each(function (d)
        {
            var e = $(this).val().toUpperCase().Trim();
            if (e != undefined && e != "") {
                b = true;
                return false;
            }
        });
        if (b == false) {
            $.gbox.alert("请填写SKU订货号！", {
                ok : function ()
                {
                    this.hide()
                }
            });
            return false
        }
        $(".cart-alarm").text("").hide();
        $(".quick-order").find(".sku").each(function (d)
        {
            var e = $(this).val().toUpperCase().Trim();
            var g = $(this).parent().parent().find(".amount").val();
            if (e == undefined) {
                e = ""
            }
            if (g == undefined) {
                g = ""
            }
            if (g != "")
            {
                g = parseInt(g);
                if (/^[1-9]\d{0,4}$/.test(g) == false)
                {
                    $(this).parent().children(".cart-alarm").text("数量在1-99999之间").show();
                    $(this).focus();
                    a = false;
                    return false;
                }
            }
            if (e != "" && g == "") {
                a = false;
                $.gbox.alert("请填写 " + e + " 商品的数量！", {
                    ok : function ()
                    {
                        this.hide();
                    }
                });
                return false
            }
            //c += "&item_no" + d + "=" + e + "&qty" + d + "=" + g;
			c += "&item_no%5B%5D=" + e + "&qty%5B%5D=" + g;
            var f = $(this).parent().parent().find(".item").attr("sn");
            if (e != "") {
                //ga("ec:addProduct", {id : e, name : f, quantity : g});
            }
        });
        if (a)
        {
            SumTotalMoney();
            sme.UI.Loading.Show();
            $.sme_Ajax(
            {
                url : "/ajax/cart.php?act=add2cart&r=" + Math.random(), 
                data : c,
                success : function (d)
                {
                    sme.UI.Loading.Close();
					
                    if (d.result == "true")
                    {
                        window.location = '/cart/';
						
						/*
						if ($(".quick-order").find(".sku").length > 0)
                        {
                            $(".quick-order").find(".sku").each(function (e)
                            {
                                var h = $(this).parent().parent().find(".amount").val();
                                var f = $(this).parent().parent().find(".final-price").text();
                                var g = $(this).parent().parent().find(".item");
                                if (h != "" && g.attr("sn") != undefined)
                                {
									cmCreateShopAction5Tag('"' + g.attr("pc") + '"', '"' + g.attr("pn") + '"', 
                                    '"' + h + '"', '"' + f + '"', '"' + g.attr("cc") + '"', '"' + g.attr("sk") + "-_-" + g.attr("sn") + '"');
                                }
                            });
                            //ga("ec:setAction", "add");
                            //ga("send", "event", "Ecommerce", "AddToCart");
                            //cmDisplayShops()
                        }
						*/
                        //$("#minicartcnt").html(d.totalcount);
                        //window.location = sme.Config.ShoppingCartDomain + "/cart.aspx"
						
                    }
                    else {
                        $.gbox.alert("添加失败，请检查SKU订货号和数量！", {
                            ok : function ()
                            {
                                this.hide();
                            }
                        })
                    }
                }
            })
        }
    };
    $("#btnAddCart").click(function ()
    {
        AddCart()
    });
    $("#btnGoCart").click(function ()
    {
        AddCart()
    });
    $("#btnAddRow").click(function ()
    {
        for (i = 0; i < 10; i++)
        {
            $("#qtable").append("<tr><td class='prd-list-select'><input type='checkbox'></td><td><input type='text' class='sku'></td><td><div class='itemDiv'></div></td><td><div class='priceDiv'></div></td><td class='assist-text'><div class='discountDiv'></div></td><td>\n<a href='javascript:void(0);' class='reduce'></a>\n<input type='text' maxlength='3' class='amount'>\n<a href='javascript:void(0);' class='increase'></a><div style='display:none' class='cart-alarm'></div></td><td><div class='subtotalDiv'></div></td><td class='operation'><a href='javascript:void(0);'>删除</a></td></tr>")
        }
        AddEvent()
    });
    $("#btnAddNo").click(function ()
    {
        if ($("#txtNo").val() == "") {
            $.gbox.alert("请添加SKU清单！", {
                ok : function ()
                {
                    this.hide()
                }
            })
        }
        else
        {
            $("#qtable tbody tr").each(function ()
            {
                var e = $(this);
                e.find(".itemDiv").html("");
                e.find(".priceDiv").html("");
                e.find(".discountDiv").html("");
                e.find(".subtotalDiv").html("");
                e.find(".amount").val("");
                e.find(".sku").val("");
                e.find("input:checkbox").attr("checked", false);
                SumTotalMoney()
            });
            var d = new Array();
            d = $("#txtNo").val().ReplaceAll("，", ",").split(",");
            var b = $("#qtable tbody tr").length;
            for (i = 0; i < d.length; i++)
            {
                var c = false;
                $(".quick-order").find(".sku").each(function (e)
                {
                    var f = $(this).val().toUpperCase();
                    if (f == d[i]) {
                        c = true;
                    }
                });
                if (c == false)
                {
                    if (i < b)
                    {
                        $("#qtable tbody tr").each(function (e)
                        {
                            if (i == e)
                            {
                                var f = $(this);
                                f.find(".sku").val(d[i]);
                                sme.UI.Loading.Show();
                                $.sme_Ajax(
                                {
                                    url : "/ajax/quickorder.php?act=info&r=" + Math.random(), 
									data : "data=" + d[i], 
                                    success : function (h)
                                    {
                                        sme.UI.Loading.Close();
                                        if (h.status == true)
                                        {
                                            //var g = jQuery.parseJSON(h.data);
											var g = h.data;
                                            f.find(".itemDiv").html('<a class="p-img" href="' + encodeURI(g.result.url) + '" target="_blank"><img src="' + g.result.image + '" alt="' + g.result.description + '" width="57" /></a><p class="item" sk="' + g.item_no + '" sn="' + g.result.item_desc + '" pc="' + g.result.product_code + '" pn="' + g.result.product_name + '" cc="' + g.result.category_code + '" ><a href="' + encodeURI(g.result.url) + '" target="_blank">' + g.result.product_name + "</a><br /><span>品牌：" + g.result.brand_name + "</span><br /><span>规格：" + g.result.xy_value + "</span><br /><span>包装数量（" + g.result.phy_uom + "）：" + g.result.package_qty + "</span></p>");
                                            f.find(".priceDiv").html('￥<i class="final-price">' + g.result.final_price + '</i><br />￥<i class="assist-price">' + g.result.list_price + "</i>");
                                            f.find(".discountDiv").html("￥" + g.result.discount + "");
                                            f.find(".subtotalDiv").html('￥<i class="subtotalVal">' + g.result.final_price + "</i>");
                                            f.find(".amount").val(g.result.package_qty);
											f.find(".amount").data('pkg', g.result.package_qty);
                                            f.find(".sku").val(g.item_no);
                                            SumTotalMoney()
                                        }
                                        else
                                        {
                                            f.find(".itemDiv").html("");
                                            f.find(".sku").val("");
                                            f.find(".amount").val("");
                                            $.gbox.alert(h.data, {
                                                ok : function ()
                                                {
                                                    this.hide()
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }
                    else
                    {
                        $("#qtable").append("<tr><td class='prd-list-select'><input type='checkbox'></td><td><input type='text' class='sku' value='" + d[i] + "'></td><td><div class='itemDiv'></div></td><td><div class='priceDiv'></div></td><td class='assist-text'><div class='discountDiv'></div></td><td><input type='text' maxlength='3' class='amount' value='1'><div style='display:none' class='cart-alarm'></div></td><td><div class='subtotalDiv'></div></td><td class='operation'><a href='javascript:void(0);'>删除</a></td></tr>");
                        AddEvent();
                        var a = $("#qtable tr:last");
                        sme.UI.Loading.Show();
                        $.sme_Ajax(
                        {
                            url : "/ajax/quickorder.php?act=info&r=" + Math.random(), 
							data : "data=" + d[i], 
                            success : function (f)
                            {
                                sme.UI.Loading.Close();
                                if (f.status == true)
                                {
                                    //var e = jQuery.parseJSON(f.data);
									var e = f.data;
                                    a.find(".itemDiv").html('<a class="p-img" href="' + encodeURI(e.result.url) + '" target="_blank"><img src="' + e.result.image + '" alt="' + e.result.description + '" width="57" /></a><p class="item" sk="' + e.item_no + '" sn="' + e.result.item_desc + '" pc="' + e.result.product_code + '" pn="' + e.result.product_name + '" cc="' + e.result.category_code + '" ><a href="' + encodeURI(e.result.url) + '" target="_blank">' + e.result.product_name + "</a><br /><span>品牌：" + e.result.brand_name + "</span><br /><span>规格：" + e.result.xy_value + "</span><br /><span>包装数量（" + e.result.phy_uom + "）：" + e.result.package_qty + "</span></p>");
                                    a.find(".priceDiv").html('￥<i class="final-price">' + e.result.final_price + '</i><br />￥<i class="assist-price">' + e.result.list_price + "</i>");
                                    a.find(".discountDiv").html("￥" + e.result.discount + "");
                                    a.find(".subtotalDiv").html('￥<i class="subtotalVal">' + e.result.final_price + "</i>");
                                    a.find(".amount").val(g.result.package_qty);
									f.find(".amount").data('pkg', g.result.package_qty);
                                    a.find(".sku").val(e.item_no);
                                    SumTotalMoney();
                                }
                                else
                                {
                                    a.find(".itemDiv").html("");
                                    a.find(".sku").val("");
                                    a.find(".amount").val("");
                                    $.gbox.alert(f.data, {
                                        ok : function ()
                                        {
                                            this.hide();
                                        }
                                    })
                                }
                            }
                        })
                    }
                }
            }
        }
    });
    $("#chkall").click(function ()
    {
        $("#qtable tbody tr").each(function ()
        {
            var a = $(this);
            if ($("#chkall").attr("checked") == undefined) {
                a.find("input:checkbox").attr("checked", false)
            } else {
                a.find("input:checkbox").attr("checked", true)
            }
        })
    })
})();
