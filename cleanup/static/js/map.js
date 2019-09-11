var gmap, pos, infowindow;

function initMap() {
    gmap = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 15
    });
    infowindow = new google.maps.InfoWindow({
        content: '<img src="/static/resources/default/trash-icon.jpg"/>' +
            '<div>' +
            '<ul>' +
            '<li>Detail 1</li>' +
            '<li>Detail 2</li>' +
            '<li>Detail 3</li>' +
            '</ul>' +
            '</div>'
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            gmap.setCenter(pos);
            addMarker();
        });
    }
}

function addMarker() {
    var marker = new google.maps.Marker({
        position: pos,
        map: gmap,
        animation: google.maps.Animation.DROP,
        title: "Trash #00000",
        icon: '/static/resources/default/markers/red_markerA.png'
    });
    marker.addListener('click', function () {
        infowindow.open(gmap, marker);
    })
}

function addRandomMarker(colour) {
    console.log(colour);
    var max = .005;
    var min = -.005;
    var newPos = {
        lat: pos.lat + Math.random() * (+max - +min),
        lng: pos.lng + Math.random() * (+max - +min)
    }
    var marker = new google.maps.Marker({
        map: gmap,
        position: newPos,
        icon: '/static/resources/default/markers/' + colour

    });

    marker.addListener('click', function () {
        infowindow.open(gmap, marker);
    })
}