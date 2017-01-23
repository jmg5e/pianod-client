pianod Commands
---------------
Commands are not case sensitive.  Quoting may be done with double quotes.  Starting and ending quotes must respectively lead a word and trail words.

### Logging in
To authenticate with `pianod`, issue:

	USER {username} {password}

When the session is complete:

	QUIT

When scripting pianod, A single command can be issued via:

	AS USER {user} {password} {command}

This authenticates as the specified user, executes the command, and closes the connection.  The `AS USER` form does not broadcast user login/logout or affect autotuning.  This is intended to ease implementation of simpler clients that do not hold connections open.

A freshly installed `pianod` system, there is a single user 'admin' with
password 'admin'.

After authenticating, a user can change their password:

	SET PASSWORD {old} {new}

### Pandora Account
Administrators and those with `service` privilege can change the Pandora account:

	[REMEMBER] PANDORA USER {username} {password} [manager]

Where _manager_ indicates who is granted management of the Pandora account, thereby having ability to alter stations, rate songs, etc.

*Unspecified*
: All `pianod` administrators can manage the station.

MINE
: Only the user issuing the command can manage the station.

UNOWNED
: There is no owner; nobody can change the station.

[MANAGED|OWNED] BY {user}
: The specified `pianod` user owns the station.
This form is deprecated, and is not supported with `REMEMBER`.

If told to remember the credentials, they are persisted with other user
data.  The password is enciphered to prevent casual reading.  Remembered
credentials can be selected by any administrator or user with service privilege:

	PANDORA USE {username}

The persisted credentials includes management information.

The list of users with remembered credentials can be retreived via:

	PANDORA LIST USERS

### Help
Help is displayed based on user rank and privileges; listeners will see only listener-only commands; administrators will see the full list.  Specifying a command lists those commands only.

	HELP [{command}]

### Status commands
Status commands are available to all users.

The "null" command is done by sending an empty line.  This reports the status of playback and the playhead position within the current song, if applicable.

Other status commands are:

	STATUS

Status indicates the current song, if there is one.  It also causes player status and selected station to be announced (though these are outside the data response).

	HISTORY [{index}]
	QUEUE [{index}]

`HISTORY` returns a list of items previously played, up to the history size limit, or the specific history item if an index is specified.

`QUEUE` does the same for upcoming songs.  The queue/playlist replenishes periodically when it it has become empty.  The queue may contain songs which are never played if their station is no longer applicable when they reach the front of the queue; in this case, they simply disappear.

Both `HISTORY` and `QUEUE` allow an index to be specified.  If 0, the current song is returned.  For negative indices, `HISTORY` refers to upcoming tracks and `QUEUE` to played tracks.

### Station Selection
Station lists are available to all users:

	STATIONS LIST

The short form `stations` is also accepted, but future behavior is not guaranteed.

Station selection is available to standard and administrative users.  A station may be selected by:

	SELECT <MIX | STATION {station name}
	PLAY [MIX | STATION {station name}]

`SELECT` will choose a station but not alter the play state (if paused or stopped, it will remain paused).  `PLAY` chooses a station and starts the player, but does not flush any existing track in progress.  It is best thought of as a `SELECT` followed by `PLAY`, the `PLAY` being a unrelated to the station selection and only a function for playback control.

	STOP [NOW]

`STOP` directs the player to stop playing after the current track (like `SELECT` chooses a station but defers starting playback, `STOP` cancels the station but defers stopping).  `STOP NOW` cancels playback as well; it is almost equivalent to `STOP` followed by `SKIP` except the skip-limit check is skipped/the skip is not counted.  Once stopped, the `PLAY` command will fail unless a new station is chosen. 


### Playback control
Playback control is available to standard and administrative ranks.  These commands include:

	PLAY
	PAUSE
	PLAYPAUSE

`PLAYPAUSE` toggles between play and paused states.  PLAY, PAUSE, and PLAYPAUSE take effect immediately.

To skip the remainder of the current song, use `SKIP`:

	SKIP

