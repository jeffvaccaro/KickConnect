// dateHelper.js

function getDatesOfCurrentWeek() {
    const today = new Date();

    function getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.setDate(diff));
    }

    const monday = getStartOfWeek(new Date(today));
    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);
    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);
    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    function formatDate(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    return {
        monday: formatDate(monday),
        tuesday: formatDate(tuesday),
        wednesday: formatDate(wednesday),
        thursday: formatDate(thursday),
        friday: formatDate(friday),
        saturday: formatDate(saturday),
        sunday: formatDate(sunday)
    };
}

module.exports = { getDatesOfCurrentWeek };
