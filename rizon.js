#!/usr/bin/env node

// Dependencies
var moment = require('moment-timezone');
var sqlite3 = require('sqlite3').verbose();
var Table = require('easy-table');
var colors = require('colors');
var suntimes = require('./lib/suntimes');
var argv = require('yargs')
    .usage('Usage: rizon [options] [location name]')
    .example('rizon boston', 'shows the next golden hour in boston local time')
    .example('rizon -a boston', 'shows all sun times for boston in local time')
    .example('rizon -a -d 2016-12-22 boston', 'shows all sun times for boston on Dec 22nd, 2016')
    .option('a', {
        alias: 'all-times',
        demand: false,
        default: false,
        describe: 'Show all sun related times',
        type: 'boolean'
    })
    .option('d', {
        alias: 'date',
        describe: 'Must be in ISO 8601 format e.g. 2016-12-22',
        type: 'string'
    })
    .help('h')
    .alias('h', 'help')
    .epilog('http://rizonapp.co')
    .argv;


// Get the args from the command line
var allTimesBool = argv.a,
    dateArg = argv.d,
    locationArg = argv._,
    locationName = locationArg.join(' ');


// Time and Date vars
var now = moment(),
    timeNow = now.format('HH:mm:ss');


// Load the cities database
var db = new sqlite3.Database('./data/cities.db');


// Run this shit
locationLookup(locationName, onLocationLookup);


/**
 * [locationLookup description]
 * @param  {string}   location A string to lookup a location in the database
 * @param  {Function} callback Callback for when the location is found or not
 */
function locationLookup (location, callback) {
    // If the user passed a location
    if (location.length > 0) {
        db.all("SELECT * FROM geoname WHERE name LIKE '%"+location+"%' ORDER BY population DESC", function (err, rows) {

            if (err) {
                callback(err);
                return;
            }

            callback(rows);
            return;
        });
    } else {
        console.log("\nYou need to enter a location. Type `rizon -h` for help.");
    }
}


/**
 * Called on successful location lookup.
 * Gets the first result and builds an object with the relevant information
 * @param  {array} rows Rows of results from the database lookup
 */
function onLocationLookup (data) {
    // If we get 1 result or more
    if (data.length > 0) {
        // Get the first result from the database
        var result = data[0];

        // Build a location object from the result
        locationObj = {
            name: result.name,
            country: result.country,
            lat: result.latitude,
            lng: result.longitude,
            timezone: result.timezone
        }

        // Now output the relevant thing
        outputTimes(locationObj);
    } else {
        console.log("\nSorry, no locations found that match", locationName);
    }
}


/**
 * Outputs times based on user input.
 * Shows the next golden hour by default, unless the -a option is passed,
 * otherwise it outputs a table of all the times
 * @param  {object} locationObj
 */
function outputTimes (locationObj) {
    var chosenDate = getDate();
    var convertedTime = chosenDate.clone().tz(locationObj.timezone);

    // Output some info about the date
    console.log('\n'+locationObj.name);
    console.log('----------------------------');
    console.log(convertedTime.format('dddd, MMMM Do YYYY'));
    console.log('Current Time:', convertedTime.format('HH:mm'));

    // If all times should be output
    if (allTimesBool) {
        // Build a list of all the times
        var allTimes = suntimes.allTimes(convertedTime, locationObj);
        var timeList = buildTimeList(allTimes, locationObj.timezone);

        // Turn that list into a new table
        var t = new Table
        timeList.forEach(function(time) {
            t.cell('Segment', time.name)
            t.cell('Start', time.start)
            t.cell('End', time.end)
            t.newRow()
        });

        // Output the table
        console.log('\n'+t.toString());
    }
    // Else output the next golden hour
    else {
        // Get a message for when the next golden hour happens
        var nextGoldenHour = suntimes.nextGoldenHour(convertedTime, locationObj);

        // Output the message
        console.log('\n'+nextGoldenHour);
    }
}


/**
 * Builds an array of all times
 * @param  {object} times    A object of times to format (comes from SunCalc)
 * @param  {string} timezone Timezone description e.g. 'America/New_York'
 * @return {array}
 */
function buildTimeList (times, timezone) {
    var timeList = [
        {name:'AM Twilight', start: formatTime(times.dawn, timezone), end: formatTime(times.sunrise, timezone)},
        {name:'Sunrise', start: formatTime(times.sunrise, timezone), end: formatTime(times.sunriseEnd, timezone)},
        {name:'AM Golden Hour', start: formatTime(times.sunrise, timezone), end: formatTime(times.goldenHourEnd, timezone)},
        {name:'Solar Noon', start: formatTime(times.solarNoon, timezone), end: ''},
        {name:'PM Golden Hour', start: formatTime(times.goldenHour, timezone), end: formatTime(times.sunsetStart, timezone)},
        {name:'Sunset', start: formatTime(times.sunsetStart, timezone), end: formatTime(times.sunset, timezone)},
        {name:'PM Twilight', start: formatTime(times.sunset, timezone), end: formatTime(times.dusk, timezone)},
        {name:'Nadir', start: formatTime(times.nadir, timezone), end: ''}
    ];

    return timeList;
}


/**
 * Formats a date object and converts it into local time
 * @param  {date}   time
 * @param  {string} timezone Timezone description e.g. 'America/New_York'
 * @return {string}          Time formatted as a string
 */
function formatTime (time, timezone) {
    return moment(time).tz(timezone).format('HH:mm');
}


/**
 * Gets the correct date from the cli options
 * @return {date} Moment date object
 */
function getDate () {
    if (dateArg && moment(dateArg).isValid()) {
        var futureDate = dateArg+' '+timeNow;
        return moment(futureDate);
    } else {
        return now;
    }
}
