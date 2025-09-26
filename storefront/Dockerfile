FROM node:20-alpine

# 作業ディレクトリを設定する
WORKDIR /app

# package.jsonとpackage-lock.jsonを /app にコピー
COPY package*.json ./

# 依存関係を /app/node_modules にインストール
RUN npm install

# ソースコード全体をコピー（開発時はvolumesで上書きされるが、念のため）
COPY . .

# コンテナがポート8000でリッスンすることを宣言
EXPOSE 8000

# Next.js開発サーバーを起動
CMD ["npm", "run", "dev"]