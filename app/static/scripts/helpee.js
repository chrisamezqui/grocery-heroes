var xmlhttp, config;

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

function main(options) {
  config=options;
  xmlhttp = getHttpConnection();
  document.getElementById( "registrationForm" ).addEventListener( "submit", registrationOnClick);
}
