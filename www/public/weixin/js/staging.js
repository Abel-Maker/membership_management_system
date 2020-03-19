function getQueryString(name) {
    var result = window.location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}
if($(".hidden").length == 0){
    $(".btn_show").css('display','none');
}
//提交按钮
$('#submit').on('click', function () {
    $.confirm({
        text: $.i18n.prop('areYouSureWithdrawal'),
        onOK: function () {
            var obj=$("input[type=checkbox]:checked"),
                repay=[],
                pay_amount=0;
            if(obj.length==0){
                $.toast($.i18n.prop('selectAtLeastOne'), 'cancel');
            }else{
                for(var i=0; i<obj.length; i++){ 
                    if(obj[i].checked) {
                        pay_amount+=parseFloat(obj[i].dataset.money); 
                        repay.push({
                            money : obj[i].dataset.money,
                            order_id : obj[i].dataset.orderId
                        })
                    }
                } 
                var data={
                    pay_amount: pay_amount,
                    repay: repay
                };
                var url = '/index.php?r=agent/my/repay';
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: data,
                    success: function (res) {
                        if(res.info === 'success') {
                            if(getQueryString('r')=='agent/my/order'){
                                $.showLoading($.i18n.prop('success'), 'success');
                                setTimeout(function(){
                                    location.href = 'index.php?r=agent/my/order&t=time';
                                },1000)
                            }else{
                                $.showLoading($.i18n.prop('success'), 'success');
                                var cm_id=getQueryString('cm_id');
                                setTimeout(function(){
                                    location.href = 'index.php?r=agent/my/detail&cm_id='+cm_id+'&t=staginglog';
                                },1000)
                            }
                        }else {
                            $.toast($.i18n.prop('fail'), 'cancel');
                        }
                    },
                    error: function (e) {
                        $.toast($.i18n.prop('tryAgain'), 'cancel');
                    }
                });
            }
        },
        onCancel: function () {
        }
    });
});
//checkbox点击事件
var repaymoney = 0,
    totalstage=0;
$(".checkbox").click(function () {
    if ($(this).prop("checked")) {
        repaymoney += parseFloat($(this).data("money"));
        totalstage++;
    } else {         
        repaymoney -= parseFloat($(this).data("money") ); 
        totalstage--;
    }
    $("#totalmoney").html(repaymoney);
    $("#totalstage").html(totalstage)
    //根据当前的选择决定全选的是否选择
    var $subs = $(".checkbox");
    $(".allchecked").prop("checked", $subs.length == $subs.filter(":checked").length ? true : false);
})
//全选
$(".allchecked").click(function() {
    $(".checkbox").prop("checked", this.checked);
    var repaymoney_all = 0,
        totalstage_all = 0;
    if(this.checked){
        var $subs = $(".checkbox"),
            totalstage_all = $subs.length;
        for (var i = 0; i < $subs.length;i++){
            repaymoney_all += parseFloat($subs.eq(i).data("money"))
        }
        $("#totalmoney").html(repaymoney_all)
        $("#totalstage").html(totalstage_all)
        window.repaymoney= repaymoney_all;
        window.totalstage = totalstage_all;
    }else{
        $("#totalmoney").html('0');
        $("#totalstage").html('0')
    }
})
