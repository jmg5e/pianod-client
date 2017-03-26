Protocol Details
----------------
### pianod Socket Interface
Following in the traditions of FTP, SMTP, POP, and other UNIX services, `pianod` accepts single-line commands and returns responses in the form of:

	nnn Descriptive Text Here

A command is a series of terms separated by spaces.  Terms are either:

* A bare word
* A series of words surrounded by double quotes.  The opening double quote *must* immediately precede the first word, the closing quote *must* immediately follow the last word.  Quotes in other places are treated as part of the term.  There no literal mechanism.

For example:

	rename "Classical, Choral" to "Classical, Artistic Moaning"

### Websockets
A line (either command or response) on line-oriented socket interface is equivalent to one Websocket packet.  The commands and response strings are
identical, except that newlines are not included.

### Response format
`pianod` responses take the form:

	nnn Descriptive Text Here

`nnn` is a numerical status that should be used when interfacing with the server via programmatic methods.  In a few cases, the descriptive text provides additional details.

Unlike other UNIX services, pianod may also spontaneously generate messages in response to playback changes, track changes, music mix changes, etc.  The 5 categories of messages are arranged to make separating the command-response messages from spontaneous messages.


100-199
: Informational messages.  These identify specific pieces of information sent by the server.

200-299
:   Success messages.  These occur in response to commands.

300-399
:   Error detail messages.  Zero or more of these precede a 400-class message and provide additional details relating to that error.

400-499
:   Command error messages.  These occur in response to a command.

500-599
:   Other server errors.  These indicate problems that are not command-related.  For example, a server being down.

In most cases, exactly *one* of *either* a 200- or a 400-group message will occur in response to a command; the exception to this is `203 Data` responses.  One or more 300-group messages may occur between the command and 400-group message.

### Status (101–109)
Status seems to create some confusion.  Messages 101-104 indicate
playback status, whereas 108-109 represent the selected station.

The selected station may or may not be the
same as the playing station, for two reasons: one, the station may
have been changed since the song started playing; and two, the
station may be the quickmix in which case the song belongs to the
station it's mixed from.

101, 102 & 106
: Playback is playing and paused, respectively.  For reasons of legacy
suckage, the format isn't quite consistent with the rest of pianod.
Sorry.

: The formatting for 101/102/106 playback status messages is:

	101 now/length/remain Playing
	102 now/length/remain Paused
	106 now/length/remain Stalled

: For example:

	101 02:27/04:12/-01:45 Playing

Stalled state indicates the player should be playing, but is not,
typically because of a buffer underrun caused by network issues.

103
: Playback is stopped; there is no current song.
There may or may not be a station.

104
: The player is playing, but momentarily between tracks so there is no current song.

105
: The playing track has ended.

108
: There is no station selected.

109
: Selected station name.  The data format is:

	109 SelectedStation: type name
	
:	where *type* is one of `mix` (indicating manually-selected QuickMix mode), `auto` (autotuned QuickMix mode) or `station` (a single station).  For example:

	109 SelectedStation: mix Foobar's QuickMix

	109 SelectedStation: station Jazz Fusion

### Data items
Data items take the form:

	nnn Title: Value

`nnn` and `Title` have a 1:1 relationship; `nnn` being for machine use, `Title` being for human legibility.  Titles are composed of exactly one word.

See the code (response.h) for assigned field numbers.  Below are details for special cases.

#### Fields

116
: Track rating information.  Ratings include 1 or more of: good, neutral, or bad; seed, artistseed.

	116 Rating: good artistseed

120
: Station rating, which is *per `pianod` user*.  These apply to the playing track's station, *not* the selected station.

134, 135, & 137
: Mix, stations, and user ratings changed.  These data fields only indicate that something changed.  It is up the client to refresh if appropriate.

### Data responses (203, 204)
Data responses occur in response to requests for station lists,
current song, song queue, song history, etc.  Data fields use the same numbering in both the response and spontaneous contexts, however, it is guaranteed that spontaneous messages will not occur between the initial 203 and final 204 of a response, allowing responses to be separated from other messages.

#### No Data
A single `204 End of data` response occurs.

	HISTORY
	204 No data or end of data

#### Single field list
If data is available, then there is a single `203 Data`, followed
by 1 or more data items, and finally a `204 End of data`.

	STATIONS
	203 Data request ok
	115 Station: Hard Rock Strength Training Radio
	115 Station: New Age Beats Radio
	115 Station: Chillout Radio
	115 Station: Disco
	115 Station: Symphonic, Classical Period
	115 Station: Jazz Fusion
	204 No data or end of data


#### Multi field list
If data is available, then there are one or more `203 Data` responses, each followed by the individual data items.  Following the last data group, a `204 End of Data` occurs.

	QUEUE
	203 Data request ok
	111 ArtistID: S479098
	112 Album: Big 6
	113 Artist: Blue Mitchell
	114 Title: Sir John
	115 Station: Jazz Fusion
	203 Data request ok
	111 ArtistID: S278345
	112 Album: Look At All The Love We Found: A Tribute To Sublime
	113 Artist: The Greyboy Allstars
	114 Title: Doin' Time
	115 Station: Jazz Fusion
	203 Data request ok
	111 ArtistID: S551643
	112 Album: Tutu
	113 Artist: Miles Davis
	114 Title: Portia
	115 Station: Jazz Fusion
	204 No data or end of data
