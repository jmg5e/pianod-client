pianod2 Commands
-----------------
**Warning**: Although similar to the original `pianod` protocol, enhancements in `pianod2` are incompatible.  If you are working with the [original pianod], refer to the [documentation included with the original].

Commands are not case sensitive.  Quoting may be done with single or double quotes, but must match.  Starting and ending quotes must respectively lead a word and trail words.  The quote may be inserted into the string by doubling it in place:

* "don't stop": don't stop
* 'don''t stop': don't stop
* "ain't got nothin'": ain't got nothin'
* "ain''t got nothin''": ain''t got nothin''
* 'ain''t got nothin''': ain't got nothin'
* 'ain''t got nothin''' "don't stop": ain't got nothin', don't stop (2 terms)
* 'ain't got nothin'' "don't stop": ain't got nothin' "don't stop" (1 term)

[original pianod]: http://deviousfish.com/pianod
[documentation included with the original]: http://deviousfish.com/pianod/pianod.html

### Logging in
To authenticate with `pianod2`, issue:

	USER {username} {password}

When the session is complete:

	QUIT

When scripting `pianod2`, A single command can be issued via:

	AS USER {user} {password} {command}

This authenticates as the specified user, executes the command, and closes the connection.  (`WAIT` commands are respected, and close when the waited-on event occurs.)  The `AS USER` form does not broadcast user login/logout or effect autotuning.  This is intended to ease implementation of simpler clients and automation systems that do not hold connections open.

A freshly installed `pianod2` system will have a single user 'admin' with password 'admin'.

After authenticating, a user can change their password:

	SET PASSWORD {old} {new}

### Help
Help is displayed based on user rank and privileges; listeners will see only listener-only commands; administrators will see the full list.  Specifying a command lists matching commands only.

	HELP [{command}]

### Sources
`pianod2` supports multiple sources.  A source can be:

- A Pandora account
- The built-in tone generator
- A local media collection (i.e., mp3 files)
- Other future sources
- Pianod2’s media manager

Each `pianod2` session has a current source.  At login, the source is the media manager, assigned source #1, which aggregates all other sources’ playlists and collections.

