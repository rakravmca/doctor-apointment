var ajaxCall = {
    get : function(url, cbs, cbe){
        $.ajax({
            dataType: 'json',
            method:'get',
            url: url,
            success: function(data, textStatus, jqXHR) {
                alert();
                cbs(data, textStatus, jqXHR);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                cbe(jqXHR, textStatus, errorThrown);
            }
        });
    },
    post : function(url, data, cbs, cbe){
        $.ajax({
            dataType: 'json',
            method:'post',
            data:data,
            url: url,
            success: function(data, textStatus, jqXHR) {
                alert();
                cbs(data, textStatus, jqXHR);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                cbe(jqXHR, textStatus, errorThrown);
            }
        });
    }
}