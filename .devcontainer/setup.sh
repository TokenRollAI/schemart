#!/bin/bash

# Fast MVP Development Container Setup Script
set -e

echo "🚀 Setting up Fast MVP development environment..."

# Check if pnpm is installed, if not install it
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PATH="$HOME/.local/share/pnpm:$PATH"
    
    # Add pnpm to PATH for future sessions
    echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.bashrc
    echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.zshrc
else
    echo "✅ pnpm is already installed"
fi

# Verify pnpm installation
pnpm --version

# Install project dependencies
echo "📚 Installing project dependencies..."
pnpm install

# Set up git safe directory
git config --global --add safe.directory /workspace

echo "✨ Setup complete! You can now run 'pnpm dev' to start the development server."
