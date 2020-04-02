var xmlhttp, config;
// var map, infoWindow, xmlhttp, activeMarker, helpeePhoneMap;


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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(sendRegistrationData, showError, {enableHighAccuracy : true});
    } else {
      alert('Your browser does not support Geolocation services: Unfortunately Grocery Heroes requires this.');
    }
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
  console.log(contentString);
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
function initConfirmationWindow() {
  userphone = doneButton.name;
  let contentString = '<div style="color:black" id="helperNotification">'+
                      '<h2>Thank you for your help!</h2>'+
                      '<p>Cick "Undo" if this was a mistake or click "Continue" '+
                      ' to confirm. </p><button id="undoButton">Undo</button>' +
                      '  <button id="confirmButton">Confirm</button></div>';
  infoWindow.setContent(contentString);
}

function initInfoWindow() {
    let doneButtons = document.getElementsByClassName("doneButton");
    for (let i = 0; i < doneButtons.length; i++) {
      let doneButton = doneButtons[i];
      if (doneButton !== null) {
        doneButton.addEventListener('click', function() {


        });
      }
    }

    let confirmButton = document.getElementById("confirmButton");
    let undoButton = document.getElementById("undoButton");
    if (confirmButton !== null && undoButton !== null) {

      //logic from request removal confirmation
      confirmButton.addEventListener("click", function() {
        //Update front-end data
        console.log(userphone);
        console.log(helpeePhoneMap);


        let userphones = helpeePhoneMap.get(activeMarker);
        userphones.splice(userphones.indexOf(userphone), 1);

        if (userphones.length == 0) {
          activeMarker.setMap(null);
        } else {
          infoWindow.setContent(getInfoWindowDefaultContent(helpeePhoneMap.get(activeMarker)));
        }

        //Delete record form database
        let userlng = activeMarker.getPosition().lng();
        let userlat = activeMarker.getPosition().lat();
        let formdata = new FormData();
        formdata.append("longitude", userlng);
        formdata.append("latitude", userlat);
        formdata.append("phone", userphone);
        xmlhttp.open("DELETE", "{{ url_for('main.helper')}}", true);
        xmlhttp.send(formdata);
      });

      //logic to undo request removal
      undoButton.addEventListener("click", function() {
        infoWindow.setContent(getInfoWindowDefaultContent(helpeePhoneMap.get(activeMarker)));
      });
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 13
    });
    infoWindow = new google.maps.InfoWindow;
    helpeePhoneMap = new Map();

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(centerMap);
    }

    //Add event listeners to the buttons that can be in the infowindow
    var userphone;
    infoWindow.addListener('domready', function() {
    });

    // Place pins on map.
    var marker;
    var phones;
    {% for helpee in local_helpees %}
    marker = new google.maps.Marker({
      position: {lat: {{ helpee.latitude }}, lng:{{ helpee. longitude }}},
      map: map,
      title: 'Somebody could use some help here!'
    });

    phones = [];
    {% for phone in helpee.phones %}
    phones.push('{{ phone }}');
    {% endfor %}

    marker.addListener('click', function() {
      document.getElementById("map").scrollIntoView({behavior:'smooth'});
      map.panTo(this.getPosition());
      activeMarker = this;
      let contentString = getInfoWindowDefaultContent(helpeePhoneMap.get(this));
      infoWindow.setContent(contentString);
      infoWindow.open(map, this);
    });
    marker.setMap(map);
    helpeePhoneMap.set(marker, phones);
    {% endfor %}
  };
}

function runHelpeePage(options) {
  config=options;
  xmlhttp = getHttpConnection();
  document.getElementById( "registrationForm" ).addEventListener( "submit", registrationOnClick);
}

function runHelperPage(options) {
  config=options;
  xmlhttp = getHttpConnection();


}
