Protocol Details
----------------
### `pianod2` Socket Interface
Following in the traditions of FTP, SMTP, POP, and other UNIX services, `pianod2` accepts single-line commands and returns responses in the form of:

	nnn Descriptive Text Here

A command is a series of terms separated by spaces.  Terms are either:

* A bare word
* A series of words surrounded by double quotes.  The opening double quote *must* immediately precede the first word, the closing quote *must* immediately follow the last word.  Quotes in other places are treated as part of the term.  There is no literal mechanism.

For example:

	rename "Classical, Choral" to "Classical, Artistic Moaning"

This holds for all commands *except* filter expressions.  A filter expression is parsed independently and obeys different rules.  A filter expression must not be quoted:

	SONG LIST WHERE ARTIST=“Madonna” & ALBUM=~”Virgin”

The filter expression starts at “ARTIST”.  See _Filter Grammar_ for details.

### Websockets
A line (either command or response) on line-oriented socket interface is equivalent to one Websocket packet.  The commands and response strings are identical, except that newlines are not included.

### Response format
`pianod2` responses take two forms:

	nnn Descriptive Text
	nnn Title: Value

`nnn` is a numerical status that should be used when interfacing with with other software.

- For status message, descriptive text provides an explanation and possibly details.  It is not internationalized but is subject to change.
- For data messages, titles are composed of exactly one word (or use CamelCase), which is followed by colon, space, and a value.

Unlike many network services, `pianod2` may spontaneously generate messages in response to playback changes, track changes, music mix changes, etc.  The 6 categories of messages are arranged to make separating the command-response messages from spontaneous messages.

See the code (response.h) for assigned field numbers.  Below are details for special cases.

### Status Messages

000-099
: Status.  These indicate status that is not command-related.

100-199
: Data.  These identify specific pieces of information sent by the server.  These messages may occur spontaneously or as part of a data response to a command; see [Data Responses][].

200-299
: Success messages.  These occur in response to commands.

300-399
: Error detail messages.  Zero or more of these precede a 400-class message and provide additional details relating to that error.

400-499
: Command error messages.  These occur in response to a command.

500-599
: Other server errors.  These indicate problems that are not command-related.  For example, a server being down.

In most cases, exactly *one* of *either* a 200- or a 400-group message will occur in response to a command; the exception to this is `203 Data` responses.  One or more 300-group messages may occur as a result of command, and always supplement or qualify a subsequent 400-group message.

### Playback Status (001–009)
Messages 001-019 indicate playback status.

001, 002 & 003
: Playback is playing, paused, and stalled respectively.  The formatting for the messages is:

		001 Playing: now/length/remain
		002 Paused: now/length/remain
		003 Stalled: now/length/remain

: For example:

		001 Playing: 02:27/04:12/-01:45

Stalled indicates the player should be playing, but is not, typically because of a buffer underrun caused by network issues.

004
: The playing track has ended.  This represents an event as opposed to a state.

005
: The player is between tracks but cuing a song.

006
: There is nothing playing or paused and the player will not start anything new for any reason: the player is paused, queue mode is stopped, there are no playlists selected, the queue is in requests mode but is empty, etc.

### Queue mode
Regarding the difference between player state and queue mode: the player state is the CD player, the queue mode is the DJ.

007
: Stopped.

008
: Request-only mode.

009
: Random play mode.  If there are no requests, random selections will be played.

### Selections

011
: Selected source.  This message indicates the source that will be used when processing requests *on this connection*.  The response format is:

	011 SelectedSource: id type name

For example:

	011 SelectedSource: 1 manager Pianod
	011 SelectedSource: 2 tonegenerator Pianod 

012
: Selected playlist *for this room*, which may not coincide with the playing playlist: first, the playlist may have been changed since the song started playing; and second, the selected playlist may be a mix or everything playlist, which encapsulates other playlists.  The data format is:

		012 SelectedPlaylist: type name
	
	where *type* is one of `mix` (a manually-selected playlist mix), `auto` (an autotuned playlist mix), `everything` (all playlists are mixing), or `playlist` (a single playlist).  For example:

		012 SelectedPlaylist: mix Foobar's QuickMix
		012 SelectedPlaylist: playlist Jazz Fusion
		012 SelectedPlaylist: everything Metamix Bibliotheque

