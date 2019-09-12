$(document).ready(() => {
    refresh();
    setInterval(() => {refresh();}, 10000);
});

function refresh () {
    $.get('/feed', data => {
        console.log(data);
        resHTML = "";
        data.forEach(element => {
            /*$.get('/users?user=' + element.uploader, user => {
                console.log(user);
                resHTML += "<tr><td> User " + user.first_name + " uploaded a new pin!</td></tr>";
            });*/
            if (element.type == "new_pin") {
                resHTML += "<tr class='feedTR'><td class='feedEntry'>User <div class='clickable' onClick='window.location.href = \"/users?user=" + element.user_id + "\";'>" + element.user_first_name + "</div> uploaded a new <div class='clickable' onClick='window.location.href = \"/?pin=" + element.incident_id + "\";'>pin</div> !</td></tr>";
            }
        });
        $('#feed').html(resHTML);
    });
}