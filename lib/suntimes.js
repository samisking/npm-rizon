var exports = module.exports = {};

var moment = require('moment-timezone');
var formatStr = 'HH:mm';

var SunCalc = require('suncalc');
var suntimes = null;


exports.allTimes = function (date, locationObj) {
    var suntimes = SunCalc.getTimes(date, locationObj.lat, locationObj.lng);
    var timezone = locationObj.timezone;
    var currentDate = moment(date).tz(timezone);

    allTimes = {
        solarNoon: moment(suntimes.solarNoon).tz(timezone),
        nadir: moment(suntimes.nadir).tz(timezone),
        sunrise: moment(suntimes.sunrise).tz(timezone),
        sunset: moment(suntimes.sunset).tz(timezone),
        sunriseEnd: moment(suntimes.sunriseEnd).tz(timezone),
        sunsetStart: moment(suntimes.sunsetStart).tz(timezone),
        dawn: moment(suntimes.dawn).tz(timezone),
        dusk: moment(suntimes.dusk).tz(timezone),
        goldenHourEnd: moment(suntimes.goldenHourEnd).tz(timezone),
        goldenHour: moment(suntimes.goldenHour).tz(timezone)
    }

    return allTimes;
}



exports.nextGoldenHour = function (date, locationObj) {
    var suntimes = SunCalc.getTimes(date, locationObj.lat, locationObj.lng);
    var timezone = locationObj.timezone;
    var currentDate = moment(date).tz(timezone);

    var dawn            = moment(suntimes.dawn).tz(timezone),
        goldenHourEnd   = moment(suntimes.goldenHourEnd).tz(timezone),
        goldenHour      = moment(suntimes.goldenHour).tz(timezone),
        dusk            = moment(suntimes.dusk).tz(timezone);

    var tomorrow = date.add(1, 'd');
    var tomorrowSunTimes = SunCalc.getTimes(tomorrow, locationObj.lat, locationObj.lng);
    var tomorrowDawn = moment(tomorrowSunTimes.dawn).tz(timezone),
        tomorrowGoldenHourEnd = moment(tomorrowSunTimes.goldenHourEnd).tz(timezone);

    // Return the correct message based on time
    if (currentDate < dawn) {
        // If it's before AM Golden Hour
        return nextGoldenHourMessage(dawn.format(formatStr), goldenHourEnd.format(formatStr));;
    } else if (currentDate > dawn && currentDate < goldenHourEnd) {
        // If it's currently in a Golden Hour
        return currentlyInGoldenHourMessage(dawn.format(formatStr), goldenHourEnd.format(formatStr));
    } else if (currentDate > goldenHourEnd && currentDate < goldenHour) {
        // If it's after AM Golden Hour, but before PM Golden Hour
        return nextGoldenHourMessage(goldenHour.format(formatStr), dusk.format(formatStr));
    } else if (currentDate > goldenHour && currentDate < dusk) {
        // If it's currently in a Golden Hour
        return currentlyInGoldenHourMessage(goldenHour.format(formatStr), dusk.format(formatStr));
    } else if (currentDate > dusk) {
        // If it's after PM Golden Hour
        // Get tomorrow's Golden Hour
        return tomorrowGoldenHourMessage(tomorrowDawn.format(formatStr), tomorrowGoldenHourEnd.format(formatStr));
    }
}


function nextGoldenHourMessage(start, end) {
    return "Next Golden Hour\nStarts: "+start+"\nEnds: "+end;
}

function currentlyInGoldenHourMessage(start, end) {
    return "It's currently Golden Hour.\nStarted: "+start+"\nEnds: "+end;
}

function tomorrowGoldenHourMessage(start, end) {
    return "Next Golden Hour\nStarts Tomorrow: "+start+"\nEnds: "+end;
}
