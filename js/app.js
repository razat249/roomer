'use strict';
// Initialize Firebase
var config = {
  apiKey: "AIzaSyDL8MTBMreqLsV82okOP9iXf-9cdlx3J1E",
  authDomain: "roomer-4b356.firebaseapp.com",
  databaseURL: "https://roomer-4b356.firebaseio.com",
  storageBucket: "roomer-4b356.appspot.com",
  messagingSenderId: "1060768042088"
};
firebase.initializeApp(config);

var dbRef = firebase.database().ref().child('roomList');
var locations;
var map;
// Create a new blank array for all the listing markers.
var markers = [];
var initMap = function() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    mapTypeControl: true,
    mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
    }
  });
  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  window.largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });

    marker.info = locations[i]
    // Push the marker to our array of markers.
    markers.push(marker);
    locations[i].marker = marker
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
      toggleBounce(this);
    });
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    console.log(marker.info)
    infowindow.setContent('<div>' + '<b>' + 'Landlord name: ' + 
            marker.info.name + '</b>'+ '<br>' + marker.info.address + 
            '<br><br>' + marker.info.description + '<br>'+ '<a href="tell:'+ marker.info.mobile +'">'+ marker.info.mobile + '</a>' +'</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function(){
      // infowindow.setMarker(null);
    });
  }
}

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setAnimation(null);
    }
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

var stringStartsWith = function (string, startsWith) {          
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

var viewModel = function() {
	var self = this;
	this.locationsList = ko.observableArray(locations)
	this.openInfo = function(location) {
    populateInfoWindow(location.marker, largeInfowindow);
    toggleBounce(location.marker);
	}
	this.filterString = ko.observable('');
  this.filteredList = ko.computed(function() {
    var filter = this.filterString().toLowerCase();
    if (!filter) {
        return this.locationsList();
    } else {
        return ko.utils.arrayFilter(this.locationsList(), function(item) {
            return stringStartsWith(item.address.toLowerCase(), filter);
        });
    }
  }, this);
}

dbRef.once('value').then(function(data) {
  locations = data.val();
  initMap();
  ko.applyBindings(new viewModel());
});