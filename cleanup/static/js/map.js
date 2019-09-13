var gmap, pos, defaultwindow, heatmap;
var markers = []; 
var counter = 0;
var openedMarkerID;
var infowindow 
function initMap() {
    infowindow = new google.maps.InfoWindow({

    })

   
    gmap = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 15
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: gmap,
        radius: 30
    })
   
    infowindow.setContent('<div>' +
        '<ul>' +
        '<li>Detail 1</li>' +
        '<li>Detail 2</li>' +
        '<li>Detail 3</li>' +
        '</ul>' +
        '</div>' +
        '<div>' +
        '<img src="/static/resources/default/trash-icon.jpg"/>' +
        '</div>'+
        '<button onclick="removemarker()" class="btnSmall">Remove</button>')

    const urlParams = new URLSearchParams(window.location.search);
    
    if (navigator.geolocation) {
        // If we have a pin query, ajax the pin and center on its lat lon
        if (urlParams.get('pin')) {
            $.get("/pins?pin=" + urlParams.get('pin'), data => {
                loadIncidents();
                goToPin(data._id);
                
            });
            // Else center on Edinburgh Napier
        } else {
            /*navigator.geolocation.getCurrentPosition(function (position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                gmap.setCenter(pos);
                //addMarker(1);
                loadIncidents();
            });*/
            pos = {
                lat: 55.933611111111105,
                lng: -3.2130555555555556
            }
            gmap.setCenter(pos);
            loadIncidents();
        }
    }
}

function getPinFromID(idVal){
    var incident; 
    $.ajax({
        async:false,
        type:"GET",
        url:"/pins/?pin=" + idVal,
        timeout: 60000,
        success: function(data){
            incident = data;
        }
    });
    return incident;
}

function goToPin(idVal){
    var incident ;
    console.log("/pins/?=pin" + idVal);
    $.ajax({
        async:false,
        type:"GET",
        url:"/pins/?pin=" + idVal,
        timeout: 60000,
        success: function(data){
            incident = data;
            console.log(incident);
            pos = {
                lat: incident.lat,
                lng: incident.lon
            };
            gmap.setCenter(pos);
            for (var i=0; i < markers.length; i++){
                if (markers[i].position.lat().toFixed(10) == pos.lat.toFixed(10) && markers[i].position.lng().toFixed(10) == pos.lng.toFixed(10)) {

                    google.maps.event.trigger(markers[i], 'click')
                
                }
            }
        }
    })
}
function loadIncidents()
{
    console.log("loading");
    markers = [];
    var incidents
    $.ajax({
        async:false,
        type:"GET",
        url:"/pins",
        timeout: 60000,
        success: function (data) {
            incidents = data;
            console.log(incidents);
            for (var i = 0; i < incidents.length; i++)
            {
                addMarker(incidents[i]);
                
            }
        }
    });
}

function toggleHeatmap(){
    heatmap.setMap(heatmap.getMap() ? null : gmap);
}

function getPoints() {
    var markers;
    var mapPoints = []
    $.ajax({
        async:false,
        type:"GET",
        url:"/pins",
        timeout: 60000,
        success: function(data){
            markers = data;
            for (i=0; i < markers.length; i++){
                mapPoints.push(new google.maps.LatLng(markers[i].lat, markers[i].lon))
            }
        }
    })
    
   
    console.log(mapPoints);
    return mapPoints
}

function addMarker(incident) {
    
    var latlong = {
        lat: incident.lat,
        lng: incident.lon
    }

    

    var marker = new google.maps.Marker({
        position: latlong,
        map: gmap,
        animation: google.maps.Animation.DROP,
        title: "Trash",
        icon: '/static/resources/default/markers/marker_a.png',
        id: counter,
        dboid: incident._id
    });

    if (incident.status == "Complete") 
    {
        marker.icon = '/static/resources/default/markers/marker_c.png';
    }
    
    markers.push(marker);
    counter++;
    marker.addListener('click', function () {
        var user;
        $.ajax({
            async:false,
            type: "GET",
            url: "/users?user="+incident.uploader,
            timeout: 60000,
            success: function(data){
                user =  data;
            }

        })
        var logged_in_user;
        $.ajax({
            async:false,
            type: "GET",
            url: "/users/current",
            timeout: 60000,
            success: function(data){
                logged_in_user =  data;
            }

        })
        var html = '<div>' +
            '<ul>' +
            '<li>Date Created: ' + 
            incident.date_created +
            '</li>' +
            '<li>Added by: ' +
            user.first_name + 
            '</li>' +
            '<li>Status: ' +
            incident.status + 
            '</li>' +
            '<li>Value: ' +
            incident.value + 
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<img class="popup_img" src=' + 
            incident.image_before + 
            '/>' +
            '</div><div class="marker_buttons">';

        
        // If incident is available, show clean button
        if (incident.status == "Available")
        {
            html += '<button onclick="clean()" class="popup_btn clean" onclick="window.location.href = \'/cleanup?pin=' + incident._id +'\'"><p>CLEAN</p><i class="fas fa-clipboard-check"></i></button>'
        }
        // If incident isn't their own post, show report button
        if (logged_in_user != "" && (logged_in_user._id != incident.uploader))
        {
            html += '<button onclick="report()" class="popup_btn report" onclick="window.location.href = \'/report?pin=' + incident._id +'\'"><p>REPORT</p><i class="fas fa-flag"></i></button>'
        }
        // If user posted the incident or the user is an admin, show delete button
        if (logged_in_user != "" && (logged_in_user._id == incident.uploader) || logged_in_user.account_level == 100)
        {
            html += '<button onclick="removemarker()" class="popup_btn btn_red"><i class="fa fa-trash" aria-hidden="true"></i></button>'
        }
        
        html += "</div>"

        infowindow.setContent(html);
        infowindow.open(gmap, marker);
        openedMarkerID = marker.id;
    })
}

function addRandomMarker(colour) {
    var max = .005;
    var min = -.005;
    var newPos = {
        lat: pos.lat + Math.random() * (+max - +min),
        lng: pos.lng + Math.random() * (+max - +min)
    }
    var marker = new google.maps.Marker({
        map: gmap,
        position: newPos,
        icon: '/static/resources/default/markers/' + colour,
        id: counter

    });
    markers.push(marker)
    counter++;
    marker.addListener('click', function () {
        infowindow.open(gmap, marker);
        openedMarkerID = marker.id;
    })
}

function removemarker(){
    var marker = markers[openedMarkerID];

    $.ajax({
        async:false,
        type: "POST",
        url: "/pins/delete/?incident_id="+marker.dboid,
        timeout: 60000,
        success: function(data){
            console.log("POST: DELETE " + marker.dboid);
        }
    })

    marker.setMap(null);

}

function clean(){
    var marker = markers[openedMarkerID];

    $.ajax({
        async:false,
        type: "POST",
        url: "/pins/clean/?incident_id="+marker.dboid,
        timeout: 60000,
        success: function(data){
            console.log("POST: CLEAN " + marker.dboid);
           
        }
    })

    marker.setIcon ('/static/resources/default/markers/marker_c.png');

}

function report(){
    var marker = markers[openedMarkerID];

    $.ajax({
        async:false,
        type: "POST",
        url: "/pins/report/?incident_id="+marker.dboid,
        timeout: 60000,
        success: function(data){
            console.log("POST: REPORT " + marker.dboid);
        }
    })
}

function refreshMarkers(){
   
    console.log("refreshing");
    loadIncidents();
}