FROM node:24-alpine

WORKDIR /app
COPY . .

RUN npm test && mkdir -p /app/data && chown -R node:node /app/data

ENV HOST=0.0.0.0 \
    PORT=5173 \
    REPORTBOOK_DB_PATH=/app/data/reportbook.sqlite

EXPOSE 5173
USER node
CMD ["node", "server/server.mjs"]
