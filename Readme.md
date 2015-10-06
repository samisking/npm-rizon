# Rizon

Rizon helps you get golden hour information from the command line. You can see dates in the future, or list out all relevant times for a location.

## Install

```bash
$ npm install -g rizon
```

### Options

```
-a, --all-times  Show all sun related times
-d, --date       Must be in ISO 8601 format e.g. 2016-12-22
-h, --help       Show help
```

## Usage Examples

#### Next golden hour

```bash
$ rizon boston
```

Will output:

```
Boston
----------------------------
Tuesday, October 6th 2015
Current Time: 04:28

Next Golden Hour
Starts: 06:19
Ends: 07:25
```

#### All times

```bash
$ rizon -a boston
```

Will output:

```
Boston
----------------------------
Tuesday, October 6th 2015
Current Time: 04:29

Segment         Start  End
--------------  -----  -----
AM Twilight     06:19  06:47
Sunrise         06:47  06:50
AM Golden Hour  06:47  07:25
Solar Noon      12:33
PM Golden Hour  17:42  18:16
Sunset          18:16  18:19
PM Twilight     18:19  18:47
Nadir           00:33
```

#### For a future date

**Note:** Dates must be in [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) formats.

```bash
$ rizon -a -d 2016-12-22 boston
```

Will output:

```
Boston
----------------------------
Thursday, December 22nd 2016
Current Time: 04:31

Segment         Start  End
--------------  -----  -----
AM Twilight     06:40  07:12
Sunrise         07:12  07:15
AM Golden Hour  07:12  07:57
Solar Noon      11:44
PM Golden Hour  15:31  16:13
Sunset          16:13  16:16
PM Twilight     16:16  16:48
Nadir           23:44
```

## Notes

This is still very much a work in progress. The source code is pretty messy. This will eventually be turned into a Slack Bot.
