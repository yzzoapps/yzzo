export interface Item {
  id: number;
  content: string;
  item_type: string;
  file_path?: string;
  metadata?: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}
