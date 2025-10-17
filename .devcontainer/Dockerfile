# Use the official Node.js image as base
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        git \
        curl \
        wget \
        unzip \
        vim \
        nano \
        htop \
        tree \
        jq \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install pnpm globally using the official installation script
RUN curl -fsSL https://get.pnpm.io/install.sh | sh - \
    && mv /root/.local/share/pnpm/pnpm /usr/local/bin/pnpm \
    && chmod +x /usr/local/bin/pnpm

# Install global development tools
RUN npm install -g \
    @next/codemod \
    typescript \
    tsx \
    nodemon

# Set up workspace
WORKDIR /workspace

# Copy package files for better caching
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Set default shell to bash
SHELL ["/bin/bash", "-c"]

# Create a non-root user
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Configure git for the container
RUN git config --global --add safe.directory /workspace

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Expose ports
EXPOSE 3000 5555

# Default command
CMD ["sleep", "infinity"]
