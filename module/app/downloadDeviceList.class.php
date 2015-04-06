<?php
    require(dirname(__FILE__) . '/../common/dbBase.class.php');
    require(dirname(__FILE__) . '/../common/viewBase.class.php');

    class downloadDeviceList extends viewBase{
        // 共通変数
        private $db;

        // 初期化
        public function __construct(){
            global $config;

            $deviceList = array("Marker"=>array());
            $data       = array();
            $userId     = 0;
            $name       = "";
            $lat        = "";
            $lon        = "";

            // db初期化
            $this->db = new dbBase();

            // データ取得
            try {
                    //TODO 現在地からXkm以内のセンサを取得するメソッドの作成
                    $data = $this->db->getAllDeviceList();


                   //  var_dump($data);
                    for($i = 0; $i < count($data); $i++){
                        $userId = $data[$i]['user_id'];
                        $name   = $data[$i]['location'];
                        $lon    = $data[$i]['X(map_point)'];
                        $lat    = $data[$i]['Y(map_point)'];
                        
                        array_push($deviceList['Marker'], array('lat'     => $lat,
                                                      'lon'     => $lon,
                                                      'name'    => $name,
                                                      'content' => "device=".$userId,
                                                      'url'     => "../realTime/?device=".$userId) );
                    }
                    
                   //  var_dump($deviceList);

                    echo json_encode($deviceList, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }

        }

    }
?>
