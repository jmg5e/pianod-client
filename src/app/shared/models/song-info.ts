export class SongInfo {
  ID: string;
  Station: string;
  Artist: string;
  Album: string;
  Title: string;
  CoverArt: string;
  SeeAlso: string;
  UserRating: string;
  SelectedStation: string;
  Rating: string;

  // data should contain a valid key and property
  public update(data) { Object.assign(this, data); }
}
