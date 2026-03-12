export interface Assets {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

export interface Activity {
  application_id: string;
  name: string;
  details?: string;
  state?: string;
  type?: number;
  timestamps?: { start?: number; end?: number };
  assets?: Assets;
  buttons?: string[];
  metadata?: { button_urls?: string[] };
}

export interface Settings {
  application_id: string;
  name: string;
  details?: string;
  state?: string;
  assets?: Assets;
  buttons?: string[];
  metadata?: { button_urls?: string[] };
}
