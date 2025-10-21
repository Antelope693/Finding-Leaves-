# 使用 Nginx 作為 Web 服務器
FROM nginx:alpine

# 複製遊戲文件到 Nginx 目錄
COPY . /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
