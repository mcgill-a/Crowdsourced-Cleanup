
var entryCount = 0; 
var start = true;
$(document).ready(function(){
    refresh(start);
    start = false

});
var myinterval;
clearInterval(myinterval);
myinterval = setInterval(function() {
    refresh(start);
}, 10000);

function refresh (start) {
    var thisCount =0;
    $.get('/feed', data => {
        resHTML = "";
        var reversed = data.reverse()
        if (start == true){
            entryCount = data.length;
        }
        reversed.forEach(element => {
            thisCount++;
            if (element.type == "new_pin") {
                resHTML += "<tr class='feedTR'><td class='feedEntry'>New <div class='clickable' onClick='goToPin(\""+element.incident_id+"\")'>pin</div> uploaded by <div class='clickable' onClick='window.location.href = \"/users?user=" + element.user_id + "\";'>" + element.user_first_name + "</div></td></tr>";
            }
            else if (element.type == "clean") {
                resHTML += "<tr class='feedTR'><td class='feedEntry'><div class='clickable' onClick='goToPin(\""+element.incident_id+"\")'>pin</div> was cleaned by <div class='clickable' onClick='window.location.href = \"/users?user=" + element.user_id + "\";'>" + element.user_first_name + "</div></td></tr>";
            }
        });
        if ((thisCount > entryCount) && (start == false)){
            
            var diff = thisCount - entryCount;
            entryCount = thisCount;
            
                for (var i = 0; i < diff; i ++){
                    if (data[i].type != "clean"){
                        marker = getPinFromID(data[i].incident_id)
                        addMarker(marker);
                    }
                }
            
           
        }
        if (thisCount < entryCount){
            entryCount = thisCount;
        }
        $('#feed').html(resHTML);
    });
}
