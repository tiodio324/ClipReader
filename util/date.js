export function getFormattedDate(date) {
    return (
        date.toISOString().slice(0, 10)
    );
}