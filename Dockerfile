FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json server.mjs ./
COPY lib ./lib
COPY public ./public
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
