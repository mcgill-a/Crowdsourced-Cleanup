$(document).ready(() => {
    refresh();
});

function refresh () {
    $.get('/pins', data => {
        console.log(data);
        resHTML = "";
        data.forEach(element => {
            /*$.get('/users?user=' + element.uploader, user => {
                console.log(user);
                resHTML += "<tr><td> User " + user.first_name + " uploaded a new pin!</td></tr>";
            });*/
            $.ajax({
                url: '/users?user=' + element.uploader,
                type: 'GET',
                async: false,
                cache: true,
                timeout: 30000,
                error: () => {
                    return true;
                },
                success: user => { 
                    resHTML += "<tr class='feedTR'><td class='feedEntry'>User <div class='clickable' onClick='window.location.href = \"/users?user=" + user._id + "\";'>" + user.first_name + "</div> uploaded a new <div class='clickable' onClick='window.location.href = \"/?pin=" + element._id + "\";'>pin</div> !</td></tr>";
                }
            });
        });
        $('#feed').html(resHTML);
    });
}