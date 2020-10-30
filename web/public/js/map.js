function initMap() {
  let taipei =  {lat: 25.048069, lng:121.517101}
  let map = new google.maps.Map(document.getElementById("map"), {
    center: taipei,
    zoom: 18,
  })

  let contentString = 
    '<div id="content">' +
    '<div id="siteNotice">'+
    '</div>'+
    '<h3 id="firstHeading" class="firstHeading">'+'Test'+'</h3>'+
    '<div id="bodyContent">'+
    '<p><b>Name: </b>'+'TEST' +'</p>'+
    '</div>'+
    '</div>'
  let infowindow = new google.maps.InfoWindow({
      content: contentString,
  })
  let marker = new google.maps.Marker({
      position: taipei,
      map,
      title: 'TEST'
  })
  marker.addListener("click", () => {
    infowindow.open(map, marker);
  })
}
