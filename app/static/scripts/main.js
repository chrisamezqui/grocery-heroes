var xmlhttp, config; // universal
var mapState, map, infoWindow, infoWindowState; //for helper page

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
  xmlhttp.open( "POST", config.helpeePageURL);
  xmlhttp.send(formdata);

  document.getElementById("registrationBody").innerHTML = '<h2> <div>Thank you for '+
  'submitting your request.</div> </h2>' +
  '<div class="narrative"> <p> View or clear your request from the '+
  '<a href="'+ config.helperPageURL+'">helper page</a>. </p> </div>';
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
  if (this.elements[0].value === 0) {
    alert("Please enter your phone number before clicking submit.");
  } else {
    useGeolocationPosition(sendRegistrationData, showError, {enableHighAccuracy : true});
  }
}

function getInfoWindowDefaultContent(phones) {
  let contentString = '<div style="color:black" id="helperNotification">'+
             '<h2>Interested in helping out?</h2>'+
             '<p><b>Phone Number(s):</b><br><ul>';
  for (let i = 0; i < phones.length; i++) {
    let phone = phones[i];
    contentString += '<li>'+ phone + '<button style="margin-left:34px" name="'+phone+'"class="doneButton">Clear Request</button></li>';
  }

  contentString += ' </ul><br>If a request has been '+
              'completed: Click "Clear Request" next to the phone number you called.</p>'+
             '</div>';
  return contentString;
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
  infoWindowState.userPhone = event.target.name;
  let contentString = '<div style="color:black" id="helperNotification">'+
                      '<h2>Thank you for your help!</h2>'+
                      '<p>Cick "Undo" if this was a mistake or click "Continue" '+
                      ' to confirm. </p><button id="undoButton">Undo</button>' +
                      '  <button id="confirmButton">Confirm</button></div>';
  infoWindow.setContent(contentString);
}

function removeRequest() {
  let userphones = mapState.phoneMap.get(activeMarker);
  let userphone = infoWindowState.userphone;
  let activeMarker = mapState.activeMarker;

  //update frontend data
  userphones.splice(userphones.indexOf(userphone), 1);
  if (userphones.length == 0) {
    activeMarker.setMap(null);
  } else {
    infoWindow.setContent(getInfoWindowDefaultContent(mapState.phoneMap.get(activeMarker)));
  }

  //Delete record form database
  let userlng = activeMarker.getPosition().lng();
  let userlat = activeMarker.getPosition().lat();
  let formdata = new FormData();
  formdata.append("longitude", userlng);
  formdata.append("latitude", userlat);
  formdata.append("phone", userphone);
  xmlhttp.open("DELETE", config.helperPageURL, true);
  xmlhttp.send(formdata);
}

function initInfoWindow() {
    let doneButtons = document.getElementsByClassName("doneButton");
    for (let i = 0; i < doneButtons.length; i++) {
      let doneButton = doneButtons[i];
      if (doneButton !== null) {
        doneButton.addEventListener('click', initConfirmationWindow);
      }
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

function addRequestMarkers(requests) {
  for (let i = 0; i < requests.length; i++) {
    let request = requests[i];
    let marker = new google.maps.Marker({
      position : {lat : request.latitude, lng : request.longitude},
      map : map,
      title : 'Somebody could use some help here!'
    });

    marker.addListener('click', function() {
      document.getElementById("map").scrollIntoView({behavior : 'smooth'});
      map.panTo(this.getPosition());
      mapState.activeMarker = this;
      let contentString = getInfoWindowDefaultContent(mapState.phoneMap.get(this));
      infoWindow.setContent(contentString);
      infoWindow.open(map, this);
    });

    marker.setMap(map);
    mapState.phoneMap.set(marker, request.phones);
  }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 13
    });
    mapState = {
      activeMarker : null,
      phoneMap : null
    };

    infoWindow = new google.maps.InfoWindow;
    infoWindowState = {
      userPhone : ""
    }

    mapState.phoneMap = new Map();
    useGeolocationPosition(centerMap, showError, {enableHighAccuracy : true});

    //Add event listeners to the buttons that can be in the infowindow
    infoWindow.addListener('domready', initInfoWindow);

    //Request local request json object form db and update mjap
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        let localRequests = JSON.parse(xmlhttp.responseText).localRequests;
        addRequestMarkers(localRequests);
      }
    };
    xmlhttp.open("GET", config.getRequestsUrl, true);
    xmlhttp.send();

    initInfoWindow();
}

function initHelpeePage(options) {
  config=options;
  xmlhttp = getHttpConnection();
  document.getElementById( "registrationForm" ).addEventListener( "submit", registrationOnClick);
}

function initHelperPage(options) {
  config=options;
  xmlhttp = getHttpConnection();
}
