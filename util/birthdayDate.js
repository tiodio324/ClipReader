export function parseDateString(dateString) {
    if (!dateString || dateString.trim() === '') return null;

    const parts = dateString.split('.');

    if (parts.length !== 3) return new Date('invalid');

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return new Date('invalid');

    return new Date(year, month, day);
}

export function formatDateToString(date) {
    if (!date) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

export function ensureDateFormat(dateValue) {
    if (!dateValue || dateValue.trim() === '') return '';

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
        return dateValue;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const parts = dateValue.split('-');
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    if (dateValue instanceof Date && !isNaN(dateValue)) {
        return formatDateToString(dateValue);
    }

    try {
        const dateObj = new Date(dateValue);
        if (!isNaN(dateObj.getTime())) {
            return formatDateToString(dateObj);
        }
    } catch (e) {
        console.error('Error parsing date:', e);
    }

    return dateValue;
}