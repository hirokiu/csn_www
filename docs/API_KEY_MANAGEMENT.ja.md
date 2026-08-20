# Google Maps APIキーの管理

## 漏洩したキーへの対応

GitHubなどへ公開したキーは、コードから削除するだけでは安全になりません。Google Cloud Consoleで利用状況を確認し、漏洩したキーをローテーションした後、旧キーを削除してください。

新しいキーには次の制限を設定します。

- アプリケーションの制限: ウェブサイト
- 許可するリファラー: `https://seismic.balog.jp/*`
- APIの制限: Maps JavaScript APIのみ
- 用途ごとに別のキーを使用する

ブラウザーで利用するGoogle Mapsキーは、配信後のHTMLや通信から閲覧できます。環境変数化はGitへの混入を防ぐためのものであり、キー自体をブラウザー利用者から秘匿するものではありません。Google Cloud側の制限が必須です。

## サーバー設定

本番PHP-FPMから次の環境変数を参照できるようにします。

```text
GOOGLE_MAPS_BROWSER_API_KEY=新しく発行した制限付きキー
```

PHP-FPMのpool設定で管理する場合の例です。この設定ファイルはGit管理しません。

```ini
env[GOOGLE_MAPS_BROWSER_API_KEY] = 新しく発行した制限付きキー
```

設定後にPHP-FPMを再起動し、地図ページを確認します。キーが未設定の場合、サイト共通テンプレートはGoogle Maps JavaScriptを読み込みません。

## コミット前検査

```bash
./scripts/check-secrets.sh
```

リポジトリ付属のpre-commit hookを有効にする場合は、一度だけ次を実行します。

```bash
git config core.hooksPath .githooks
```

GitHub Actionsでもpushおよびpull requestごとに同じ検査を実行します。

## Git履歴

過去のコミットには漏洩した値が残ります。キーを無効化・削除すれば認証情報としては利用できなくなります。履歴書き換えは全cloneと全ブランチへ影響するため、必要性と影響範囲を確認して別作業として実施します。
