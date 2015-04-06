var map;
var node_line = [];
var flightPath = null;
var gMarker;
var markerArray = new google.maps.MVCArray();

var offset = 0;;
var count = 5;
var max_length = 300;
var diff_nums = 0; // グラフの未表示部分
var node_graph = []; // グラフデータの配列

// geotab のデータを取得　
function getData(offsetNum){

    offset = offsetNum;

/*
    var url = location.href;
    idx = url.indexOf("?");
    if(idx != -1) {
        count = parseInt( getParam() );
    }
*/

    $.ajax({
        url: "res_mems.php",
        type: "GET",
        cache: false,
        dataType: "json",
        data: {
            cnt: count,
            offset: offset
        },
        success: function(res){
            //console.log(res);
            // 追加する分のデータを配列の頭から削除
            node_graph.splice(0,count);

            for(i=0;i<count;i++){
                var node_data = [];
                    node_data.push(res[i].id); // offset値
                    node_data.push(res[i].x_acc); // x_acc
                    node_data.push(res[i].y_acc); // y_acc
                    node_data.push(res[i].z_acc); // z_acc
                node_graph.push(node_data);
            }

// デバッグ
//console.log(node_graph);

            // 描画処理実行
            reDraw(node_graph);
            offset += count;
        },
        error: function(xhr, textStatus, errorThrown){
            //alert('Error');
        }
    });



}

// 初期データ
$(function(){
    // グラフ用データの初期化
    for(var i=0;i<max_length;i++){
        var node_data = [];
            node_data.push( i - max_length ); // offset値
            node_data.push(0); // x_acc
            node_data.push(0); // y_acc
            node_data.push(0); // z_acc
        node_graph.push(node_data);
    }
    draw(node_graph);

    if(offset == null){
        offset = '0';
    }
    getData(offset);
    check = setInterval("getData(offset)",1000); // 10 * 1000msec
});


/*
 * 地図表示処理
 *  35.43132longitude: 139.662
function initialize() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(35.43132, 139.662)
    //mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

}

google.maps.event.addDomListener(window, 'load', initialize);
*/

/*
 * 未使用関数
function setMarker(posData){
    deleteMarker();
    markerArray = new google.maps.MVCArray();

    for(car_id in posData){
        var isDriving = "走行中";
        var imgUrl = "http://maps.google.com/mapfiles/ms/micons/cabs.png";
        if(!posData[car_id].isDriving){
            imgUrl = "http://maps.google.co.jp/mapfiles/ms/icons/parkinglot.png";
            isDriving = "停車中";
        }

        var contentString = "<dl id='infowin1'><dt>" + posData[car_id].name + "</dt><dd>" + isDriving  + "</dt><dd>現在の速度：" + posData[car_id].speed + "</dt><dd>総走行距離：" + posData[car_id].odometer + "</dt><dd>現在地：" + posData[car_id].address + "</dd></dl>";
        var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

        var latlng = new google.maps.LatLng(posData[car_id].latit, posData[car_id].longit);
        gMarker = new google.maps.Marker({
            position: latlng,
            icon: imgUrl
        });
        google.maps.event.addListener(gMarker, 'click', function() {
                infowindow.open(map,gMarker);
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

function setHtml(posData){
    var tagName;
    for(car_id in posData){
        if(car_id == "b5"){
            tagName = "#result01";
        }else if(car_id == "b6"){
            tagName = "#result02";
        }else {
            tagName = "#result03";
        }
        var isDriving = "走行中";
        if(!posData[car_id].isDriving){
            isDriving = "停車中";
        }
        var contentString = "<dl id='info'><dt>デバイスID：" + posData[car_id].id + "（" + isDriving
                             +  "）</dt><dd>最終更新時刻：" + posData[car_id].lastUpdated
                             + "</dt><dd>総走行距離(odometer)：" + posData[car_id].odometer
                             + "</dt><dd>現在の速度：" + posData[car_id].speed
                             + "</dt><dd>現在地：" + posData[car_id].address
                             + "</dd></dl>";
        $(tagName).html(contentString);
    }
}
function drawLine(lineData){
  flightPath = null;
  // 引数で渡されたデータを描画
  flightPath = new google.maps.Polyline({
    path: lineData,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);
}

function deleteLine(){
  // 初期化
  flightPath.setMap(null);
  initialize();
}
*/
