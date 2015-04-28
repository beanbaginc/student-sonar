import createEventDay from './x-event-day';
import createEventList from './x-event-list';
import createStudentCard from './x-student-card';
import createStudentView from './x-student-view';
import createSummaryEntry from './x-summary-entry';

export default function() {
    createEventDay();
    createEventList();
    createStudentCard();
    createStudentView();
    createSummaryEntry();
}
