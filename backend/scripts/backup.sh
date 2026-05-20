#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="crown_eve_backup_$DATE.sql"

# Ensure backups directory exists
mkdir -p backups

pg_dump $DATABASE_URL > backups/$FILENAME

# Compress it
gzip backups/$FILENAME

echo "Backup saved: backups/$FILENAME.gz"
