# LOD活用サービスの追加方法

## 公開構成

| サービス | 公開URL | 配置先 |
|---|---|---|
| 地域別観測データ検索 | /lod/stations/ | htdocs/lod/stations/ |
| オントロジー・クエリビルダー | /lod/query-builder/ | 将来の配置予約 |

新しいサービスは htdocs/lod/<service-id>/ に独立して配置します。サービス一覧と状態は lod-apps/manifest.json で管理します。

## クエリビルダーの統合

クエリビルダーは https://github.com/hirokiu/QuokkaGraph で独立して開発されています。さまざまなSPARQLエンドポイントで利用する汎用サービスのため、現段階ではこのリポジトリへ統合しません。

QuokkaGraph完成後、地震LOD向けに配置する際に次を決定します。

- 地震LODエンドポイントとオントロジーの初期設定
- /lod/query-builder/ サブパスへの対応方法
- 静的配信またはNodeサービスとしての配信方法
- 中継API、タイムアウト、レート制限
- 日本語・英語の初期表示

ビルド成果物を配置した後に確認する項目は次のとおりです。

1. /lod/query-builder/ を直接開ける
2. ブラウザーの再読み込みでも404にならない
3. オントロジーTTLを /ontology/jp-earthquake.ttl から取得できる
4. クエリ送信先を /sparql に設定できる
5. 日本語と英語を切り替えられる
6. モバイル幅でノードグラフと操作パネルを利用できる
7. APIキーや認証情報が生成物に含まれていない

公開方式を決定するまでは、既存のPHPページと /sparql のVirtuoso proxy設定を変更しません。
