

$(function(){
    $("#btnLogin").click(function(e){
       
        var data = {
            email: $('#inputEmail').val(), 
            password: $('#inputPassword').val()
        };

        ajaxCall.post('/user/authenticate', data,
            success = function()
            {
                document.location.href = '/';
            },
            error = function(){
                console.log(textStatus + ': ' + errorThrown);
            }
        );
    });
});