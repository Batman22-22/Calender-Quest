$(document).ready(function() {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let events = JSON.parse(localStorage.getItem("events")) || {};

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
                    if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                        cell.addClass("active");
                    }
                    if (events[`${year}-${month + 1}-${date}`]) {
                        let event = $("<div class='event'></div>").text(events[`${year}-${month + 1}-${date}`]);
                        cell.append(event);
                    }
                    cell.click(function() {
                        $("#event-date").val($(this).attr("data-date"));
                        $("#event-modal").css("display", "block");
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

    $(".close").click(function() {
        $("#event-modal").css("display", "none");
    });

    $(window).click(function(event) {
        if (event.target == document.getElementById("event-modal")) {
            $("#event-modal").css("display", "none");
        }
    });

    $("#event-form").submit(function(event) {
        event.preventDefault();
        const date = $("#event-date").val();
        const desc = $("#event-desc").val();
        events[date] = desc;
        localStorage.setItem("events", JSON.stringify(events));
        $("#event-modal").css("display", "none");
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