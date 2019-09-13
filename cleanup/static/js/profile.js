$(document).ready(() => {

    $.get('/', data => {
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

});