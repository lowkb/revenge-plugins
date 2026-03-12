export interface RPCAssets {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

export interface RPCActivity {
  application_id: string;
  name: string;
  details?: string;
  state?: string;
  type?: number;
  timestamps?: { start?: number; end?: number };
  assets?: RPCAssets;
  buttons?: string[];
  metadata?: { button_urls?: string[] };
}

export interface RPCSettings {
  application_id: string;
  name: string;
  details?: string;
  state?: string;
  type?: number;
  assets?: RPCAssets;
  buttons?: string[];
  metadata?: { button_urls?: string[] };
}
