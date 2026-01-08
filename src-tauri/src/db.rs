use sqlx::{Pool, Sqlite, migrate::MigrateDatabase, sqlite::SqlitePoolOptions};
use tauri::{AppHandle, Manager};

pub type Database = Pool<Sqlite>;

pub async fn setup_db(app: &AppHandle) -> Database {
    let mut path = app
        .path()
        .app_data_dir()
        .expect("failed to get app data directory");

    std::fs::create_dir_all(&path).expect("failed to create data directory");

    path.push("db.sqlite");

    let db_url = format!("sqlite:{}", path.to_str().unwrap());

    println!("[I] SQLite Database Path: {}", path.display());

    if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
        Sqlite::create_database(&db_url)
            .await
            .expect("failed to create database");
        println!("[V] Database created at {}", path.display());
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(1) // SQLite works best with single connection for desktop apps
        .connect(&db_url)
        .await
        .expect("failed to connect to sqlite");

    // SQLite performance optimizations
    sqlx::query("PRAGMA journal_mode = WAL;") // write-ahead logging for better concurrency
        .execute(&pool)
        .await
        .expect("failed to set WAL mode");

    sqlx::query("PRAGMA synchronous = NORMAL;") // faster writes, still safe
        .execute(&pool)
        .await
        .expect("failed to set synchronous mode");

    sqlx::query("PRAGMA cache_size = -64000;") // 64MB cache
        .execute(&pool)
        .await
        .expect("failed to set cache size");

    sqlx::query("PRAGMA temp_store = MEMORY;") // store temp tables in memory
        .execute(&pool)
        .await
        .expect("failed to set temp store");

    println!("[I] Attempting to run migrations...");

    if let Err(e) = sqlx::migrate!("./migrations").run(&pool).await {
        println!("[X] Migration failed: {}", e);
        panic!("Failed to run migrations");
    } else {
        println!("[V] Migrations applied successfully");
    }

    pool
}
