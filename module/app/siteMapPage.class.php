<?php
    require(dirname(__FILE__) . '/../common/dbBase.class.php');
    require(dirname(__FILE__) . '/../common/viewBase.class.php');

    class siteMapPage extends viewBase {
        public function __construct() {
            $lang = isset($_GET['lang']) && $_GET['lang'] === 'en' ? 'en' : 'ja';
            $this->values['common']['lang'] = $lang;
            $this->values['common']['page_title'] = $lang === 'ja' ? 'サイトマップ' : 'Sitemap';
        }
    }
