<?php
    require(dirname(__FILE__) . '/../common/dbBase.class.php');
    require(dirname(__FILE__) . '/../common/viewBase.class.php');

    class downloadPage extends viewBase{
        // 共通変数
        private $db;

        // 初期化
        public function __construct(){
            global $config;

            $count = 0;
            $tmp_x_sum = 0;
            $tmp_y_sum = 0;
            $tmp_z_sum = 0;

            // db初期化
            $this->db = new dbBase();

            // データ取得
            try {
                // 引数がなければ最新の1件を取得
                if( isset($_GET['cnt']) && isset($_GET['offset']) ){
                    $this->db->getLimit();
                } else if( isset($_GET['maxid']) ){
                    if($_GET['maxid'] == 0){
                        $this->db->getNewest();
                    } else{
                        $this->db->getNewerThan();
                    }
                } else{
                    $this->db->getNewest();
                }

                $data = $this->db->allEvent;

                foreach($data AS $key => $value){
                    $tmp_x_sum += $value['x_acc'];
                    $tmp_y_sum += $value['y_acc'];
                    $tmp_z_sum += $value['z_acc'];
                    $count++;
                }

                array_push($data, array('diff_x' => $tmp_x_sum/$count,
                                                'diff_y' => $tmp_y_sum/$count,
                                                'diff_z' => $tmp_z_sum/$count) );

                echo json_encode($data);

            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }

        }

    }
?>
