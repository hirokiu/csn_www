<?php
///////////////////////////////////////////////////////////////
// DB settings
$host = php_uname('n');
if($host == 'yui'){
    // データベースホスト
    $config['dbhost'] = 'yui';
    // データベース接続パスワード
    $config['dbpassword'] = '';
}
else{
    // データベースホスト
    $config['dbhost'] = 'localhost';
    // データベース接続パスワード
    $config['dbpassword'] = '';
}
// データベース名
$config['dbname'] = 'csn';
// データベース接続ユーザ名
$config['dbuser'] = 'root';


$config['base_dir'] = '/data/www/seismic_www';
$config['htdocs_dir'] = $config['base_dir'].'/htdocs';
$config['module_dir'] = $config['base_dir'].'/module';
$config['template_dir'] = $config['module_dir'].'/tmpl';
$config['tool_dir'] = $config['module_dir'].'/tool';


