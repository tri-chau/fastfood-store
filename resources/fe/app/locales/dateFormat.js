import { format } from 'date-fns';

export function formatDateTime(dateString) {
    const date = new Date(dateString);
    return format(date, 'HH:ii:ss dd/MM/y');
}
export function formatDate(dateString) {
    const date = new Date(dateString);
    return format(date, 'dd/MM/y');
}