In attempting to respect Pandora license stuff, skips are limited to 6/hour.  (The 12/day limit for free listeners, however, is unimplemented.)

The playback volume can be adjusted with `VOLUME`.  The natural decoding level is at level 0.  Positive numbers increase volume (and generally introduce distortion), negative volumes decrease the volume.

	VOLUME [{level}]

Without a level, `VOLUME` returns the current volume level.

### Manipulating the Mix (Shuffle/QuickMix)
`MIX` refers to the Pandora shuffle (formerly QuickMix) station.  The mix is composed of a list of 1 or more of the rest of the other stations, with playlists from songs at random among them.  The MIX command displays and selects participating stations:

	MIX LIST INCLUDED
	MIX LIST EXCLUDED

These commands output stations in (not in) the mix.  The short forms `MIX` and `MIX LIST` are synonymous with `MIX LIST INCLUDED`, but their future behavior is not guaranteed.

	MIX SET {station} ...
	MIX ADD {station} ...
	MIX REMOVE {station} ...
	MIX TOGGLE {station} ...

`MIX SET` sets the mix-participating stations to the list specified.  The rest alter the existing set of mix participants.

### Feedback & Seed Control
#### Alteration via played songs
To rate songs:

	RATE <GOOD|NEUTRAL|BAD|OVERPLAYED> [{track id}]

`RATE` adjusts the song's user preference settings on the server.  `GOOD` and `BAD` correspond to the Pandora thumbs-up and thumbs-down mechanism.  `NEUTRAL` removes a previous rating for a track.  `OVERPLAYED` banishes the song for 30 days.

If _track id_ is not specified, the rating applies to the present track (even if paused).

It is worth noting that `OVERPLAYED` applies to a song, wereas `GOOD` and `BAD` applies to the relationship of song and station..

Adding and femoving seeds via a song is done via:

	ADD <SONG | ARTIST> SEED [TO {station name}] FROM SONG [trackid]
	DELETE <SONG | ARTIST> SEED {track id}
	
These add or deletes a song or artist ID for the specified track, which may be in the playlist, history, or the current track.  If a _track id_ is not specified, the action applies to the current track.

If a station is not specified for this ADD command, the seed is added to the station on which the track played.

#### Direct manipulation
To remove seeds or feedback for a station:

	STATION SEEDS [{station name}]

