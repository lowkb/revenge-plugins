export interface ActivityAssets {
  large_image: string;
  large_text: string;
  small_image: string;
  small_text: string;
}

export interface ActivityMetadata {
  button_urls: [string, string];
}

export interface Activity {
  application_id: string;
  name: string;
  details: string;
  state: string;
  type: number;
  timestamps?: { start: number };
  assets: ActivityAssets;
  buttons: [string, string];
  metadata: ActivityMetadata;
}

// Typy dostępnych aktywności do FormSelect
export const ActivityTypes = [
  { label: "Playing", value: 0 },
  { label: "Streaming", value: 1 },
  { label: "Listening", value: 2 },
  { label: "Watching", value: 3 },
];
