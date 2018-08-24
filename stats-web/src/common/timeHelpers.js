export const calculateTimeScale = (day) => {
    let timeFromShow = new Date();
    timeFromShow.setHours(0);
    timeFromShow.setMinutes(0);
    timeFromShow.setSeconds(0);
    let timeToShow = new Date(day),
        timeScale,
        diffDays = Math.ceil((timeFromShow - timeToShow) / (1000 * 3600 * 24));
    if (diffDays <= 1) timeScale = '0';
    else if (diffDays <= 3) timeScale = '1';
    else if (diffDays <= 7) timeScale = '2';
    else if (diffDays > 7) timeScale = '2';
    return timeScale;
};