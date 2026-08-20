# CSN収集・波形ピック基盤の構成検討

更新日: 2026-08-20

## 結論

現行公開サイトをそのまま確認・保守する間はPHPを残す。ただし、今後のRaspberry Pi地震計からの収集、波形処理、P/S波ピックはPython APIとして分離し、新機能をPHPへ追加しない。CAPTCHA型の参加プロジェクトは本リポジトリへ統合せず、別プロジェクトとして設計・開発する。

公開ページの多くは静的HTMLへ移行できる。PHPが必要なのは現在、共通テンプレートの展開と旧リアルタイムAPI（`res_mems.php`）である。LOD検索は別サーバーのSPARQLエンドポイント、地図や波形表示はブラウザーJavaScriptが担当しているため、PHP固有の要件ではない。

## 現状評価

| 機能 | 現在の実装 | PHPの必要性 | 方針 |
|---|---|---:|---|
| LOD・オントロジー・サイトマップ | PHPテンプレート＋静的成果物 | 低い | 静的サイト化可能 |
| 観測点地図 | PHPテンプレート＋JavaScript | 低い | 静的フロント＋APIへ移行可能 |
| 過去波形表示 | JSON/CSV＋JavaScript | 低い | オブジェクトストレージ配信へ移行 |
| 旧リアルタイム表示 | `res_mems.php`＋MariaDB | 現状のみ必要 | 読み取り専用互換として隔離後、廃止 |
| 震度計算 | PHPから固定パスのPythonを実行 | 不適切 | 非同期Pythonワーカーへ移行 |
| 新規観測収集 | 未整備 | 不要 | Pythonの収集API／メッセージ処理として新設 |
| 人手P/S波ピック | 試作JavaScriptのみ | 不要 | TypeScriptフロント＋Python APIとして新設 |

旧DB処理には文字列連結SQL、固定パス、250ミリ秒間隔のポーリングが残る。インターネット向けの書き込みAPIとして再利用せず、移行期間中も読み取り専用に限定する。

## 推奨する境界

```text
Raspberry Pi sensors
  └─ HTTPS batch upload or MQTT
       └─ ingestion API
            ├─ object storage: MiniSEED / compressed raw waveform
            ├─ PostgreSQL: station, time range, checksum, processing state
            └─ job queue
                 ├─ quality control / calibration
                 ├─ trigger and automatic phase picking
                 └─ RDF snapshot generation

Web portal
  ├─ static research/LOD pages
  ├─ waveform picker UI
  └─ API: tasks, annotations, consensus, export
```

### 保存原則

1. 生波形は変更せず、MiniSEEDなどの標準形式でオブジェクトストレージへ保存する。
2. DBにはファイルURI、SHA-256、観測点、開始・終了時刻、サンプリング周波数、処理版を保存する。
3. 補正波形、自動ピック、人手ピック、震源推定、RDFは派生成果物として版を持たせる。
4. センサーからの再送を許容し、`station + start_time + checksum`などで冪等に取り込む。
5. LOD公開は、検証済みスナップショットの全件入れ替えとバックアップを継続する。

## 波形ピックサイト

### 実現性

実現可能。既存`/pick/`にはPlotlyで波形をクリックする試作があるが、P/Sの選択保存、利用者、品質評価、競合制御が未実装である。試作を延命するより、独立したアプリケーションとして置き換える。

最小機能は次の通り。

- 3成分波形の同期ズーム、フィルター、振幅正規化
- P波、S波、ノイズ、不明の選択
- ピック時刻、不確かさ区間、極性、品質、コメント
- 自動ピック候補の表示／非表示
- 同じ波形を複数人へ割り当てるブラインド評価
- 操作履歴を上書きせず追記する監査ログ
- MiniSEED/QuakeML/CSV/RDFへのエクスポート

