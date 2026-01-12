use std::fs;
use tempfile::TempDir;

#[test]
fn test_clear_images_directory() {
    // Create a temporary directory to simulate the images folder
    let temp_dir = TempDir::new().unwrap();
    let images_dir = temp_dir.path().join("images");
    fs::create_dir_all(&images_dir).unwrap();

    let test_files = vec!["image1.png", "image2.png", "image3.jpg"];
    for file in &test_files {
        let file_path = images_dir.join(file);
        fs::write(&file_path, b"fake image data").unwrap();
        assert!(file_path.exists());
    }

    // Verify files exist
    assert_eq!(fs::read_dir(&images_dir).unwrap().count(), 3);

    // Simulate the clear operation: remove all and recreate
    fs::remove_dir_all(&images_dir).unwrap();
    fs::create_dir_all(&images_dir).unwrap();

    // Verify directory is empty but exists
    assert!(images_dir.exists());
    assert_eq!(fs::read_dir(&images_dir).unwrap().count(), 0);
}

#[test]
fn test_clear_individual_image_files() {
    let temp_dir = TempDir::new().unwrap();

    // Create individual image files (simulating file_path from database)
    let file_paths: Vec<std::path::PathBuf> = (1..=3)
        .map(|i| {
            let path = temp_dir.path().join(format!("image_{}.png", i));
            fs::write(&path, b"fake image data").unwrap();
            path
        })
        .collect();

    // Verify files exist
    for path in &file_paths {
        assert!(path.exists());
    }

    // Simulate deleting individual files (as done in clear_all_items)
    for path in &file_paths {
        let _ = fs::remove_file(path);
    }

    // Verify files are deleted
    for path in &file_paths {
        assert!(!path.exists());
    }
}

#[test]
fn test_clear_nonexistent_file_does_not_panic() {
    let temp_dir = TempDir::new().unwrap();
    let nonexistent_path = temp_dir.path().join("nonexistent.png");

    // This should not panic, just like the _ = fs::remove_file() in the actual code
    let result = fs::remove_file(&nonexistent_path);
    assert!(result.is_err());
}

#[test]
fn test_clear_empty_images_directory() {
    let temp_dir = TempDir::new().unwrap();
    let images_dir = temp_dir.path().join("images");
    fs::create_dir_all(&images_dir).unwrap();

    // Directory exists but is empty
    assert!(images_dir.exists());
    assert_eq!(fs::read_dir(&images_dir).unwrap().count(), 0);

    // Clear operation should work on empty directory
    fs::remove_dir_all(&images_dir).unwrap();
    fs::create_dir_all(&images_dir).unwrap();

    assert!(images_dir.exists());
    assert_eq!(fs::read_dir(&images_dir).unwrap().count(), 0);
}

#[test]
fn test_clear_images_directory_not_exists() {
    let temp_dir = TempDir::new().unwrap();
    let images_dir = temp_dir.path().join("images");

    // Directory does not exist
    assert!(!images_dir.exists());

    // Simulate the check in clear_all_items: only clear if exists
    if images_dir.exists() {
        fs::remove_dir_all(&images_dir).unwrap();
        fs::create_dir_all(&images_dir).unwrap();
    }

    // Should still not exist (we didn't create it)
    assert!(!images_dir.exists());
}
