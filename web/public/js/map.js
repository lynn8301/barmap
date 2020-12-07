// Initial Postion
const taipei = {lat: 25.041864592010498, lng: 121.54379152659244}

/**
 * Initialize and add the map
 */
async function initMap() {
  // The map, centered at Taipei
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: taipei,
  })

  let response = await fetch('https://bamap.herokuapp.com/bar/api/v1/bar')
  let data = await response.json()
  let barInfos = data.payload

  let markers = []
  let currentInfoWindow
  for (let i = 0; i < barInfos.length; i++) {
    let barInfo = barInfos[i]

    let latLng = new google.maps.LatLng(barInfo['lat'], barInfo['lng'])
    let marker = new google.maps.Marker({
      position: latLng,
      icon:
        'https://res.cloudinary.com/hdt0wmjkv/image/upload/v1606270194/cocktail_uf1wso.png',
      map: map,
    })
    let contentString =
      '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<h3 id="firstHeading" class="firstHeading">' +
      `${barInfo['name']}` +
      '</h3>' +
      '<div id="bodyContent">' +
      '<p><b>地址: </b>' +
      `${barInfo['address']}` +
      '</p>' +
      '<p><b>電話: </b>' +
      `${barInfo['phone']}` +
      '</p>' +
      '</div>' +
      '</div>'
    let infoWindow = new google.maps.InfoWindow({
      content: contentString,
    })

    marker.addListener('click', () => {
      // If there is an open window, close it
      if (currentInfoWindow) {
        currentInfoWindow.close()
      }
      infoWindow.open(map, marker)
      currentInfoWindow = infoWindow
    })
    markers.push(marker)
  }
  // Bar Clusters
  let markerCluster = new MarkerClusterer(map, markers, {
    imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  })
}