初期候補はObsPyのSTA/LTA等で作成でき、後段ではSeisBenchの統一APIからPhaseNetやEQTransformer等を比較できる。SeisBenchはObsPy Streamを入力として確率系列や離散ピックを返すため、人手確認の候補生成に適している（[SeisBench models](https://seisbench.readthedocs.io/en/latest/pages/models/overview.html)、[waveform model API](https://seisbench.readthedocs.io/en/stable/pages/models/waveform_models.html)）。モデル結果を正解扱いせず、モデル名・重み・閾値・前処理を必ず来歴として保存する。

### 別プロジェクトとするCAPTCHA型マイクロタスク

CAPTCHA型機能はCSN公開サイトや波形ピックAPIへ直接実装しない。別プロジェクト側でも「人間であることの確認」と「研究用アノテーション」は分離する。

- ボット対策: Cloudflare Turnstile等を投稿APIの手前で使用する。
- アノテーション: 同意と目的説明の後、短い波形判定タスクとして提供する。
- 地震ピックそのものを認証CAPTCHAの正誤判定には使わない。専門判断に曖昧さがあり、安全な本人確認にならない。

Turnstileを採用する場合、クライアントウィジェットだけでは不十分で、サーバー側Siteverifyが必須である。トークンは5分で失効し1回限りなので、検証後にアノテーションを保存する（[公式の検証仕様](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)）。ローカル／自動テストでは公式テストキーを使い、本番キーにlocalhostを許可しない（[公式テスト手順](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)）。

### 品質管理

- 1タスクあたり最低3名、低一致なら追加割り当て
- 専門家が確定したgold taskを混ぜ、重み付き一致度を計算
- 同一利用者へ同じ波形を繰り返し提示しない
- 到達時刻は点だけでなく不確かさ区間も保存
- 生データ、フィルター条件、画面に表示した範囲、UI版を回答と結び付ける
- 研究利用時は参加同意、撤回方法、プライバシーポリシー、ライセンスを明示

## 推奨技術構成

| 層 | 推奨 | 理由 |
|---|---|---|
| 公開サイト | 静的HTML/CSSまたは静的サイト生成 | 攻撃面と運用負荷が小さい |
| 波形UI | TypeScript＋Plotly.jsまたはWebGL対応描画 | 現試作を段階的に置換可能 |
| API | Python 3＋FastAPI等 | ObsPy・SeisBenchと同一言語で接続 |
| メタデータ | PostgreSQL＋PostGIS | 観測点、期間、空間検索、監査ログ |
| 生波形 | S3互換オブジェクトストレージ | 大容量ファイルと版管理をDBから分離 |
| 非同期処理 | Redis/RabbitMQ等＋Python worker | QC、ピック、RDF生成をHTTP処理から分離 |
| RDF検索 | QLever | 公開スナップショットを一括ロード |
| 外部CAPTCHA連携 | 別プロジェクト | 必要になった段階でAPI境界のみ定義 |

## 段階的な展開

### Phase 0: 現行互換（今回）

- Apache/PHP 8.3とMariaDBをComposeで再現
- DB、Google Mapsキー、公開パスを環境変数化
- 現行画面の回帰確認に限定
- Python 2、固定DB接続、旧テーブル列順へ依存する震度計算は再現せず`null`とする

### Phase 1: 収集MVP

- 1台のRaspberry Piから署名付きHTTPSで10〜60秒単位の波形を送信
- APIは受信後すぐオブジェクトストレージへ保存し、チェックサムとメタデータだけDBへ登録
- 再送、時計ずれ、欠測、重複、切断復帰を試験
- センサー資格情報は台ごとに分離し、失効可能にする

### Phase 2: ピックMVP

- 既存`/pick/`とは別に`/apps/waveform-picker/`で開発
- 管理者／招待研究者によるP/Sピックから開始
- 自動候補、複数回答、合意形成、QuakeML出力を追加
- 元波形とアノテーションAPIを別コンテナにする

### Phase 3: 別プロジェクトとの連携検討

- CAPTCHA型プロジェクトの完成後に、CSN側から提供する波形タスクAPIの要否を判断
- 統合する場合も別リポジトリ、別デプロイ、別DBを維持
- CSNへ戻すのは同意・品質確認済みのアノテーション成果物のみとする

### Phase 4: 本番移行

- nginxは静的サイト、API、SPARQL、QLeverをパス別にプロキシ
- CIでコンテナイメージを固定タグ／digestでビルドし、ステージング後に本番反映
- DBマイグレーション、オブジェクトストレージ、監査ログを別々にバックアップ
- PHP互換コンテナは旧URLの参照がなくなった後に停止

## 実装前に決める事項

1. センサーの波形形式、サンプリング周波数、送信単位、時刻同期方法
2. 生波形の保存期間と公開範囲
3. ピック対象がP/S到達時刻か、イベント有無判定か、震源位置推定まで含むか
4. 匿名参加、アカウント制、授業単位のどれを採るか
5. 人手回答と自動推定をLODでどのクラス／来歴として公開するか
