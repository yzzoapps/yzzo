# Crash Testing (Development)

This document covers manual testing for startup error handling. These tests verify that the app shows a native error dialog instead of silently crashing when initialization fails.

**Important:** Always restore permissions after testing.

---

## macOS

The app data directory is located at:
```
~/Library/Application Support/app.yzzo.yzzo
```

### 1. Test Database Path Failure

Makes the entire app data directory inaccessible.

```bash
# Remove permissions
chmod 000 ~/Library/Application\ Support/app.yzzo.yzzo

# Run the app - should show "Database Error" dialog
/path/to/YZZO.app/Contents/MacOS/YZZO

# Restore permissions
chmod 755 ~/Library/Application\ Support/app.yzzo.yzzo
```

### 2. Test Corrupted Database

Corrupts the SQLite database file.

```bash
# Backup the database
cp ~/Library/Application\ Support/app.yzzo.yzzo/db.sqlite ~/db.sqlite.bak

# Corrupt it
echo "corrupted" > ~/Library/Application\ Support/app.yzzo.yzzo/db.sqlite

# Run the app - should show "Database Error" dialog
/path/to/YZZO.app/Contents/MacOS/YZZO

# Restore the database
cp ~/db.sqlite.bak ~/Library/Application\ Support/app.yzzo.yzzo/db.sqlite
rm ~/db.sqlite.bak
```

### 3. Test Images Directory Failure

Makes the images directory unwritable.

```bash
# Remove permissions
chmod 000 ~/Library/Application\ Support/app.yzzo.yzzo/images

# Run the app - should show "Clipboard Error" dialog
/path/to/YZZO.app/Contents/MacOS/YZZO

# Restore permissions
chmod 755 ~/Library/Application\ Support/app.yzzo.yzzo/images
```

---

## Linux

The app data directory is located at:
```
~/.local/share/app.yzzo.yzzo
```

Replace the macOS path with the Linux path in the commands above.

---

## Expected Behavior

When any of these errors occur, the app should:

1. Display a native error dialog with a descriptive message
2. Exit gracefully after the user dismisses the dialog
3. Not leave any zombie processes

If the app crashes silently without showing a dialog, the error handling needs to be fixed.
