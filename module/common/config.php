<?php
///////////////////////////////////////////////////////////////
// DB settings
$config['dbhost'] = getenv('DB_HOST') ?: 'localhost';
$config['dbport'] = getenv('DB_PORT') ?: '3306';
$config['dbpassword'] = getenv('DB_PASSWORD') ?: '';
$config['dbname'] = getenv('DB_NAME') ?: 'csn';
$config['dbuser'] = getenv('DB_USER') ?: 'root';

$config['base_dir'] = getenv('CSN_BASE_DIR') ?: dirname(__DIR__, 2);
$config['htdocs_dir'] = $config['base_dir'].'/htdocs';
$config['module_dir'] = $config['base_dir'].'/module';
$config['template_dir'] = $config['module_dir'].'/tmpl';
$config['tool_dir'] = $config['module_dir'].'/tool';