### Notifications
Notifications simply alert that something happened or changed, but provide no additional detail.  It is up the client to request data if appropriate.

021
: Mix selections have changed.

022
: The list of playlists has changed.  Implies possible mix change.  If a parameter is included, it is the ID of the playlist effected.

023
: Playlist ratings have changed.  Broadcast per-user.

024
: Sources available have changed. Implies possible playlist change.

025
: Song rating changed.  Parameter is ID of song.

026
: Queue changed.  Indicates insertion, removal or reorder of the queue.  Not sent when playback starts; queue advance in this case is implied by playback status message.

#### Fields

116
: Track rating information.  The rating line always includes the rating as an adjective, then a numeric value (0.5–5.0; 0 indicates unrated), then 0 or more seed indications.  Some examples:

		116 Rating: good 4.0 seed
		116 Rating: unheard 0.0 artistseed albumseed
		116 Rating: repugnant 0.5

	Rating adjectives includes: Unrated, repugnant, awful, bad, poor, lackluster, neutral, okay, good, excellent and superb.

	Seed indications include: seed, albumseed, artistseed

120
: Playlist rating, which is *per `pianod2` user*.  These apply to the playing track's playlist, *not* the selected playlist.  Format and adjectives are similar to 116.

127
: Actions.  Indicates actions that may be taken for a given item.  In addition to source capability variances, queue items may differ from search results (song suggestions) and seed listings (song seeds).  Values include: `request` (the item may be requested), `rate` (the item may be rated), `seed`, `albumseed`, `artistseed`.  Seeds apply to playlist actions; when included for a song, they indicate that the song may be seeded on the playlist from which it originates.

### Data responses (203, 204)
Data responses occur in response to requests for playlist lists, current song, song queue, song history, etc.  Data fields use the same numbering in both the response and spontaneous contexts, however, it is guaranteed that spontaneous data messages (100-199) will not occur between the initial 203 and final 204 of a response, allowing responses to be separated from other messages.

#### No Data
A single `204 End of data` response occurs.

	HISTORY LIST
	204 No data or end of data

#### Single field list
If data is available, then there is a single `203 Data`, followed by 1 or more data items (100-199), and finally a `204 End of data`.

	SOURCE TYPES LIST
	203 Data
	123 Source: manager
	123 Source: pandora
	123 Source: tonegenerator
	204 No data or end of data
	PLAYLISTS LIST NAMES
	203 Data request ok
	115 Playlist: Hard Rock Strength Training Radio
	115 Playlist: New Age Beats Radio
	115 Playlist: Chillout Radio
	115 Playlist: Disco
	115 Playlist: Symphonic, Classical Period
	115 Playlist: Jazz Fusion
	204 No data or end of data


#### Multi field list
If data is available, then there are one or more `203 Data` responses, each followed by the individual data items.  Following the last data group, a `204 End of Data` occurs.

	QUEUE LIST
	203 Data request ok
	111 ArtistID: S479098
	112 Album: Big 6
	113 Artist: Blue Mitchell
	114 Title: Sir John
	115 Playlist: Jazz Fusion
	203 Data request ok
	111 ArtistID: S278345
	112 Album: Look At All The Love We Found: A Tribute To Sublime
	113 Artist: The Greyboy Allstars
	114 Title: Doin' Time
	115 Playlist: Jazz Fusion
	203 Data request ok
	111 ArtistID: S551643
	112 Album: Tutu
	113 Artist: Miles Davis
	114 Title: Portia
	115 Playlist: Jazz Fusion
	204 No data or end of data

Note that fields in records may not be homogenous; queue items from multiple sources, for example, may have differing fields.  Playlist seeds is another example, where depending each the seed’s type (artist vs. album vs. song) included fields will vary.
