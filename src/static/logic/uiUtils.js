const iso8601dateToInputValue = function (isoD8601Date) {
    // input is string of type "YYYY-MM-DDTHH:mm:ss.SSSZ" ie. 1989-01-24T04:35:39.348Z
    // returns "YYYY-MM-DD"
    let date = new Date(isoD8601Date);
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    // as month on date objects are zero indexed, we need to add 1
    month += 1;
    // if month and day are single digit, we need to add leading 0
    const monthString = month.toString().padStart(2, '0');
    const dayString = day.toString().padStart(2, '0');
    return `${year}-${monthString}-${dayString}`;
};
export {};
