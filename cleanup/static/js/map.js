var gmap, pos, defaultwindow;
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
                pos = {
                    lat: data.lat,
                    lng: data.lon
                };
                gmap.setCenter(pos);
                loadIncidents();
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

function loadIncidents()
{
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
        id: counter
    });
    markers.push(marker)
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
            '<li>User:' +
            user.first_name + 
            '</li>' +
            '<li>Cleanup Type:' +
            incident.incident_type + 
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div>' +
            '<img src=' + 
            incident.image_before + 
            '/>' +
            '</div>' +
            '<div class="marker_buttons"><button class="btnSmall" onclick="window.location.href = \'/cleanup?pin=' + incident._id +'\'">Cleanup</button>'
        
        if (logged_in_user != "" && (logged_in_user._id == incident.uploader) || logged_in_user.account_level == 100)
        {
            html += '<button onclick="removemarker()" class="btnDelete"><i class="fa fa-trash" aria-hidden="true"></i></button>'
            console.log("MATCHED: " + logged_in_user._id + " == " + incident.uploader);
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
    marker.setMap(null);
}
