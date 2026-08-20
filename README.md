# musicWEB

个人 React + Vite 网易云音乐前端播放器，配合同级目录的 `musicAPI` 使用。

功能：搜索、播放、歌词、二维码登录入口。仅作个人使用，不包含破解或公开分享功能。

## 不使用 Docker

启动后端后，在本目录执行：

```bash
npm run dev
```

前端地址为 `http://localhost:8080`，Vite 会把 `/api` 代理到本机后端 `3000` 端口。

## 启动

先启动后端创建共享网络：

```bash
cd ../musicAPI
docker compose up -d ncm_api
```

再单独启动前端：

```bash
cd ../musicWEB
docker compose up -d --build
```
