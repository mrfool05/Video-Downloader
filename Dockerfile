# Use Node.js 18 on Alpine Linux (lightweight)
FROM node:18-alpine

# Install Python, ffmpeg, and other dependencies required by yt-dlp
RUN apk add --no-cache python3 py3-pip ffmpeg

# Install yt-dlp via pip (ensure it's available in PATH)
RUN pip3 install -U yt-dlp --break-system-packages

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD [ "npm", "start" ]
