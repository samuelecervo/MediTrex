$(document).ready(function () {
	const $sidebarToggle = $('#sidebarToggle');
	if ($sidebarToggle.length) {
		$sidebarToggle.click(function (event) {
			event.preventDefault();
			$('body').removeClass('sb-sidenav-toggled');
			localStorage.setItem('sb|sidebar-toggle', $('body').hasClass('sb-sidenav-toggled'));
		});
	}
});

let events = [];

let eventDateInput = $("#eventDate");
let eventTitleInput = $("#eventTitle");
let eventTimeInput = $("#eventTimeInput");
let eventDescriptionInput = $("#eventDescription");
let reminderList = $("#reminderList");

let eventIdCounter = 1;

function addEvent() {
	let date = eventDateInput.value;
	let title = eventTitleInput.value;
	let time = eventTimeInput.value;
	let description = eventDescriptionInput.value;

	if (date && title) {
		let eventId = eventIdCounter++;
		events.push({
			id: eventId,
			date: date,
			title: title,
			description: description,
			time: time
		});
		showCalendar(currentMonth, currentYear);
		eventDateInput.value = "";
		eventTitleInput.value = "";
		eventTimeInput.value = "";
		eventDescriptionInput.value = "";
		displayReminders();
	}
}

function deleteEvent(eventId) {
	let eventIndex =
		events.findIndex((event) =>
			event.id === eventId);

	if (eventIndex !== -1) {
		events.splice(eventIndex, 1);
		showCalendar(currentMonth, currentYear);
		displayReminders();
	}
}

function displayReminders() {
	reminderList.innerHTML = "";
	for (let i = 0; i < events.length; i++) {
		let event = events[i];
		let eventDate = new Date(event.date);
		if (eventDate.getMonth() ===
			currentMonth &&
			eventDate.getFullYear() ===
			currentYear) {
			let listItem = $("<li></li>").html(`<strong>${event.title}</strong> - ${event.description} on ${eventDate.toLocaleDateString()} at ${event.time}`);

			let deleteButton = $("<button></button>")
				.addClass("delete-event")
				.text("Delete")
				.click(function () {
					deleteEvent(event.id);
				});

			listItem.append(deleteButton);
			reminderList.append(listItem);
		}
	}
}

function generate_year_range(start, end) {
	let years = "";
	for (let year = start; year <= end; year++) {
		years += "<option value='" +
			year + "'>" + year + "</option>";
	}
	return years;
}

today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();
selectYear = $("#year");
selectMonth = $("#month");

createYear = generate_year_range(1970, 2050);

selectYear.html(createYear);

let calendar = $("#calendar");

let months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
let days = [
	"Sun", "Mon", "Tue", "Wed",
	"Thu", "Fri", "Sat"
];

$dataHead = "<tr>";
for (dhead in days) {
	$dataHead += "<th data-days='" +
		days[dhead] + "'>" +
		days[dhead] + "</th>";
}
$dataHead += "</tr>";

$("#thead-month").html($dataHead);

monthAndYear = $("#monthAndYear");
showCalendar(currentMonth, currentYear);

function next() {
	currentYear = currentMonth === 11 ?
		currentYear + 1 : currentYear;
	currentMonth = (currentMonth + 1) % 12;
	showCalendar(currentMonth, currentYear);
}

function previous() {
	currentYear = currentMonth === 0 ?
		currentYear - 1 : currentYear;
	currentMonth = currentMonth === 0 ?
		11 : currentMonth - 1;
	showCalendar(currentMonth, currentYear);
}

function jump() {
	currentYear = parseInt(selectYear.value);
	currentMonth = parseInt(selectMonth.value);
	showCalendar(currentMonth, currentYear);
}

function showCalendar(month, year) {
	let firstDay = new Date(year, month, 1).getDay();
	tbl = $("#calendar-body");
	tbl.html("");
	monthAndYear.html(months[month] + " " + year);
	selectYear.val(year);
	selectMonth.val(month);

	let date = 1;
	for (let i = 0; i < 6; i++) {
		let row = $("<tr></tr>");
		for (let j = 0; j < 7; j++) {
			if (i === 0 && j < firstDay) {
				let cell = $("<td></td>").text("");
				row.append(cell);
			} else if (date > daysInMonth(month, year)) {
				break;
			} else {
				let cell = $("<td></td>")
					.attr("data-date", date)
					.attr("data-month", month + 1)
					.attr("data-year", year)
					.attr("data-month_name", months[month])
					.addClass("date-picker")
					.html(`<span>${date}</span>`);

				if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
					cell.addClass("selected");
				}

				if (hasEventOnDate(date, month, year)) {
					cell.addClass("event-marker");
					cell.append(createEventTooltip(date, month, year));
				}

				row.append(cell);
				date++;
			}
		}
		tbl.append(row);
	}

	displayReminders();
}

function createEventTooltip(date, month, year) {
    let tooltip = $("<div></div>").addClass("event-tooltip");
    let eventsOnDate = getEventsOnDate(date, month, year);
    for (let i = 0; i < eventsOnDate.length; i++) {
        let event = eventsOnDate[i];
        let eventDate = new Date(event.date);
        let eventText = `<strong>${event.title}</strong> - ${event.description} on ${eventDate.toLocaleDateString()}`;
        let eventElement = $("<p></p>").html(eventText);
        tooltip.append(eventElement);
    }
    return tooltip;
}

function getEventsOnDate(date, month, year) {
	return events.filter(function (event) {
		let eventDate = new Date(event.date);
		return (
			eventDate.getDate() === date &&
			eventDate.getMonth() === month &&
			eventDate.getFullYear() === year
		);
	});
}


function hasEventOnDate(date, month, year) {
	return getEventsOnDate(date, month, year).length > 0;
}

function daysInMonth(iMonth, iYear) {
	return 32 - new Date(iYear, iMonth, 32).getDate();
}

showCalendar(currentMonth, currentYear);