Station name *should* be specified.  If it is ambiguous (the current track's station is not the selected station) it will balk.  This command returns a list of all seeds and ratings for the station (making `SEEDS` a bit of a misnomer), each with a unique ID.  The format is a subset of that used for track information, with the returned fields varying depending on whether an item is a rating, song seed, artist seed, or station seed.  To delete a seed or rating, use:

	DELETE SEED {seed id}

Where the seed id is from the `STATION SEEDS` output.

Similarly, adding steps is a two-step process:

	FIND <ANY|ARTIST|SONG|GENRE> [{search-text}]

If _search-text_ is omitted, the previous search results are used and results are taken from cache.  Like the station seed info, the format is similar to that of track information, with included fields varying by match type when `ANY` is used.  To add a seed:

	ADD SEED FROM SUGGESTION <seed id> [TO {station-name}]

The station-name *should* be specified, as per note at `STATION SEEDS`.

### Stations
To create a new station from the current song, one previously played, or in the playlist:

	CREATE STATION [NAMED {name}] FROM <SONG|ARTIST> [{song id}]

The new station has the song added as a lone song or artist seed.  If song id is omitted, the current one is used.  The default station name is the song or artist name with " Radio" appended.

To create a new station of your choice, first issue a `FIND` (see adding seeds above), then:

	CREATE STATION [NAMED {name}] FROM SUGGESTION {suggestion-id}

Renaming a station:

	RENAME STATION {from-name} TO {to-name}.

Deleting a station:

	DELETE STATION {station-name}

### Automatic Station Selection (Autotuning)
With autotuning, `pianod` automatically selects QuickMix stations based on who is listening.  There are 3 ways `pianod` can assess who is listening:

Current authenticated users
: I.e., users *connected and authenticated* at present.  This can work well in environments where listeners stay connected, such as having a client open on their desktop during work.

A list of users set via the `AUTOTUNE` command
: This method is appropriate when users will not not stay connected.  For example, if listeners will be intermittently accessing pianod via their mobile device.  In this scenario, a external helper program (such as [Proximity]) will update the listener list.

[Proximity]: http://code.google.com/p/reduxcomputing-proximity/

The superset of the two previous methods
: This method combines the previous two methods.

Each user sets their station preferences by rating stations:

	RATE STATION <GOOD | BAD | NEUTRAL> [{station name}]

These preferences are persisted in the userdata file; visitors can not create station preferences.  Existing users can be excluded from station calculations by revoking `influence` privilege.

Autotuning is enabled by:

	PLAY AUTO

`pianod` tries the following successively, trying to find the best selection for the current listeners:

1. Use stations the current listeners all like.
2. Use stations some of the current listeners like, and the others can tolerate.
3. User stations all the current listners can tolerate.
4. Since every station is hated by at least one listener, give up and be quiet.

Pianod sets the requested stations in the QuickMix when autotuning is first enabled and subsequently each time a user authenticates or disconnects.  The QuickMix stations can be adjusted manually, but these will be overwritten as listeners change.

If no users with `influence` are connected, `pianod` will play all stations.  If no users at all are connected, autotuning will pause between tracks.  Music will automatically resume when users reauthenticate.

Note that if you have some automated process that will start music via the `AS USER PLAY AUTO` command, it is best to `REVOKE INFLUENCE` that user.

#### Configuring Autotuning
The method of autotuning is selected by an administrator:

	AUTOTUNE MODE <LOGIN | FLAG | ALL >

In `FLAG` or `ALL` mode, administrators or others with `tuner` privilege can select the users currently listening:

	AUTOTUNE FOR ...
	AUTOTUNE CONSIDER <user> ...
	AUTOTUNE DISREGARD <user> ...

`FOR` specifies a user list; if empty, there are no listeners.  `CONSIDER` and `DISREGARD` add and remove users to/from the list.

	AUTOTUNE LIST USERS

Lists users currently considered by the autotuning algorithm.  That is, users who have influence privilege and are either or logged in or flagged present in accordance with the autotuning mode.

### User Maintenance
#### User Security Model
User abilities consist of a rank and privileges, and are indicated at connection, authentication, and whenever they subsequently change.  They can also be retrieved via the `GET PRIVILEGES` command.

There are 4 ranks of user: disabled, listener, standard, and administrator.  Each rank has all the abilities of the lower ranks plus the ones added for that rank.  The ranks have the following abilities:

disabled
: No permissions to anything.  However, events are still broadcast to the user.

listener (formerly guest)
: Can monitor playback, check the queue and history, and yell but not effect playback behavior in any way.  (However, a listener with influence privilege will influence autotuner picks.)

standard
: Adds control playback (play, pause, volume adjustment, station selection).

administrator
: Adds network parameter control, creating and adjusting users, etc.

In addition to the ranks, there are privileges; privileges are independent of eachother and rank, except that disabled rank disables all privileges too.  The privileges are:

service
: The user can change the Pandora account.  All administrators gain this privilege too.

owner
: The user is the owner of the Pandora account, and can thus alter stations, rate songs, etc.  Owner privilege is assigned when a Pandora account is selected, and cannot be altered via the usual `GRANT` and `REVOKE` commands.

influence
: When autotuning, the user's station ratings are considered if the user is logged in or flagged as present.

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

In earlier versions of pianod, rank changes took effect on next login.  They now take place immediately, and the requisite privilege change messages are sent when necessary.
	
Removing a user account:

	DELETE USER {username}

Note you can not delete a user that is presently logged in.  However, you can:

	KICK USER < user > [{message}]
	KICK VISITORS [{message}]

These terminate all sessions for the user or all visitors, respectively.  However, since a misbehaving user is likely to reconnect, it may be more useful to set their rank to disabled.

### Network Parameters
`pianod` starts with sane connection defaults.  Administrators can change the connection parameters, typically in a *startscript*, but they can also be set on the fly.

	SET TLS FINGERPRINT {40-digit hex number}
	SET RPC HOST {host}
	SET PANDORA DEVICE {device}
	SET ENCRYPTION PASSWORD {password}
	SET DECRYPTION PASSWORD {password}
	SET PARTNER {user} {password}

All fields require values.

	SET RPC TLS PORT [{port}]

Sets the RPC port.  If `port` is unspecified, clears the assigned port.

	SET PROXY http://{proxy}
	SET CONTROL PROXY http://{proxy}

Proxies are used for listeners outside the USA, who will need to set up a proxy server such as [The Onion Router (tor)] to make traffic appear as if it originates in the States.

There are corresponding `GET` commands.

[The Onion Router (tor)]: https://www.torproject.org/ 

### Audio Control
To set the audio quality:

	SET AUDIO QUALITY <HIGH|MEDIUM|LOW>

Higher quality typically uses more bandwidth.

`pianod` starts with audio output parameters unset; this results in sane behavior.  If you want to change these, use:

	SET AUDIO OUTPUT DRIVER [{driver}]
	SET AUDIO OUTPUT DEVICE [{device}]
	SET AUDIO OUTPUT ID [{#id}]
	SET AUDIO OUTPUT SERVER [{server}]

Leaving the parameter off unsets the corresponding output parameter.
For more information on options, see the [libao Drivers] documentation.

There are also corresponding `GET` commands.

[libao drivers]: http://www.xiph.org/ao/doc/drivers.html

### Waiting for asynchronous events
If the network is down, pianod defers Pandora credential changes and retries
periodically.  To wait for this to complete before further processing (for
example, from your startscript) use:

	WAIT FOR AUTHENTICATION

This command fails if there is no pending authentication, and also abandons
waiting if the authentication fails.

To wait for the current song to complete, use:

	WAIT FOR END OF SONG

A song must be playing.

To wait for the next song to play:

	WAIT FOR NEXT SONG

This can be used even if the play is paused or stopped.

### Miscellaneous Controls
Other commands include:

	SET HISTORY LENGTH {number}

Sets the number of songs that are retained in the history.  Note that `pianod` keeps a lot of metadata (like station seeds) around for these songs.  Although the data is cached several hours, keeping history to a sane length (5–10) is probably a good idea.

	YELL {something}

Broadcasts a message to other terminals connected to the server.  (There is no way to do a directed messages; it's a music server, not an IM client!)  Available to all ranks except disabled.

	ANNOUNCE USER ACTIONS <ON|OFF>

`pianod` can share significant events and user actions by broadcasting a message and identifying who originated them.  This administrator setting enables or disables this social behavior.  Default is on.  This setting also controls the `USERS ONLINE` command availability.

	SET LOGGING FLAGS {value}

This administrator setting controls which messages are logged to standard out.  In increasing order of detail: 0x1000 (aforementioned user actions & errors), 0xfef8, 0xfefc, 0xfefe, and 0xffff (everything) are useful.  See `logging.h` for specific flags.  Note, however, that 0x1000 creates security concerns as it will log user passwords.

	SET PAUSE TIMEOUT {#seconds}

The amount of time a track is paused before track playback is automatically cancelled.  When this occurs, the station is retained and playback will resume with the next appropriate track in the queue.

	SET PLAYLIST TIMEOUT {#seconds}

The time to live for a playlist.  If the duration is exceeded (playback is or was paused or stopped for a while), the queue is cleared and a new playlist is retrieved when needed.  Playing or paused tracks will finish playback (unless a pause timeout also occurs).

	GET PRIVILEGES

Available to all ranks, this indicates the user rank and privileges.

	SHUTDOWN

This administrator command shuts down pianod after the current song.  To stop immediately, use `STOP NOW` to abort playback.  Signals are also viable shutdown mechanisms; pianod recognizes SIGHUP, SIGTERM, and SIGINT as requests to shutdown immediately but gracefully.  SIGKILL (-9) will kill `pianod` without shutdown; recent user changes may be lost.

