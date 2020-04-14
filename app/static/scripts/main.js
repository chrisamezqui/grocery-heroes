var config; // universal
var mapState, map, infoWindow; //for helper page

function getHttpConnection() {
  if (window.XMLHttpRequest) {
     return new XMLHttpRequest();
   }
  return new ActiveXObject("Microsoft.XMLHTTP");
}

function formatNumber(formString) {
  let numbers = formString.match(/\d+/g).join('');
  return '(' + numbers.slice(0,3) + ') ' + numbers.slice(3, 6) + '-' + numbers.slice(6);
}

function sendRegistrationData(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let form = document.getElementById("registrationForm");
  let formdata = new FormData(form);
  formdata.set("phone", formatNumber(formdata.get('phone')));
  formdata.append("longitude", longitude);
  formdata.append("latitude", latitude);
  let xmlhttp = getHttpConnection();
  xmlhttp.open( "POST", config.helpeeEndpoint);
  xmlhttp.send(formdata);

  document.getElementById("registrationBody").innerHTML = '<h2> <div>Thank you for '+
  'submitting your request.</div> </h2>' +
  '<div class="narrative"> <p> View or clear your request from the '+
  '<a href="'+ config.helperEndpoint+'#map">helper page</a>. </p> </div>';
  document.getElementById("registrationHeader").innerHTML = '';
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.")
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.")
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.")
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.")
      break;
  }
}

function registrationOnClick(event) {
  event.preventDefault();
  if (this.elements[0].value.length === 0) {
    alert("Please enter your phone number before clicking submit.");
  } else if(!this.elements[2].checked) {
    alert("Please indicate that you have read and agree to the Terms and Conditions.")
  } else {
    useGeolocationPosition(sendRegistrationData, showError, {enableHighAccuracy : true});
  }
}

function getInfoWindowDefaultContent(phone) {
  return '<div style="color:black" id="helperNotification">'+
             '<h2>Interested in helping out?</h2>'+
             '<p><b>Phone Number:</b>' + phone +
             '<br>If a request has been '+
             'completed: Click "Clear Request".</p>'+
             '<div align="middle"><button id="doneButton">Clear Request</button></div></div>';
}

function centerMap(position) {
  let pos = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  map.setCenter(pos);
}

//replace with confirmation window
function initConfirmationWindow(event) {
  let contentString = '<div style="color:black" id="helperNotification">'+
                      '<h2>Thank you for your help!</h2>'+
                      '<p>Cick "Undo" if this was a mistake or click "Continue" '+
                      ' to confirm.</p><button style="padding-right:4px" id="undoButton">Undo</button>' +
                      '<button id="confirmButton">Continue</button></div>';
  infoWindow.setContent(contentString);
}

function removeRequest() {
  let activeMarker = mapState.activeMarker;
  let userphone = mapState.phoneMap.get(activeMarker);

  //update frontend data
  mapState.phoneMap.delete(activeMarker);
  activeMarker.setMap(null);

  //Delete record form database
  let userlng = activeMarker.getPosition().lng();
  let userlat = activeMarker.getPosition().lat();
  let formdata = new FormData();
  formdata.append("longitude", userlng);
  formdata.append("latitude", userlat);
  formdata.append("phone", userphone);
  let xmlhttp = getHttpConnection();
  xmlhttp.open("DELETE", config.helperEndpoint, true);
  xmlhttp.send(formdata);
}

function initInfoWindow() {
    let doneButton = document.getElementById("doneButton");
    if (doneButton !== null) {
      doneButton.addEventListener('click', initConfirmationWindow);
    }

    let confirmButton = document.getElementById("confirmButton");
    let undoButton = document.getElementById("undoButton");
    if (confirmButton !== null && undoButton !== null) {
      //logic from request removal confirmation
      confirmButton.addEventListener("click", removeRequest);

      //logic to undo request removal
      undoButton.addEventListener("click", function() {
        infoWindow.setContent(getInfoWindowDefaultContent(mapState.phoneMap.get(mapState.activeMarker)));
      });
    }
}

function useGeolocationPosition(success, failure, config) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, failure, config);
  } else {
    alert('Your browser does not support Geolocation services: Some features may not work.');
  }
}

function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
  let R = 6378.137; // Radius of earth in KM
  let dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  let dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
  let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c;
  return d * 1000; // meters
}

function calculateRadius(radiusDegrees, lat, lng) {
  let radiusInMeters = measure(lat, lng, lat + Math.sqrt(Math.pow(radiusDegrees, 2) / 2), lng + Math.sqrt(Math.pow(radiusDegrees, 2) / 2));
  console.log(radiusInMeters, radiusDegrees, lat, lng);
  return radiusInMeters;
}

function addRequestMarkers(requests) {
  for (let i = 0; i < requests.length; i++) {
    let request = requests[i];
    let marker = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.25,
            map: map,
            center: {lat : request.latitude, lng : request.longitude},
            radius: calculateRadius(config.srambleRadius, request.latitude, request.longitude)
          });


    // let marker = new google.maps.Marker({
    //   position : {lat : request.latitude, lng : request.longitude},
    //   map : map,
    //   title : 'Somebody could use some help here!'
    // });

    marker.addListener('click', function() {
      document.getElementById("map").scrollIntoView({behavior : 'smooth'});
      map.panTo(this.getPosition());
      mapState.activeMarker = this;
      let contentString = getInfoWindowDefaultContent(mapState.phoneMap.get(this));
      infoWindow.setContent(contentString);
      infoWindow.open(map, this);
    });

    // marker.setMap(map);
    mapState.phoneMap.set(marker, request.phone);
  }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 37.8715, lng: 122.2730},
      zoom: 13
    });
    mapState = {
      activeMarker : null,
      phoneMap : null
    };

    infoWindow = new google.maps.InfoWindow;

    mapState.phoneMap = new Map();
    useGeolocationPosition(centerMap, showError, {enableHighAccuracy : true});

    //Add event listeners to the buttons that can be in the infowindow
    infoWindow.addListener('domready', initInfoWindow);

    //Request local request json object form db and update mjap
    let xmlhttp = getHttpConnection();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        let localRequests = JSON.parse(xmlhttp.responseText).localRequests;
        addRequestMarkers(localRequests);
      }
    };
    xmlhttp.open("GET", config.requestsEndpoint, true);
    xmlhttp.send();

    initInfoWindow();
}

function initModal() {
  let modal = document.getElementById("modal");
  let btn = document.getElementById("tnc");
  let span = document.getElementsByClassName("close")[0];
  let acceptButton = document.getElementById("tncAccept");

  // When the user clicks the button, open the modal
  btn.onclick = function() {
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  acceptButton.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function showMap(event) {
  event.preventDefault();
  if(!this.elements[0].checked) {
    alert("Please indicate that you have read and agree to the Terms and Conditions.")
  } else {
    document.getElementById("tncMapForm").style.display = "none";
    let mapElement = document.getElementById("map");
    mapElement.style.height = "100%";
    mapElement.scrollIntoView({behavior : 'smooth'});
  }
}

function initHelpeePage(options) {
  config=options;
  document.getElementById( "registrationForm" ).addEventListener( "submit", registrationOnClick);
  initModal();
}

function initHelperPage(options) {
  config=options;
  document.getElementById("tncMapForm").addEventListener( "submit", showMap);
  initModal();
}
