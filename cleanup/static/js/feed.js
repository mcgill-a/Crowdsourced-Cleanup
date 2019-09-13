$(document).ready(() => {
    refresh();
    setInterval(() => {refresh();}, 10000);
});

function refresh () {
    $.get('/feed', data => {
        //console.log(data);
        resHTML = "<tbody class='feedTBody'>";
        var reversed = data.reverse()
        reversed.forEach(element => {
            if (element.type == "new_pin") {
                resHTML += "<tr class='feedTR'><td class='feedEntry'>New <div class='clickable' onClick='goToPin(\""+element.incident_id+"\")'>pin</div> uploaded by <div class='clickable' onClick='window.location.href = \"/profiles/" + element.user_id + "\";'>" + element.user_first_name + "</div></td></tr>";
            }
            else if (element.type == "clean") {
                resHTML += "<tr class='feedTR'><td class='feedEntry'><div class='clickable' onClick='goToPin(\""+element.incident_id+"\")'>pin</div> was cleaned by <div class='clickable' onClick='window.location.href = \"/profiles/" + element.user_id + "\";'>" + element.user_first_name + "</div></td></tr>";
            }
        });
        resHTML += "</tbody>";
        $('#feed').html(resHTML);
    });
}

var feedToggle = false;

function toggleFeed () {
    if (!feedToggle) {
        $("#feedContainer").css("min-width","200px");
        $("#feedContainer").css("max-height","80%");
        $("#feedContainer").css("min-height","80%");
        $("#feedContainer").css("left", "20px");
        $("#feed").css("display","flex");
        $("#feed").css("width", "100%");
        $("#feed").css("justify-content", "center");
        feedToggle = true;
    } else {
        $("#feedContainer").css("min-width","0px");
        $("#feedContainer").css("min-height","0px");
        $("#feedContainer").css("left", "");
        $("#feed").css("display","none");
        feedToggle = false;
    }
}

window.onresize = checkSize;

function checkSize () {
    if (screen.width > 450) {
        $("#feedContainer").css("min-width","200px");
        $("#feedContainer").css("max-height","225px");
        $("#feedContainer").css("min-height","100px");
        $("#feedContainer").css("left", "");
        $("#feed").css("display","inline-block");
        $("#feed").css("width", "");
    } else {
        feedToggle = false;
        $("#feedContainer").css("display","flex");
        $("#feedContainer").css("min-width","0px");
        $("#feedContainer").css("max-height","100%");
        $("#feedContainer").css("min-height","0px");
        $("#feedContainer").css("left", "");
        $("#feed").css("display", "none");
    }
}
