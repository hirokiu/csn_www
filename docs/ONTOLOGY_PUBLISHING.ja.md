# オントロジー公開手順

地震オントロジーの原本は `earthquake-ontology/ontology/jp-earthquake.ttl` です。`csn_www` では原本を変更せず、公開用TTLとWIDOCO生成文書を作成します。

## 前提

- `csn_www` と `earthquake-ontology` を同じ親ディレクトリにcloneする
- Dockerを利用できるようにする
- WIDOCOイメージ `ghcr.io/dgarijo/widoco:v1.4.25` を使用する
- 公式イメージはARM64を提供していないため、既定では `linux/amd64` として実行する
- WIDOCOには日本語UIリソースがないため、UI文言は英語へフォールバックする。TTL内の日本語ラベルは掲載される

## 生成

```bash
./scripts/build-ontology-docs.sh
```

別の場所にある原本を使う場合は次のように指定します。

```bash
EARTHQUAKE_ONTOLOGY_REPOSITORY=/path/to/earthquake-ontology \
  ./scripts/build-ontology-docs.sh
```

実行プラットフォームを変更する場合は `WIDOCO_PLATFORM` を指定します。

生成後は、次を確認します。

```bash
cmp ../earthquake-ontology/ontology/jp-earthquake.ttl \
  htdocs/ontology/jp-earthquake.ttl

python3 -m http.server --directory htdocs 8080
```

ブラウザーで `http://localhost:8080/ontology/docs/` を開きます。PHPページの確認にはPHPまたはnginx/PHP-FPMのローカル環境を使用してください。

## 公開URL

- オントロジー案内: `https://seismic.balog.jp/ontology/`
- WIDOCO仕様書: `https://seismic.balog.jp/ontology/docs/`
- Turtle: `https://seismic.balog.jp/ontology/jp-earthquake.ttl`
- SPARQL: `https://seismic.balog.jp/sparql`

WIDOCOのApache向け `-htaccess` は使用しません。URL制御とVirtuosoへのプロキシは本番nginx設定で管理します。
