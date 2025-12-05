use sqlx::{Pool, Sqlite, migrate::MigrateDatabase, sqlite::SqlitePoolOptions};
use tauri::{AppHandle, Manager};

pub type Database = Pool<Sqlite>;

pub async fn setup_db(app: &AppHandle) -> Database {
    let mut path = app
        .path()
        .app_data_dir()
        .expect("failed to get app data directory");

    println!("SQLite path: {}", path.display());

    std::fs::create_dir_all(&path).expect("failed to create data directory");

    path.push("db.sqlite");

    let db_url = format!("sqlite:{}", path.to_string_lossy());

    if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
        Sqlite::create_database(&db_url)
            .await
            .expect("failed to create database");
    }

    let pool = SqlitePoolOptions::new()
        .connect(&db_url)
        .await
        .expect("failed to connect to sqlite");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("failed to run migrations");

    pool
}
