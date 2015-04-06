<?php
	require(dirname(__FILE__) . '/../common/dbBase.class.php');
	require(dirname(__FILE__) . '/../common/config.php');

	class downloadCSV {

		// 共通変数
		private $dbh;

		// 初期化
		public function __construct(){
			global $config;

			// DBインスタンス生成
			try {
				$this->dbh = new PDO("mysql:unix_socket=/data/mysql/mysql.sock;host={$config['dbhost']};dbname={$config['dbname']}", $config['dbuser'], $config['dbpassword']);
			} catch (Exception $e) {
				echo json_encode(array('status' => 'NG', 'error' => 'database connect error'));
				exit;
			}

			//$this->extractCSVdata();
		}

		public function extractDeviceID() {

			$data = array();	//デバイスIDの格納

			try {
				$query = "SELECT id FROM Device";
				$stmt = $this->dbh->prepare($query);
				$stmt->execute();
				while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
					array_push($data, $result['id']);
				}
			} catch (Exception $e) {
				echo json_encode(array('status' => 'NG', 'error' => 'database error'));
				exit;
			}
			
			return $data;
		}

		public function extractCSVdata() {

			$device_id = $_POST['device_id'];

			//debug
			//$device_id = 4;

			$t_start = substr($_POST['start'], 0, 4) . "-" . substr($_POST['start'], 4, 2) . "-" . substr($_POST['start'], 6, 2) . " " . substr($_POST['start'], 8, 2) . ":" . substr($_POST['start'], 10, 2) . ":" . substr($_POST['start'], 12, 2);
			$t_end = substr($_POST['end'], 0, 4) . "-" . substr($_POST['end'], 4, 2) . "-" . substr($_POST['end'], 6, 2) . " " . substr($_POST['end'], 8, 2) . ":" . substr($_POST['end'], 10, 2) . ":" . substr($_POST['end'], 12, 2);

			$start_unixtime = (double)(strtotime($t_start));
			$end_unixtime = (double)(strtotime($t_end));

			//debug
			//echo $t_start . "  " . $t_end . "\n";
			//echo $start_unixtime . "  " . $end_unixtime . "\n";
			//echo date('Y-m-d H:i:s', $start_unixtime) . "  " . date('Y-m-d H:i:s', $end_unixtime);

			try {
				//$query = "SELECT t0active, x_acc, y_acc, z_acc FROM Event WHERE device_id = ". $device_id . " AND t0active >= " . $start_unixtime . " AND t0active <= " . $end_unixtime;
				$query = "SELECT t0active, x_acc, y_acc, z_acc FROM Event WHERE device_id = ". $device_id . " AND t0active >= " . $start_unixtime . " AND t0active <= " . $end_unixtime . " ORDER BY id DESC LIMIT 50000";
				$stmt = $this->dbh->prepare($query);
				$stmt->execute();
				while($result = $stmt->fetch(PDO::FETCH_ASSOC)){
					if(isset($_POST['change_time_format'])) {
						$result['t0active'] = date("Y-m-d h:m:s", (int)($result['t0active']));
					}
					echo implode(",", $result) . "\n";
				}
			} catch (Exception $e) {
				echo json_encode(array('status' => 'NG', 'error' => 'database error'));
				exit;
			}
		}
	}
?>
