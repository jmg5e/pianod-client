module.exports = {
  'connected' : [
    '200 Connected',
    '100 pianod 175. Welcome!',
    '141 Volume: 0',
    '109 SelectedStation: station station1',
    '102 02:27/03:37/-00:10 Paused',
    '111 ID: PZ-_awo3BOQ5uoblXbk44mJX57PP-LSboEuIKqWlwdDjmpR1uAXHC93Up0U0LXJGZGSye5ydBBz01wCzXBY8KQg',
    '112 Album: song album',
    '113 Artist: song artist',
    '114 Title: song title',
    '115 Station: station1',
  ],

  'user userName invalidPass' : [ '406 Invalid login or password' ],
  'user userName validPass' : [
    '132 admin signed in', '120 UserRating: neutral', '200 Success',
    '136 Privileges: admin owner service influence tuner'
  ],
  'play' : [ '101 01:54/04:20/-02:26 Playing', '200 Success' ],
  'pause' : [
    '102 03:00/04:20/-01:20 Paused', '200 Success', '132 admin paused playback'
  ],
  'stop' : [
    '132 admin stopped the player', '108 No station selected', '103 Stopped',
    '200 Success'
  ],
  'stations' : [
    '203 Data request ok', '115 Station: station1', '115 Station: station2',
    '204 No data or end of dataRequest'
  ],
  'mix list' : [
    '203 Data request ok', '115 Station: station1',
    '204 No data or end of dataRequest'
  ],
  'station seeds \"station1\"' : [
    '203 Data request ok', '111 ID: a01', '113 Artist: Taylor Swift',
    '116 Rating: artistseed', '203 Data request ok', '111 ID: a02',
    '114 Title: Thriller', '116 Rating: artistseed',
    '204 No data or end of dataRequest'
  ],
  'station seeds \"station2\"' : [
    '203 Data request ok', '111 ID: b01', '119 Genre: Medieval Rock',
    '116 Rating: artistseed', '204 No data or end of dataRequest'
  ],
  'null' : []
};
