var json_file = 'dl_devices.php';
var gMarker;
var markerArray = new google.maps.MVCArray();

$( function() {
    $.ajax({
        url: json_file,
        cache: false,
        dataType: "json",
        success: function( json )
        {
            var data = json_read( json );
//console.log(data);
            setMarker( data );
        }
    });
});
 
function json_read( json )
{
    var data = [];
    if( json.Marker ){
        for(var i = 0; i < json.Marker.length; i++){
            data.push( json.Marker[i] );
        }
    }
    return data;
}

function setMarker(posData){
    deleteMarker();
    markerArray = new google.maps.MVCArray();

    for(content_id in posData){
        var contentString = "<dl id='infowin1'><dt>" + posData[content_id].name + "</dt><dd><a href=\"" + posData[content_id].url + "\" >モニタリング：" + posData[content_id].content + "</a></dd></dl>";
        var latlng = new google.maps.LatLng(posData[content_id].lat, posData[content_id].lon);
        var gMarker = new google.maps.Marker({
            position: latlng,
            html: contentString
        });
        google.maps.event.addListener(gMarker, 'click', function() {
            infowindow.setContent(this.html);
            infowindow.open(map,this);
        });
        markerArray.push(gMarker);
    }

    markerArray.forEach(function(marker, idx) {
        marker.setMap(map);
    });
}

function deleteMarker(){
    markerArray.forEach(function(marker, idx) {
        marker.setMap(null);
    });
}
