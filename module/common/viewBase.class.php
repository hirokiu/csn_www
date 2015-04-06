<?php
    require(dirname(__FILE__) . '/config.php');
    require(dirname(__FILE__) . '/define.php');

    class viewBase{
        // 共通変数
        public $values;

        // 初期化
        public function __construct(){

            // DBインスタンス生成　
            try {
            } catch (Exception $e) {
                exit;
            }
        }

        public function view($name){
            global $config;

            $template = get_class($name);
            //$val = validate();
            $this->setCommonValues();
            $VALUES = $this->transrateValues();

            include($config['template_dir'].'/'.$template.'.html');

        }

        /*
         * 月単位でのイベントデータを代入
         */
        public function setEvents($allEventData){

            $year1 = date('Y');
            $month1 = date('m');
            $year2 = date('Y', strtotime(date('Y-m-1').' +1 month'));
            $month2 = date('m', strtotime(date('Y-m-1').' +1 month'));
            $next = date('Y-m-d 00:00:00', strtotime(date('Y-m-1').' +1 month'));

            $monthEvent[0]['year'] = $year1;
            $monthEvent[0]['month'] = (int) $month1;
            $monthEvent[1]['year'] = $year2;
            $monthEvent[1]['month'] = (int) $month2;

            foreach($allEventData AS $key => $value){
                if($value['day'] < $next){
                    $monthEvent[0]['events'][$key] = $this->setEventValue($value);
                } else {
                    $monthEvent[1]['events'][$key] = $this->setEventValue($value);
                }
            }
            return $monthEvent;
        }

        /*
         * 個別のイベントデータを表示用の変数に代入
         */
        public function setEventValue($eventData){
            global $common;

            $event['title'] = $eventData['title'];
            $event['description'] = $eventData['description'];
            $event['year'] = (int) substr($eventData['day'],0,4);
            $event['month'] = (int) substr($eventData['day'],5,2);
            $event['day'] = (int) substr($eventData['day'],8,2);
            $event['week'] = $common['week'][date("w", strtotime($eventData['day']))];
            //$event['time'] = substr($eventData['day'],11,5);
            $event['time'] = '';
            $event['genreTag'] = 'g'.sprintf('%02d',$eventData['genre']);
            $event['genreID'] = sprintf('%02d',$eventData['genre']);
            $event['genre'] = $common['tag'][$eventData['genre']];
            $event['uri'] = $eventData['uri'];
            $event['location'] = $eventData['location'];
            $event['author'] = $eventData['author'];
            $event['pref'] = $eventData['pref'];
            if($eventData['price'] != '0'){
                $event['price'] = '有料';
            } else {
                $event['price'] = '無料';
            }
            $event['soraniwa_uri'] = 'http://soraniwa.in/event/'.$eventData['id'];

            // twitter/facebook用の変数
            $event['share_comment'] = $event['title'].' '.$event['year'].'年'.$event['month'].'月'.$event['day'].'日（'.$event['week'].'）';

            return $event;

        }

        private function setCommonValues(){
            global $common;

            $this->values['title'] = SITE_TITLE;
            $this->values['meta_keyword'] = META_KEYWORD;
            $this->values['meta_description'] = META_DESCRIPTION;
            $this->values['css'] = $common['css'];
            $this->values['SocialBox'] = $common['SocialBox'];
            $this->values['TwitterID'] = $common['TwitterID'];
            $this->values['FacebookURL'] = $common['FacebookURL'];

        } 

        private function transrateValues(){

            $ret;

            foreach($this->values AS $key => $value){
                $ret[$key] = $value;
            }

            return $ret;
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


// End Of Class
    }
?>
