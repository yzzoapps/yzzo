use sqlx::{Pool, Sqlite, migrate::MigrateDatabase, sqlite::SqlitePoolOptions};
use tauri::{AppHandle, Manager};

pub type Database = Pool<Sqlite>;

#[derive(Debug)]
pub enum DbSetupError {
    AppDataDir(String),
    CreateDir(String),
    CreateDatabase(String),
    Connect(String),
    Pragma(String),
    Migration(String),
}

impl std::fmt::Display for DbSetupError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DbSetupError::AppDataDir(e) => write!(f, "Failed to get app data directory: {}", e),
            DbSetupError::CreateDir(e) => write!(f, "Failed to create data directory: {}", e),
            DbSetupError::CreateDatabase(e) => write!(f, "Failed to create database: {}", e),
            DbSetupError::Connect(e) => write!(f, "Failed to connect to database: {}", e),
            DbSetupError::Pragma(e) => write!(f, "Failed to configure database: {}", e),
            DbSetupError::Migration(e) => write!(f, "Failed to run database migrations: {}", e),
        }
    }
}

pub async fn setup_db(app: &AppHandle) -> Result<Database, DbSetupError> {
    let mut path = app
        .path()
        .app_data_dir()
        .map_err(|e: tauri::Error| DbSetupError::AppDataDir(e.to_string()))?;

    std::fs::create_dir_all(&path)
        .map_err(|e| DbSetupError::CreateDir(format!("{}: {}", path.display(), e)))?;

    path.push("db.sqlite");

    let db_url = format!("sqlite:{}", path.to_str().unwrap_or("invalid_path"));

    println!("[I] SQLite Database Path: {}", path.display());

    if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
        Sqlite::create_database(&db_url)
            .await
            .map_err(|e| DbSetupError::CreateDatabase(e.to_string()))?;
        println!("[V] Database created at {}", path.display());
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect(&db_url)
        .await
        .map_err(|e| DbSetupError::Connect(e.to_string()))?;

    // SQLite performance optimizations
    sqlx::query("PRAGMA journal_mode = WAL;")
        .execute(&pool)
        .await
        .map_err(|e| DbSetupError::Pragma(format!("WAL mode: {}", e)))?;

    sqlx::query("PRAGMA synchronous = NORMAL;")
        .execute(&pool)
        .await
        .map_err(|e| DbSetupError::Pragma(format!("synchronous: {}", e)))?;

    sqlx::query("PRAGMA cache_size = -64000;")
        .execute(&pool)
        .await
        .map_err(|e| DbSetupError::Pragma(format!("cache_size: {}", e)))?;

    sqlx::query("PRAGMA temp_store = MEMORY;")
        .execute(&pool)
        .await
        .map_err(|e| DbSetupError::Pragma(format!("temp_store: {}", e)))?;

    println!("[I] Attempting to run migrations...");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|e| DbSetupError::Migration(e.to_string()))?;

    println!("[V] Migrations applied successfully");

    Ok(pool)
}
