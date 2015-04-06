<?php
    require(dirname(__FILE__) . '/config.php');

    class dbBase{
        // 共通変数
        private $dbh;
        public $allEvent;
        public $eachEvent;

        // 初期化
        public function __construct(){
            global $config;

            // DBインスタンス生成　
            try {
                $this->dbh = new PDO("mysql:host={$config['dbhost']};dbname={$config['dbname']}", $config['dbuser'], $config['dbpassword']);
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database connect error'));
                exit;
            }
        }

        // 全件取得
        public function getAll(){

            try {
                $stmt = $this->dbh->prepare("SELECT * FROM Event");
                $stmt->execute();
                $this->allEvent = array();
                while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
                    array_push($this->allEvent,$result);
                }
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }

        }

        // 一行取得
        public function getEvent(){

            $id = $this->validateGet();

            try {
                $stmt = $this->dbh->prepare("SELECT * FROM Event WHERE id=?");
                $stmt->execute(array($id));
                $this->eachEvent = array();
                $this->eachEvent = $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }

        }

        // 指定した件数を取得
        public function getLimit(){
            $options = $this->validateGetOptions();
            try {
                //$query = "SELECT * FROM Event WHERE device_id = ".$options['device']." ORDER BY id LIMIT ".$options['offset'].",".$options['cnt'];
                $query = "SELECT * FROM Event WHERE device_id = ".$options['device']." AND t0active >= ".$options['dtime']." ORDER BY id LIMIT ".$options['offset'].",".$options['cnt'];
                $stmt = $this->dbh->prepare($query);
                $stmt->execute();
                $this->allEvent = array();
                while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
                    array_push($this->allEvent,$result);
                }
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }
        }

        // 最新のデータを取得
        public function getNewest(){
            $options = $this->validateGetOptions();
            try {
                $query = "SELECT * FROM Event WHERE device_id = ".$options['device']." AND t0active <= ".$options['dtime']." ORDER BY id DESC LIMIT ".$options['cnt'];
                //$query = "SELECT * FROM Event WHERE device_id = ".$options['device']." AND t0active <= ".$options['dtime']." AND t0active >= ".$options['dtime_late']."  ORDER BY id LIMIT 10";
                $stmt = $this->dbh->prepare($query);
                $stmt->execute();
                $this->allEvent = array();
                while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
                    array_push($this->allEvent,$result);
                }
                $this->allEvent = array_reverse($this->allEvent);
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }
        }

        // 指定されたIDより最新のデータを取得
        public function getNewerThan(){
            $options = $this->validateGetOptions();
            //var_dump($options);
            if($options['maxid'] == 0){
                $options['maxid'] = $this->getmaxId();
            }
            //var_dump($options);
            try {
                $query = "SELECT * FROM Event WHERE device_id = ".$options['device']." AND t0active >= ".$options['dtime']." AND id > " .$options['maxid']." ORDER BY id";
                //$query = "SELECT * FROM Event WHERE device_id = ".$options['device']." AND t0active >= ".$options['dtime_late']." AND id > " .$options['maxid']." ORDER BY id";
                $stmt = $this->dbh->prepare($query);
                $stmt->execute();
                $this->allEvent = array();
                while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
                    array_push($this->allEvent,$result);
                }
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }
        }

        // 指定された時刻のデータを取得
        public function getAmongTime(){
            $options = $this->validateGetOptions();
            //var_dump($options);
            if($options['maxid'] == 0){
                $options['maxid'] = $this->getmaxId();
            }
            try {
                $query = "SELECT * FROM Event WHERE device_id = ".$options['device']." AND t0active >= ".$options['dtime']." AND t0active < " .$options['maxid']." ORDER BY id";
                $stmt = $this->dbh->prepare($query);
                $stmt->execute();
                $this->allEvent = array();
                while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
                    array_push($this->allEvent,$result);
                }
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }
        }

        // 登録処理
        public function insertEvent(){

            $event = $this->validatePost();
            foreach($event AS $key => $value){
                $_field .= $key.',';
                $_values .= '\''.$value.'\',';
            }
            $field = $_field.'createdat';
            $values = $_values.'NOW()';

            try{
                $query = 'INSERT IGNORE INTO event ('.$field.') VALUES ('.$values.')';
                $stmt = $this->dbh->prepare($query);
                $stmt->execute();
// var_dump($stmt);
                // echo json_encode(array('status' => 'OK'));
                echo 'イベントを追加しました。<br />';
                echo '<a href=\'\'>管理画面TOPに戻る</a><br />';
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }

        }

        // 更新処理
        public function updateEvent(){

            $event = $this->validatePost();
            foreach($event AS $key => $value){
                if($key != 'id'){
                    $_query .= $key.'=\''.$value.'\',';
                }
            }
            $_query = rtrim($_query,',');

            try{
                $query = 'UPDATE event SET '.$_query.' WHERE id='.$event['id'];
                $stmt = $this->dbh->prepare($query);
                $stmt->execute();
// var_dump($stmt);
                echo json_encode(array('status' => 'OK'));
                echo 'イベントの編集が完了しました。<br />';
                echo '<a href=\'\'>管理画面TOPに戻る</a><br />';
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }

        }

        // 変数チェック
        private function validatePost(){

            if( ($_GET['mode'] == 'write') || ($_GET['mode'] == 'update') ) {
                if( is_string($_POST['id']) && ($_POST['id'] != '') ){ $_event['id'] = $_POST['id']; }
                if( is_string($_POST['title']) && ($_POST['title'] != '') ){ $_event['title'] = $_POST['title']; }
                if( is_string($_POST['description']) && ($_POST['description'] != '') ){ $_event['description'] = $_POST['description']; }
                if( is_string($_POST['uri']) && ($_POST['uri'] != '') ){ $_event['uri'] = $_POST['uri']; }
                if( is_string($_POST['day']) && ($_POST['day'] != '') ){ $_event['day'] = $_POST['day']; }
                if( is_string($_POST['day_str']) && ($_POST['day_str'] != '') ){ $_event['day_str'] = $_POST['day_str']; }
                if( is_string($_POST['location']) && ($_POST['location'] != '')  ){ $_event['location'] = $_POST['location']; }
                if( is_string($_POST['author']) && ($_POST['author'] != '') ){ $_event['author'] = $_POST['author']; }
                if( is_string($_POST['price']) ){ $_event['price'] = $_POST['price']; }
                if( is_string($_POST['del']) ){ $_event['del'] = $_POST['del']; }
            }

            return $_event;

        }

        // 変数チェック
        private function validateGet(){

            if( preg_match('/[0-9]*/', $_GET['id']) ){$_id = $_GET['id']; }

            return $_id;

        }

        // 変数チェック
        private function validateGetOptions(){

            $_options['cnt'] = '10';
            $_options['offset'] = '0';
            $_options['device'] = '1';
            $_options['maxid'] = '1';
            //$_options['dtime'] = microtime() - 1000;
            $_options['dtime'] = time();
            $_options['dtime_late'] = time() - 60;

            //if( preg_match('/[0-9]*/', $_GET['device']) ){$_options['device'] = $_GET['device']; }
            if( (isset($_GET['offset'])) && (preg_match('/[0-9]*/', $_GET['offset'])) ){$_options['offset'] = $_GET['offset']; }
            if( (isset($_GET['cnt'])) && (preg_match('/[0-9]*/', $_GET['cnt'])) ){$_options['cnt'] = $_GET['cnt']; }
            if( (isset($_GET['maxid'])) && (preg_match('/[0-9]*/', $_GET['maxid'])) ){$_options['maxid'] = $_GET['maxid']; }
            if( (isset($_GET['device'])) && (preg_match('/[0-9]*/', $_GET['device'])) ){$_options['device'] = $_GET['device']; }

            return $_options;

        }

        // 最後のIDを取得
        private function getMaxId(){
            $_maxId = 0;
            $options = $this->validateGetOptions();
            try {
                $query = "SELECT max(id) FROM Event WHERE device_id = ".$options['device']." AND t0active <= ".$options['dtime']." ORDER BY id";
                $stmt = $this->dbh->prepare($query);
                $stmt->execute();
                while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
                    $_maxId = $result["max(id)"];
                }
                return $_maxId;
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }
        }

        //最新のデバイス一覧を取得
        public function getAllDeviceList(){
            $_deviceList = array();
            $_tmpResult  = array();

            try {
                $query = "SELECT id, user_id, location, X(map_point), Y(map_point), ASTEXT(map_point), delete_flag FROM Device WHERE delete_flag = 0";
                $stmt  = $this->dbh->prepare($query);
                $stmt->execute();
                while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
                    array_push($_deviceList, $result);
                }
                return $_deviceList;
            } catch (Exception $e) {
                echo json_encode(array('status' => 'NG', 'error' => 'database error'));
                exit;
            }
        }


// End Of Class
    }
?>
