FROM node:20-slim

WORKDIR /app

# Build the React frontend
COPY client/package*.json client/
RUN cd client && npm install
COPY client client
RUN cd client && npm run build

# Install the backend
COPY server/package*.json server/
RUN cd server && npm install --omit=dev
COPY server server

# Folder for uploaded audio
RUN mkdir -p /app/server/uploads && chmod -R 777 /app/server/uploads

ENV PORT=7860
WORKDIR /app/server
CMD ["node", "server.js"]