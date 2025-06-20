function getTimeFromSeconds(totalSeconds) {
    if (totalSeconds < 86400) {
        var dt = new Date("01/01/2000 0:00");
        dt.setSeconds(totalSeconds);
        return formatTime(dt);
    } else {
        return null;
    }
}
 
function formatTime(dt) {
    var h = dt.getHours(),
        m = dt.getMinutes(),
        s = dt.getSeconds(),
        r = "";
    if (h > 0) {
        r += (h > 9 ? h.toString() : "0" + h.toString()) + ":";
    }
    r += (m > 9 ? m.toString() : "0" + m.toString()) + ":"
    r += (s > 9 ? s.toString() : "0" + s.toString());
    return r;
}