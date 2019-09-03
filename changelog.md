# Changelog


## 0.9.2 - 2019-8-30
This is the version I started doing changelogs on. Previous changelogs may not be available.
### Added
* New command: `changelog`. This will send you the latest changelog entry.
* General Message Logging - All servers who previously had `logMessages` enabled now have `logMessageChanges` and `logMessages` enabled. (Read more below)
### Changed
* Feedback now works, and is enabled.
* `logMessages` now logs all send messages, instead of logging edits and deletions.
* `logMessageChanges` now does what `logMessages` previously did. (log edits and deletions)


## 0.9.1
### Added
* New command: `dump`. This allows you to request server logs; Melody will DM you the file(s). If you own only one guild that Melody is in, Melody will send you the logs for that server. Otherwise, you'll need to specify a server.
### Changed
* Big changes to how the bot is run - Bot should now restart automatically if there are any errors with the Discord API causing the bot to shut down. If the Bot runs into an error, it will crash and stay crashed. If you see Melody offline, please tell me!
* Split `destroy` into `stop` and `restart`. Trusted users have access to `restart`.