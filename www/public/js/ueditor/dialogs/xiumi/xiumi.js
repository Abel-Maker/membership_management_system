/**
 * Created by shunchen_yang on 16/10/25.
 */
UE.registerUI('dialog', function (editor, uiName) {
    var btn = new UE.ui.Button({
        name   : 'xiumi-connect',
        title  : '',
        onclick: function () {
            var dialog = new UE.ui.Dialog({
                iframeUrl: '/public/js/ueditor/dialogs/xiumi/xiumi.html',
                editor   : editor,
                name     : 'xiumi-connect',
                title    : "",
                cssRules : "width: " + (window.innerWidth - 60) + "px;" + "height: " + (window.innerHeight - 60) + "px;",
            });
            dialog.render();
            dialog.open();
        }
    });

    return btn;
});