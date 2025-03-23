#!/bin/bash

# Configuration
BACKUP_DIR="../.backups"
MAX_BACKUPS=10
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
BACKUP_NAME="pdt_ict_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to clean up old backups
cleanup_old_backups() {
    local count=$(ls -1 "$BACKUP_DIR" | wc -l)
    if [ "$count" -gt "$MAX_BACKUPS" ]; then
        echo "Cleaning up old backups..."
        cd "$BACKUP_DIR" && ls -t | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -rf
    fi
}

# Function to log backup operations
log_backup() {
    local message="$1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$BACKUP_DIR/backup.log"
}

# Create backup
echo "Creating backup: $BACKUP_NAME"
log_backup "Starting backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Copy files with exclusions
rsync -av --progress \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '*.tar.gz' \
    --exclude '*.zip' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude 'coverage' \
    --exclude '.DS_Store' \
    ./ "$BACKUP_PATH/"

# Create a manifest of all files
find "$BACKUP_PATH" -type f -exec sha256sum {} \; > "$BACKUP_PATH/manifest.sha256"

# Create a metadata file
cat > "$BACKUP_PATH/metadata.json" << EOF
{
    "backup_name": "$BACKUP_NAME",
    "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
    "git_commit": "$(git rev-parse HEAD)",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD)",
    "excluded_patterns": [
        ".git",
        "node_modules",
        "*.tar.gz",
        "*.zip",
        ".env",
        "dist",
        "build",
        "coverage",
        ".DS_Store"
    ]
}
EOF

# Clean up old backups
cleanup_old_backups

# Log completion
log_backup "Backup completed: $BACKUP_NAME"
echo "Backup completed successfully!"
echo "Location: $BACKUP_PATH" 