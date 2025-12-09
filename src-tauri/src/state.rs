use crate::db::Database;

pub type DbPool = Database;

#[derive(Clone)]
pub struct AppState {
    pub db: DbPool,
}
