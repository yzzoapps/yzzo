use crate::db::Database;

pub type DbPool = Database;

pub struct AppState {
    pub db: DbPool,
}
