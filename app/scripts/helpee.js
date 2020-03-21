window.onload = function() {
  alert("HELLO WORLD")
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var longitude = position.coords.latitude;
        var latitude = position.coords.longitude;
    }, function() {
      handleLocationError(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false);
  }
  function handleLocationError(browserHasGeolocation) {
    alert(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
  }
}



// }

// function postInformation() {
//   var formEl = document.forms.infoForm;
//   FormData(formEl).append(longitude=longitude);
//   FormData(formEl).append(latitude=latitude);
//
// }
