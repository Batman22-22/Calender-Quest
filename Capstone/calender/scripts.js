$(document).ready(function() {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let events = JSON.parse(localStorage.getItem("events")) || {};

   // Update the renderCalendar function
function renderCalendar(month, year) {
    $("#month-year").text(`${months[month]} ${year}`);
    
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();
    
    let table = $("#calendar-body");
    table.empty();
    
    let date = 1;
    for (let i = 0; i < 6; i++) {
        let row = $("<tr></tr>");
        
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                let cell = $("<td class='empty'></td>");
                row.append(cell);
            } else if (date > daysInMonth) {
                break;
            } else {
                let cell = $("<td></td>");
                let cellText = document.createTextNode(date);
                cell.append(cellText);
                cell.attr("data-date", `${year}-${month + 1}-${date}`);
                
                // Check if there's an event for this date
                if (events[`${year}-${month + 1}-${date}`]) {
                    let eventDetails = events[`${year}-${month + 1}-${date}`];
                    let eventElement = $("<div class='event'></div>").text(eventDetails.eventName);
                    cell.append(eventElement);
                }
                
                // Highlight today's date
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.addClass("active");
                }
                
                // Handle click event on a calendar date
                cell.click(function() {
                    const selectedDate = $(this).attr("data-date");
                    window.location.href = `mapAPI?date=${selectedDate}`;
                });
                
                row.append(cell);
                date++;
            }
        }
        
        table.append(row);
    }
}


    $("#prev").click(function() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    $("#next").click(function() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    renderCalendar(currentMonth, currentYear);
});




function toggleMenu() {
    var menu = document.getElementById('menu');
    menu.classList.toggle('collapsed');
}

function goProfile() {
    window.location.href = "../../Capstone/profile";
}

function goToDo() {
    window.location.href = "../../Capstone/profile";
}

function goNotes() {
    window.location.href = "../../Capstone/notes";
}

function goFood() {
    window.location.href = "../../Capstone/meal-plan";
}

function logOut() {
    window.location.href = "../../Capstone";
}