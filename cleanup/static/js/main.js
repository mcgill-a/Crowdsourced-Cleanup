$("document").ready(function(){
    setTimeout(function(){
        $(".main").remove();
    }, 5000 ); // 5 secs

});

function myFunction(){
    document.getElementById("myDropdown").classList.toggle("show");
}

var navToggle = false;

function toggleNav () {
    if (screen.width > 570)
        return;
    if (!navToggle) {
        $('.nav-menu').css("display", "flex");
        navToggle = true;
    } else {
        $('.nav-menu').css("display", "none");
        navToggle = false;
    }
}

/*

window.onclick = function(event){
    if (!event.target.matches('.dropbtn')){
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i; 
        for (i=0; i < dropdowns.length; i++){
            var openDropdown = dropdowns[i]; 
            if (openDropdown.classList.contains('show')){
                openDropdown.classList.remove('show');
            }
        }
    }
}

*/