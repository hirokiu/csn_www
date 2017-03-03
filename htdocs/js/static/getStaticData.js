var node_line = [];
var flightPath = null;

var maxid = 0;
var offset = 0;
var count = 10;
var max_length = 300;
var diff_nums = 0; // グラフの未表示部分
var node_graph = []; // グラフデータの配列
var endFlag = false;
var device = 1;

var g_acc = 9.8;
var diff_x_acc = 0;
var diff_y_acc = 0;
var diff_z_acc = 0;

// geotab のデータを取得　
function getData(offsetNum){

    maxid = offsetNum;

    var tmp_sum = 0;
    var params;
    var device;
    var static_data;
        static_data = "/data/earthquakes/20150513.json";

    var url = location.href;
    idx = url.indexOf("?");
    if(idx != -1) {
        params = getParam();
        device = params["device"];
        static_data = "/data/earthquakes/" + params["datetime"] + ".json";
    }

    $('span#device_id').html(device);

    $.ajax({
        url: static_data,
        type: "GET",
        cache: false,
        dataType: "json",
        success: function(res){
            console.log(res);
            // 追加する分のデータを配列の頭から削除
            count = res.length - 1;
            node_graph.splice(0,count);

            // 差分を取得
            diff_x_acc = res[count].diff_x;
            diff_y_acc = res[count].diff_y;
            diff_z_acc = res[count].diff_z;

//UNIXをJSTにする
            //UNIXタイムをタイムスタンプに変換
            var date = new Date(res[count - 1].t0active  * 1000 );
            //日時にフォーマット化したものを出力
            $("span#result_time").html(unixdateformat(date));


            //$('span#result_time').html(res[count - 1].t0active);

            if(res.length > 0){
                //for(i=0;i<res.length;i++){
                for(i=0;i<count;i++){
                    var node_data = [];
                        maxid = res[i].id;
                        node_data.push(res[i].id); // offset値
                        node_data.push( parseFloat(res[i].x_acc - diff_x_acc) ); // x_acc
                        node_data.push( parseFloat(res[i].y_acc - diff_y_acc) ); // y_acc
                        node_data.push( parseFloat(res[i].z_acc - diff_z_acc) ); // z_acc

                    node_graph.push(node_data);
                }
                // 描画処理実行
                reDraw(node_graph);
                offset += count;
            } else{ // データがない場合
                endFlag = true;
            }
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

    if(maxid == null){
        maxid = '0';
    }
    getData(maxid);
    //check = setInterval("getData(maxid)",250); // 10 * 1000msec
});

function getParam() {
    var url   = location.href;
    parameters    = url.split("?");
    params   = parameters[1].split("&");
    var paramsArray = [];
    for ( i = 0; i < params.length; i++ ) {
        neet = params[i].split("=");
        paramsArray.push(neet[0]);
        paramsArray[neet[0]] = neet[1];
    }
    var values = [];
    values["device"] = paramsArray["device"];
    if(values["device"] == null){
        values["device"] = 1;
    }
    values["datetime"] = paramsArray["datetime"];
    if(values["datetime"] == null){
        values["datetime"] = "20150513";
    }
    return values;
}

//タイムスタンプを指定の日時にフォーマット化
function unixdateformat(str){
    var objDate = new Date(str);
    var nowDate = new Date();

    //現在時間との差
    myHour = Math.floor((nowDate.getTime()-objDate.getTime()) / (1000*60*60)) + 1;

    var year = objDate.getFullYear();
    var month = objDate.getMonth() + 1;
    var date = objDate.getDate();
    var hours = objDate.getHours();
    var minutes = objDate.getMinutes();
    var seconds = objDate.getSeconds();

    if ( hours < 10 ) { hours = "0" + hours; }
    if ( minutes < 10 ) { minutes = "0" + minutes; }
    if ( seconds < 10 ) { seconds = "0" + seconds; }

    str = year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    var rtnValue = str;

    return rtnValue;

}
