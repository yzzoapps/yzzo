use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Item {
    id: u16,
    content: String,
    created_at: String,
    updated_at: String,
    bumped_at: String,
}
