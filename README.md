# Seismic Data Portal / Citizen Seismology Network

Citizen Seismology Networkの観測アーカイブ、地震LOD、地震オントロジーを公開するWebサイトです。

## Dockerで確認する

Docker DesktopまたはDocker EngineとDocker Compose v2が必要です。

```sh
cp .env.example .env
docker compose up --build
```

起動後、<http://localhost:8080/> を開きます。初回はMariaDBイメージの取得と初期化に時間がかかります。

```sh
# 状態確認
docker compose ps

# PHP構文確認
docker compose exec web sh -lc \
  "find module -type f \( -name '*.php' -o -name '*.html' \) -print0 | xargs -0 -n1 php -l"

# 終了（DBデータは保持）
docker compose down

# DBデータも削除して初期化
docker compose down --volumes
```

ソースはコンテナへマウントされるため、PHP・HTML・CSSの変更はブラウザーの再読み込みで確認できます。Google Mapsを確認する場合だけ、`.env`の`GOOGLE_MAPS_BROWSER_API_KEY`へHTTPリファラー制限済みの開発用キーを設定してください。`.env`はGit管理されません。

旧`res_mems.php`のDB読み取りは確認できますが、Raspberry Pi上のPython 2環境へ固定された旧震度計算は再現せず、ローカル環境では`shindo: null`を返します。この処理は今後の収集・解析ワーカーで置き換える対象です。

## 構成

- `htdocs/`: 公開ディレクトリ
- `module/app/`: ページコントローラー
- `module/tmpl/`: PHPテンプレート
- `module/common/`: 共通設定と旧MariaDBアクセス
- `ontology-docs/`: WIDOCO生成設定
- `docker/db/init/`: ローカル確認用DBスキーマ
- `docs/ARCHITECTURE_FUTURE.ja.md`: 収集・波形ピック機能を含む今後の構成案

現行サイトのDocker環境は互換性確認を目的としています。新規のデータ収集・解析APIをPHPへ追加する方針ではありません。
