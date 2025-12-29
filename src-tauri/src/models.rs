use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Item {
    pub id: u16,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
    pub bumped_at: String,
    pub item_type: String,
    pub file_path: Option<String>,
    pub metadata: Option<String>,
}