When another source is created, it is assigned an ID which can be used to select that source:

	SOURCE SELECT ID {#id}

Sources can also be selected by type:

	SOURCE SELECT TYPE {type} NAME {name}

_type_ describes the kind of source, such as `Pandora` or `tonegenerator`.  _name_ may be specified when a source is created, but usually defaults to the pianod username.

To view the current sources:

	SOURCE LIST <ENABLED|AVAILABLE|MINE|TYPE>

Lists sources in use, those with stored credentials (which may or may not presently be in use), those owned by the user, and the types compiled into pianod.

Removing is broken into two aspects, disconnect and forgetting.  Disconnecting sources parallels selecting:

	SOURCE DISCONNECT ID {#id}
	SOURCE DISCONNECT TYPE {type} NAME {name}

This disconnects an active source, but if remembered or restored (see standard options below) its parameters are retained.  These parameters may be removed by:

    SOURCE FORGET TYPE {name} NAME {name}

Forgetting removes stored parameters, but does not disconnect the source.

If a source is busy (currently playing a song), its removal is processed but deferred until it is free.

A single command may be executed with a different source:

	WITH SOURCE ID {id} {command} …
	WITH SOURCE TYPE {type} NAME {name} {command} …

#### Standard Source Options
There are some standard options when creating any source:

`REMEMBER`
: Persist the source options.  For security, options are stored with the _creating_ user’s data, not the owning user.  Passwords are enciphered to prevent casual reading but are not stored in a cryptographically secure manner.  May not be used with `OWNER`.

`OWNED BY {user}`
: Assigns ownership of the source to the specified user.  May not be used with `REMEMBER`.

`WAIT`
: Waits for the source to become ready.  Depending on the source and conditions, this may be some time.

`NAME {name}`
: Assigns a name; the default is the user’s name.  The source type and name can be used to select sources.  The type/name pair must be unique to add a source.  A remembered source will overwrite an existing one with that type and name.

`ACCESS <DISOWNED|PRIVATE|SHARED|PUBLISHED|PUBLIC>`
: Set access for the source.  `DISOWNED`: Nobody can manipulate the source.  `PRIVATE`: Only the owner may use or modify the source.  `SHARED`: Anyone may use the source, but only the owner can review details or modify it. `PUBLISHED`: Anyone may use or review the source, but only the owner may modify it. `PUBLIC`: Anyone may use, review, or modify the source.

`SONG PROXY {proxy-mode}`
: _proxy-mode_ may be `DONOR`, `RECIPIENT`, or `NONE`.  When playing a song from a proxy recipient, pianod checks proxy donors for a matching item.  If found, the donor item is transparently substituted.  Donors incapable of requests are ignored.

#### Pandora Sources
Administrators and those with `service` privilege can add a Pandora source:

	PANDORA [PLUS] USER {username} {password} [{connection options}] …

If `PLUS` is specified, Pandora Plus connection parameters and a higher audio quality are used.  Otherwise, the standard values are used.

In addition to standard source parameters, connection parameters may include:

`PROXY {url}`
: Set a proxy

`CONTROL PROXY {url}`
: Set a control proxy, typically for those outside the USA.  For information on proxies, see [The Onion Router (tor)].

`PAUSE TIMEOUT {#duration:15-86400}`
: When paused this duration (in seconds), playback is cancelled.

`PLAYLIST TIMEOUT {#duration:1800-86400}`
: Playlist items expire this number of seconds after retrieval.

`AUDIO QUALITY <HIGH | MEDIUM | LOW>`
: Choose the audio quality.

`RPC HOST {hostname}`
: Set the Pandora RPC hostname.

`RPC TLS PORT {#port}`
: Set the port for RPCs over TLS.

`PARTNER {user} {password}`
: Set the Pandora Partner username and password.

`ENCRYPTION PASSWORD {password}`
: Set the enciphering password for data sent to the server.

`DECRYPTION PASSWORD {password}`
: Set the deciphering password for data sent by the server.

To view a Pandora source’s parameters, select that source and:

	PANDORA SETTINGS

[The Onion Router (tor)]: https://www.torproject.org/ 


#### Filesystem Source
The filesystem source uses a media collection from a local hard drive or mounted network drive (share).

	FILESYSTEM ADD {path} [{parameters}] …

Path must be a fully-qualified path to a directory where media is located.  Subdirectories are recursed to find media, but symbolic links are not followed.  If adding a large collection, the initial add may take a while.

In addition to standard parameters, filesystem sources support:

`RESCAN <ONCE|ALWAYS|NEVER|PERIODICALLY>`
: Whether to rescan the filesystem media files on load.  In addition to adding new media and removing missing media, the catalog is updated to reflect metadata updates in the files.  An initial scan is done regardless of this setting.  The source does not become ready until an on-load scan is complete.  However, periodic scans are performed on the live source.  The period is currently each day.

`RATINGS BIAS {1-100}`
: Controls amount of selection bias applied based on ratings.  When set to 1, track selection is not effected by ratings.  At 100, a top rating is preferred 10:1 over neutral, while a bottom rating preferred 1/20th a neutral-rated track.

`RECENT BIAS {0-100}`
: Controls selection bias based on last play.  At 1, no bias is applied; at 100, the chance assigned each song is roughly linear to the time since last play.

Rescanning for new media can also be requested on an active filesystem source.  Use `SOURCE SELECT` or `WITH SOURCE` to choose a filesystem source, then:

`FILESYSTEM RESCAN [FRESH]`

The source remains available during rescan.  Fresh rescans trash the existing index and rebuild.  Playlists are retained.  This fixes some problems (such as albums erroneously marked as compilations because of bad metadata, which has since been corrected), but risks changing the IDs assigned some media, effecting seeds and ratings.

#### Tone generator Source
The tone generator is used for audio testing, troubleshooting and debugging.

	TONE GENERATOR ACTIVATE [{parameters}] …

The tone generator includes 1KHz and 440Hz “A” test tones, all four Westminster quarters, a variety of telephone tones and the legacy EBS tone for when you really want people to go home at the end of the party.  (The Intergalactic Computer Distress Signal may also serve this function effectively.)

### Restoring from a persisted source/credentials
To use persisted source credentials:

	{source type} USE {name} {connection options} …

_name_ is the instance name given when originally created.  Default naming varies by source type.

### Rooms
Pianod2 supports multiple output devices, each with its own sources, music, and other controls.  Each output device is a `pianod2` “room”, each room represents a zone in home automation scenario.  The initial room is named `pianod`, and newly connected users start in that room.  To create a new room:

	ROOM CREATE {roomname} [{audio_options}] …

See Audio Configuration for more information on audio options.

To view available rooms:

	ROOMS LIST

To switch rooms:

	ROOM SELECT {roomname}

The current room’s audio options may be changed:

	ROOM RECONFIGURE [{audio options}] …

To remove rooms:

	ROOM DELETE {roomname} [NOW]

_roomname_ may not be the initial room (`pianod`).  A song in play is allowed to complete, unless `NOW` is specified.  Users in the room are logged out when the room is removed.

### Status commands
Status commands are available to all users.

The "null" command is done by sending an empty line.  This reports the status of playback and the playback time within the current song, if applicable.

Other status commands are:

	STATUS

Status indicates the current song, if there is one.  It also causes player status, selected playlist and source, and current room to be announced (though these are outside the data response).

	HISTORY LIST [{index}]
	QUEUE LIST [{index}]

`HISTORY LIST` returns a list of items previously played, up to the history size limit, or the specific history item if an _index_ is specified.

`QUEUE LIST` does the same for upcoming songs.  The queue/playlist replenishes periodically when it it has become empty.  The random queue may contain songs which are never played if their playlist is no longer applicable when they reach the front of the queue; in this case, they simply disappear.  Furthermore,  requests are always queued before any randomly chosen selections.

Both `HISTORY` and `QUEUE` allow an index to be specified.  If 0, the current song is returned.  For negative indices, `HISTORY` refers to upcoming tracks and `QUEUE` to previously played tracks.

### Playlist Selection
The list of playlists is available to all users:

	PLAYLIST LIST {predicate}

Lists playlists.  The short form `PLAYLIST` is also accepted, but future behavior is not guaranteed; currently it generates a shorter variant.  If no predicate is given, all playlists are listed.

Playlist selection is available to standard and administrative users.  A playlist may be selected by:

	SELECT <MIX | EVERYTHING>
	PLAY <MIX | EVERYTHING>
	SELECT PLAYLIST <ID | NAME | LIKE> {playlist}
    PLAY FROM {predicate}

`SELECT` will choose a playlist but not alter the play state (if paused or stopped, it will remain paused).  `PLAY` chooses a playlist and starts the player, resuming a track in progress if there is one.

- `MIX` plays music from playlists currently “in the mix” (see the MIX command).
- `EVERYTHING` plays music from all playlists.
- `PLAYLIST` plays a single playlist conforming to the predicate.
- `FROM` plays music selected by the predicate. 

If the current source is #1 (media manager), `MIX` and `EVERYTHING` source from all applicable playlists/collections of all sources.  Otherwise, only the active source’s playlists apply.

Choosing a playlist by ID is guaranteed to identify a unique playlist.  When selecting by playlist names, duplicate names will unpredictably select one of the matching playlists.

### Playback control
Playback control is available to standard and administrative ranks.

	PLAY [RANDOM]

Selects random play mode and resumes playback

	STOP [NOW]

Sets the queue mode to stopped.  The player to stop playing after the current track.  `NOW` cancels playback as well; it is almost equivalent to `STOP` followed by `SKIP` except skip-limit checks are skipped and the skip is not counted. 

	PAUSE [TOGGLE]
	RESUME

`PAUSE` pauses or toggles playback.  `RESUME` resumes a paused player, but does not alter the queue mode.

To skip the remainder of the current song:

	SKIP

In attempting to respect licenses, skips are limited by some sources.  Pandora, for example, limits to 6 skips/station (playlist)/hour.  (The 12/day limit for free listeners, however, is unimplemented.)

The playback volume can be adjusted with `VOLUME`.  The natural decoding level is at level 0dB.  Positive numbers increase volume (and generally introduce distortion), negative numbers decrease the volume.  The range is ±100, but between -40 and 0 is practical.

To retrieve the volume level:

	VOLUME

To set the volume level:

	VOLUME LEVEL {#level}

To adjust the volume level:
	
	VOLUME <UP|DOWN> [{#change}]

_change_ defaults to 1.

Crossfading can be adjusted by:

	CROSSFADE DURATION [{seconds}]
	CROSSFADE LEVEL [{level}]

Leaving off the value retrieves current values.

### Manipulating the Mix (Shuffle/QuickMix)
`MIX` refers to mixing playlists.  The mix is composed of 1 or more playlists, with songs chosen at random among the playlists in the mix.  The MIX command displays and selects participating playlists:

	MIX LIST INCLUDED
	MIX LIST EXCLUDED

These commands output playlists in (not in) the mix.  The short forms `MIX`, `MIX LIST`, `MIX INCLUDED` and `MIX EXCLUDED` are accepted but their future behavior is not guaranteed.

To set or revise the playlists in the mix:

	MIX <SET | ADD | REMOVE | TOGGLE> {predicate}

### Choosing selection method
The queue is repopulated with a few random selections (usually 4) at a time when needed.  The active playlist (or the playlists encompassed for the metaplaylist MIX and EVERYTHING) always influences choices.  However, There are several manners available, set via:

	QUEUE RANDOMIZE BY <SONG | ALBUM | ARTIST | PLAYLIST | RANDOM>

These function as follows:

`SONG`
: Picks 4 songs at random.  If the active playlist is a metaplaylist, they are chosen from all its enabled playlists.  For the manager’s metaplaylists, 4 songs are queued *from each source*.

`ARTIST`
: If supported by the source, randomly chooses an applicable artist and queues 4 random songs.  If unsupported, behaves like `SONG`.

`ALBUM`
: If supported, choses an applicable album and queues the entire thing, in track order.  If unsupported, behaves like `ARTIST`.

`PLAYLIST`
: Always supported.  Picks 4 songs at random.  If the active playlist is a metaplaylist, the 4 songs will come from a single playlist.

`RANDOM`
: One of the aforementioned modes is chosen at random and used to fill the queue.

### Finding music
There are two ways to find music:

    FIND [manner] {predicate}

The format is similar to that of track information.  Results may include mixed types; an expression can use `TYPE={type}` in a filter expression to restrict returned types.  In the LIKE form, specifying a type indicates which field to search on, but does not restrict the returned type.  Results are suitable for seeding.  Other actions *may* be available, depending on the source the item originated from; the action field for each song indicates additional capabilities.

_manner_ is one of:

:SUGGESTION
Shallow search (default).  If an artist matches, omit individual albums and songs; if an album matches, exclude individual songs.

:ALL
Search exhaustively.  If an artist matches, include their albums and songs too.

:REQUEST
Search exhaustively, but only search sources that allow requests.

	SONG LIST {predicate}

Returns songs for request.  Other actions *may* be available, depending on the source the item originated from; the action field for songs will indicate additional capabilities.

	PLAYLIST SONG LIST {playlist predicate}

List all songs in a given playlist.

### Requests & Queue management
For sources which support requests:

	REQUEST {predicate}

For `NAME` and `ID` predicates, items are queued in the order listed.  The predicate searches for songs (as does SONG LIST); however, if `ID` predicates are used, they may specify an artist or album.  An album ID requests the album’s tracks in album order; an artist ID requests all albums in an unspecified order, but each albums’ tracks will be in album order.

Users rank can clear the request queue:

	REQUEST CLEAR

The random queue cannot be cleared.

To remove requests in either queue:

	REQUEST CANCEL {predicate}

Predicate applies to the songs in the queues.  Skip limiting applies, if applicable to the songs’ sources.

### Music Control: Ratings & Seeds
#### Ratings
To rate songs:

	RATE <SONG | PLAYLIST> {rating} {predicate}

`RATE` adjusts the song or playlists’s user preference.  Depending on these source, these are maintained by `pianod2` or adjusted by the source’s server.

_rating_ may be a rating adjective (see earlier) or a number in the range 0.5–5.0.  Values not supported by the source are rounded if it is sane to do so.

For songs, an additional rating of `OVERPLAYED` has source-specific effects.  For example, Pandora banishes the song for 30 days; local media reduces its play likelihood temporarily and prevents it being requested more than once per day.

If _predicate_ is not specified, the rating applies to the present track (even if paused) or playlist.

#### Seeds
Adding, removing and toggling seeds via a song is done via:

	SEED {verb} [{type}] [{seeds_predicate}] [TO PLAYLIST {playlist_predicate}]
  PLAYLIST MODIFY {playlist_predicate} {verb} SEED {verb} {seeds_predicate}

Where:

* _verb_ is `add`, `delete` or `toggle`
* _seeds_predicate_ specifies the songs, artists, albums or playlists to add or remove as seeds; if omitted, uses the current song.  Not all sources support all seed types.
* _playlist_predicate_ specifies playlists to apply the change to; if omitted, uses the current playlist/current track’s playlist (which must not conflict).

The two forms vary to allow both complex playlist and seed predicates.

##### Reviewing Seeds
To view seeds or feedback for a playlist:

	SEED LIST [PLAYLIST <ID | NAME | LIKE> {playlist}]

If the predicate is omitted, the selected playlist is used if it is not a metaplaylist.  This command returns a list of all seeds and, for some sources, ratings associated with the playlist.  The format is a subset of that used for track information, with the returned fields varying depending on whether an item is a rating, song seed, album seed, artist seed, or playlist seed.  Use the previously discussed `SEED DELETE` or `RATE NEUTRAL` commands to remove seeds or ratings.  

### Playlists
To create a new playlist:

	PLAYLIST CREATE [SMART] [NAME {name}] FROM {predicate}

The items selected by the predicate are added as the first seeds of the new playlist.  If omitted, the current song is used.  The default name varies; Pandora, for example, uses the song or artist name with " Radio" appended.  If creating a `SMART` playlist, the predicate is converted to an expression (if necessary) and embedded in the playlist.  The playlist  will include songs matched by the expression, although these are not considered seeds.  Additional seeds may be added to the playlist.  Removing seeds will not remove them from the playlist if they match the expression.  

    PLAYLIST CREATE NAME {name} WHERE {expression}

Creates a new smart playlist.  The expression becomes part of the playlist, which will include songs matched by the expression, although these are not considered seeds.  Additional seeds may be added to the playlist.  Removing seeds will not remove them from the playlist if they match the expression.

This is rather similar to `PLAYLIST CREATE SMART NAME {name} FROM ...` however, that version can accept any predicate type, provides a name if one is not given, and ensures there are matching results before creation.  This version is used heavily by unit test scripts.

Note similarity to `PLAYLIST CREATE NAME {name} FROM WHERE {expression}`, which will create a regular playlist with the matched items as starter seeds, rather than a smart playlist.

Renaming a playlist:

	RENAME PLAYLIST <ID | NAME | LIKE> {playlist} TO {new name}

Deleting a playlist:

	DELETE PLAYLIST <ID | NAME | LIKE> {playlist}

### Automatic Playlist Selection (Autotuning)
With autotuning, `pianod2` automatically selects QuickMix playlists based on who is listening.  There are 3 ways `pianod2` can assess who is listening:

Current authenticated users
: I.e., users *connected and authenticated* at present.  This can work well in environments where listeners stay connected, such as having a client open on their desktop during work.

A list of users set via the `AUTOTUNE` command
: This method is appropriate when users will not not stay connected.  For example, if listeners will be intermittently accessing `pianod2` via their mobile device.  In this scenario, a external helper program (such as [Proximity]) will update the listener list.

The superset of the two previous methods
: This method combines the previous two methods.

User sets their playlist preferences with the aforementioned `RATE` command.  Playlist preferences are persisted with user data; visitors can not create playlist preferences.  Existing users can be excluded from playlist calculations by revoking `influence` privilege.

Autotuning is enabled by:

	PLAY AUTO

`pianod2` tries the following successively, trying to find the best selection for the current listeners.  To do this, pianod:

1. Outright omits any playlists any current listener has rated 2 (bad) or less.
2. Calculates average ratings for the remaining playlists, considering preferences of the current users.
3. Omits any playlists with an average rating of less than 3 (neutral).
4.  Select for play all playlists within 1 star of the top rating.  If no playlists apply, be quiet.

In the future, step 4 may be adjusted to play from all remaining playlists, but bias selections proportionally to rating.

Pianod selections are made when autotuning is first enabled and subsequently when a user authenticates or disconnects.  Playlist selections can be adjusted manually but will be overwritten as listeners change unless autotuning is disabled.

If no users with `influence` are connected, `pianod2` will play all playlists.  If no users at all are connected, autotuning will pause between tracks.  Music will automatically resume when a users logs in.

Note that if you have some automated process that will start music via the `AS USER PLAY AUTO` command, it is best to `REVOKE INFLUENCE` that user.

[Proximity]: http://code.google.com/p/reduxcomputing-proximity/

#### Configuring Autotuning
The method of autotuning is selected by an administrator:

	AUTOTUNE MODE <LOGIN | FLAG | PROXIMITY | ALL | settings> …

`LOGIN` looks at users in a room.  `FLAG` look at a user attribute flag; see below.  `PROXIMITY` is for future use.  Multiple modes may be specified; `ALL` is a shorthand for `LOGIN FLAG PROXIMITY`.  If omitted, the mode is unchanged.  Regardless of the mode, a user *must* have `INFLUENCE` privilege to be considered.

Administrators or others with `tuner` privilege can select the users considered by `FLAG` mode:

	AUTOTUNE FOR ...
	AUTOTUNE CONSIDER <user> ...
	AUTOTUNE DISREGARD <user> ...

`FOR` specifies a user list; if empty, there are no listeners.  `CONSIDER` and `DISREGARD` add and remove users to/from the list.  This use effects all rooms.

	AUTOTUNE LIST USERS

Lists users currently considered by the autotuning algorithm.  That is, users who have influence privilege and are either or logged in or flagged present in accordance with the autotuning mode.

The following settings are available for autotuning:

`VETO {rating}`
: Rejects a playlist if any *individual* user rating is less than that specified.

`REJECT {rating}`
: Rejects a playlist if the *average* user rating is less than that specified.

`INCLUDE {rating}`
: Includes all playlists of the specified rating or better.

`QUANTITY GOAL {#count}`
: Sets a goal for number of playlists to include.  If this quantity is not met by playlists meeting the include rating, then additional playlists that are neither vetoed nor rejected will be added to make up the difference, subject to the quality margin.  Setting _count_ to 0 will disable this behavior.  The idea here is to set quality margins as high as possible, but be willing to sacrifice some in the name of variety.

`QUALITY MARGIN {#margin}`
: Quality margin is used to create a sort of dynamic rejection rating, which is equal to the best average playlist rating - the margin.  Used in concert with the quantity goal, this allows playlists below the include rating to be included for the sake of variety.

### User Maintenance
#### User Security Model
User abilities consist of a rank and privileges, and are indicated at connection, authentication, and whenever they subsequently change.  They can also be retrieved via the `GET PRIVILEGES` command.

There are 4 ranks of user: disabled, listener, standard, and administrator.  Each rank has all the abilities of the lower ranks plus the ones added for that rank.  The ranks have the following abilities:

disabled
: No permissions to anything.  However, events are still broadcast to the user.

listener (formerly guest)
: Can monitor playback, check the queue and history, and yell but not effect playback behavior in any way.  (However, a listener with influence privilege will influence autotuner picks.)

standard
: Adds control playback (play, pause, volume adjustment, playlist selection).

administrator
: Adds network parameter control, creating and adjusting users, etc.

In addition to the ranks, there are privileges; privileges are independent of each other and rank, except that disabled rank disables all privileges too.  The privileges are:

service
: The user can change the Pandora account.  All administrators gain this privilege too.

owner
: The user is the owner of the Pandora account, and can thus alter playlists, rate songs, etc.  Owner privilege is assigned when a Pandora account is selected, and cannot be altered via the usual `GRANT` and `REVOKE` commands.

influence
: When autotuning, the user's playlist ratings are considered if the user is logged in or flagged as present.

tuner
: The user can set the listeners considered by the autotuning algorithm when in `flag` or `all` mode.  All administrators have this privilege too.

By default, unauthenticated users ("visitors") have listener privileges, but this can be adjusted via `SET VISITOR RANK`.  Visitors have no privileges.

#### User Maintenance Commands
These administrator commands set the ranks and privileges of those using the server.

Creating users:

	CREATE <LISTENER|USER|ADMIN> {name} {password}

Resetting a password:

	SET USER PASSWORD {username} {password}

Viewing users:

	USERS LIST [{username}]
	USERS ONLINE
	USERS WITH <OWNER|SERVICE|INFLUENCE|TUNER|PRESENT>

Note that if social actions are enabled, `USERS ONLINE` is available to all users.  However, only administrators can view user privilege details.

Changing ranks and privileges:

	SET VISITOR RANK <DISABLED|LISTENER|USER|ADMIN>
	SET USER RANK {user} <DISABLED|LISTENER|USER|ADMIN>
	GRANT {privilege} TO {user} ...
	REVOKE {privilege} FROM {user} ...

Rank changes are effective immediately, with privilege change messages sent when necessary.
	
Removing a user account:

	DELETE USER {username}

Note you can not delete a user that is presently logged in.  However, you can:

	KICK [ALL|ROOM] USER < user > [{message}]
	KICK [ALL|ROOM] VISITORS [{message}]

These terminate all sessions for the user or all visitors, respectively.  However, since a misbehaving user is likely to reconnect, it may be more useful to set their rank to disabled.

When ROOM is specified, only sessions in the current room are terminated.  If ALL is specified, or by default, termination applies to all rooms.

##### Shadowing

If enabled, pianod user accounts are created on-demand for system user users, initially using their system password.  If a shadowed user changes their password within pianod, it applies only to pianod and their system password is unchanged.

Password shadowing may be restored:

	SET SHADOW PASSWORD {pianod} {system}

Shadow users by default are disabled and have no privileges.  To set some other set of privileges, choose an existing user or create a template user:

	SET SHADOW USER NAME {username}

If username is empty, it dissociates the template user.  You can check the current template:

	GET SHADOW USER NAME

### Waiting for asynchronous events
To wait for a new source to be ready, include the `WAIT` option in the new source parameters.

To wait for a song to complete, use:

	WAIT FOR END OF [CURRENT] SONG [{options}]

If `CURRENT` is specified, a song must be playing or it is an error.  Without `CURRENT`, the command applies to the current song, or the next song if nothing is playing.

To wait for the next song to play:

	WAIT FOR NEXT SONG [{options}]

This can be used even if the play is paused or stopped.

To wait for sources to become ready:

	WAIT FOR SOURCE ALL [PENDING] READY [{options}]
	WAIT FOR SOURCE ANY [PENDING] READY [{options}]
	WAIT FOR SOURCE ID {id} READY [{options}]
	WAIT FOR SOURCE TYPE {type} NAME {name} READY [{options}]

If `PENDING` is used, there must be sources currently initializing or it is an error.  (See also the `WAIT` source option.)

Options are:

TIMEOUT {#seconds}
: Fail if the event does not happen within the specified time.

### Miscellaneous Controls
Comment always succeeds:

	# Some text here

Note there must be a space after the hash, so:

	#This is an error.

Administrators can set the number of songs that are retained by the history:

	SET HISTORY LENGTH {number}

Note that `pianod2` keeps a lot of metadata (like playlist seeds) around for these songs.  Although the data is cached several hours, keeping history to a sane length is a good idea.

To broadcast a message to other sessions:

	YELL {something}

There is no way to do a directed messages; it's a music server, not an IM client!  Available to all ranks except disabled.

This administrator setting enables or disables this social behavior; default is on:

	ANNOUNCE USER ACTIONS <ON|OFF>

When on, `pianod2` shares significant events and user actions by broadcasting a message and identifying who originated them.  This setting also controls the `USERS ONLINE` command availability.


Administrators can set which messages are logged to standard out:

	SET [FOOTBALL] LOGGING FLAGS {value}

In increasing order of detail: 0x1000 (aforementioned user actions & errors), 0xfef8, 0xfefc, 0xfefe, and 0xffff (everything) are useful.  See `logging.h` for specific flags.  Note, however, that 0x1000 creates security concerns as it will log user passwords.

User rank and privileges can be retrieved by a session:

	GET PRIVILEGES

This administrator command flushes dirty buffers, including user data and source data:

	SYNC

This is mostly for test, but can be used if pianod refuses to shutdown gracefully.  Under normal operation, data is periodically written by pianod; more important changes promote faster writes.

Administrators can shutdown the server:

	SHUTDOWN

Following shutdown, each room is removed as its playback completes, with shutdown proceeding when the last room has been dissolved.  To stop immediately, use `STOP NOW` to abort playback.  Signals are also viable shutdown mechanisms; `pianod2` recognizes SIGHUP, SIGTERM, and SIGINT as requests to shutdown immediately but gracefully.  SIGKILL (-9) will kill `pianod2` without shutdown; recent user changes, preferences and ratings may be lost.

