const jsonBinUrl = 'https://api.jsonbin.io/v3/b/6699d64facd3cb34a868209e'; // Corrected JSONBin URL
const apiKey = '$2a$10$PAC1aWUZ1v6nYdASdlU9T.pSkUw29Ys.uKrdoYRZVL36dlUzxLRgK'; // Your API key

let userData = null;
let loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || {
    events: [],
    notes: [],
    mealPlans: []
};

async function fetchUserData() {
    try {
        const response = await fetch(jsonBinUrl, {
            headers: {
                'X-Master-Key': apiKey
            }
        });
        const data = await response.json();
        userData = data.record || [];

        const storedUsername = sessionStorage.getItem('loggedInUsername');

        if (storedUsername) {
            loggedInUser = userData.find(user => user.username === storedUsername) || loggedInUser;
            sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            console.log('Logged in user data:', loggedInUser);
        } else {
            console.warn('No logged-in username found in session storage.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function updateUserData() {
    try {
        const response = await fetch(jsonBinUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify(userData)
        });
        if (response.ok) {
            console.log('Data updated successfully');
            console.log('Updated User Data:', loggedInUser);
        } else {
            console.error('Error updating data:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

function updateSessionUserData(updatedUser) {
    sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
}

//---------------------------------- Calendar ------------------------------------------------------
$(document).ready(async function () {
    await fetchUserData();

    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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
                    const eventForDate = loggedInUser.events.find(event => event.date === `${year}-${month + 1}-${date}`);
                    if (eventForDate) {
                        let event = $("<div class='event'></div>").text(eventForDate.eventName);
                        cell.append(event);
                    }
                    cell.click(function () {
                        const date = $(this).attr("data-date");
                        showEventModal(date);
                    });
                    row.append(cell);
                    date++;
                }
            }

            table.append(row);
        }
    }

    $("#prev").click(function () {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    $("#next").click(function () {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    //------------------------------------------------event modal---------------------------------------------------
    $(".close").click(function () {
        $("#event-modal").css("display", "none");
    });

    $(window).click(function (event) {
        if (event.target === document.getElementById("event-modal")) {
            $("#event-modal").css("display", "none");
        }
    });

    $("#event-form").submit(async function (event) {
        event.preventDefault();

        const date = $("#event-date").val();
        const eventName = $("#event-name").val();
        const startTime = $("#start-time").val();
        const endTime = $("#end-time").val();
        const destination = $("#end").val();
        const duration = document.getElementById('output').innerText.split('Duration: ')[1] || "";

        const newEvent = { date, eventName, startTime, endTime, destination, duration };

        // Add or update the event
        const eventIndex = loggedInUser.events.findIndex(event => event.date === date);
        if (eventIndex > -1) {
            loggedInUser.events[eventIndex] = newEvent;
        } else {
            loggedInUser.events.push(newEvent);
        }

        // Update userData and session storage
        const userIndex = userData.findIndex(user => user.username === loggedInUser.username);
        if (userIndex > -1) {
            userData[userIndex] = loggedInUser;
        } else {
            userData.push(loggedInUser);
        }

        await updateUserData();
        updateSessionUserData(loggedInUser);

        $("#event-modal").css("display", "none");
        renderCalendar(currentMonth, currentYear);
    });

    function clearDistanceCalculation() {
        document.getElementById('output').innerHTML = '';
    }

    function showEventModal(date) {
        $("#event-date").val(date);
        const existingEvent = loggedInUser.events.find(event => event.date === date);
        clearDistanceCalculation();
        if (existingEvent) {
            $("#event-name").val(existingEvent.eventName);
            $("#start-time").val(existingEvent.startTime);
            $("#end-time").val(existingEvent.endTime);
            $("#end").val(existingEvent.destination);
            $(".modal-content").append(`<button id="delete-event" data-event-date="${date}">Delete Event</button>`);
            $("#delete-event").click(async function () {
                const eventDate = $(this).attr("data-event-date");
                loggedInUser.events = loggedInUser.events.filter(event => event.date !== eventDate);
                await updateUserData();
                updateSessionUserData(loggedInUser);
                $("#event-modal").css("display", "none");
                renderCalendar(currentMonth, currentYear);
            });
        } else {
            $("#event-name").val("");
            $("#start-time").val("");
            $("#end-time").val("");
            $("#end").val("");
            $("#delete-event").remove();
        }
        $("#event-modal").css("display", "block");
    }

    renderCalendar(currentMonth, currentYear);
});

var autocompleteStart, autocompleteEnd;

function initAutocomplete() {
    autocompleteStart = new google.maps.places.Autocomplete(document.getElementById('start'), { types: ['establishment'] });
    autocompleteEnd = new google.maps.places.Autocomplete(document.getElementById('end'), { types: ['establishment'] });

    // Bias the autocomplete object to the user's geographical location,
    // as supplied by the browser's 'navigator.geolocation' object.
    autocompleteStart.setFields(['address_component']);
    autocompleteEnd.setFields(['address_component']);
}

function initMapasync() {
    initAutocomplete();
}

function loadScript() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB-Ep4rBtq2tecPJgVqHYS9vt6vKwFLFuE&libraries=places&callback=initMapasync';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

function calculateDistance() {
    var origin = document.getElementById('start').value;
    var destination = document.getElementById('end').value;
    var avoidHighways = document.getElementById('avoid-highways').checked;
    var avoidTolls = document.getElementById('avoid-tolls').checked;
    var mode = document.getElementById('mode').value;

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode[mode],
        avoidHighways: avoidHighways,
        avoidTolls: avoidTolls,
        unitSystem: google.maps.UnitSystem.IMPERIAL
    }, function (response, status) {
        if (status !== google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
        } else {
            var originAddress = response.originAddresses[0];
            var destinationAddress = response.destinationAddresses[0];
            if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
                alert('Error: No route found');
            } else {
                var distance = response.rows[0].elements[0].distance.text;
                var duration = response.rows[0].elements[0].duration.text;
                var output = 'Distance: ' + distance + '<br> Duration: ' + duration;
                document.getElementById('output').innerHTML = output;
            }
        }
    });
}
loadScript();

document.getElementById("event-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get form values
    let eventName = document.getElementById("event-name").value;
    let eventDate = document.getElementById("event-date").value;
    let startTime = document.getElementById("start-time").value;
    let endTime = document.getElementById("end-time").value;
    let destination = document.getElementById("end").value;
    let duration = document.getElementById("output").innerText.split('Duration: ')[1] || "";

    // Convert start time to 12-hour format
    let startTime12h = formatTimeTo12H(startTime);
    // Convert end time to 12-hour format
    let endTime12h = formatTimeTo12H(endTime);

    // Create list item to display the event
    let eventItem = document.createElement("li");

    // Create a span to hold the event details
    let eventDetails = document.createElement("span");
    eventDetails.innerHTML = `<b>${eventName}</b><br>Date: ${eventDate}<br>Time: ${startTime12h} to ${endTime12h}<br>Destination: ${destination}<br>Duration: ${duration}`;
    eventItem.appendChild(eventDetails);

    // Create a delete button with a trash icon
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using FontAwesome trash icon
    deleteButton.className = 'delete-button';

    deleteButton.addEventListener("click", async function () {
        // Remove the event item from the DOM
        eventItem.remove();

        // Identify the event to be deleted by its name and date
        const eventToDelete = {
            date: eventDate,
            eventName: eventName
        };

        // Remove the event from loggedInUser.events based on both date and name
        loggedInUser.events = loggedInUser.events.filter(event =>
            !(event.date === eventToDelete.date && event.eventName === eventToDelete.eventName)
        );

        // Update JSONBin with the modified event list
        await updateUserData();
        updateSessionUserData(loggedInUser);
    });


    eventItem.appendChild(deleteButton);

    // Append the event item to the events list
    document.getElementById("events").appendChild(eventItem);

    // Clear form inputs after adding event
    document.getElementById("event-form").reset();

    // Add event to loggedInUser.events
    loggedInUser.events.push({
        date: eventDate,
        eventName: eventName,
        startTime: startTime12h,
        endTime: endTime12h,
        destination: destination,
        duration: duration
    });

    // Update JSONBin with the new data
    await updateUserData();
    updateSessionUserData(loggedInUser);
});

// Function to convert time to 12-hour format
function formatTimeTo12H(time) {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    let period = 'AM';

    if (hours >= 12) {
        period = 'PM';
        if (hours > 12) hours -= 12;
    }

    if (hours === 0) {
        hours = 12;
    }
    let formatedTime = `${hours}:${minutes} ${period}`;

    return formatedTime;
}

document.addEventListener("DOMContentLoaded", async function () {
    await fetchUserData();
    renderEvents();
});

function renderEvents() {
    if (!loggedInUser || !loggedInUser.events) {
        console.error('No events found for the logged-in user.');
        return;
    }

    const events = loggedInUser.events;
    const eventsList = document.getElementById("events");
    eventsList.innerHTML = "";

    events.forEach(event => {
        const eventItem = document.createElement("li");
        const eventDetail = document.createElement("span");
        const startTime12h = formatTimeTo12H(event.startTime);
        const endTime12h = formatTimeTo12H(event.endTime);

        eventDetail.innerHTML = `<b>${event.eventName}</b><br>Date: ${event.date}<br>Time: ${event.startTime} to ${event.endTime}<br>Destination: ${event.destination}<br>Duration: ${event.duration}`;
        eventItem.appendChild(eventDetail);

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener("click", async function () {
            eventItem.remove();
            loggedInUser.events = loggedInUser.events.filter(e => e.date !== event.date);
            await updateUserData();
            updateSessionUserData(loggedInUser);
        });

        eventItem.appendChild(deleteButton);
        eventsList.appendChild(eventItem);
    });
}





//-------------------------------------------------------------------------notes----------------------------------------------------------------------------
const MAX_NOTE_LENGTH = 200; // Set maximum length for a note

function displayNotes() {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';

    if (loggedInUser && loggedInUser.notes) {
        loggedInUser.notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';

            const noteText = document.createElement('span');
            noteText.textContent = note.content;

            const removeIcon = document.createElement('i');
            removeIcon.className = 'fas fa-trash-alt remove-icon';
            removeIcon.addEventListener('click', async function () {
                // Remove note from UI
                notesContainer.removeChild(noteElement);

                // Remove note from loggedInUser.notes
                const noteIndex = loggedInUser.notes.findIndex(n => n.id === note.id);
                if (noteIndex > -1) {
                    loggedInUser.notes.splice(noteIndex, 1);
                    try {
                        await updateUserData(); // Ensure this function updates the backend or storage
                        updateSessionUserData(loggedInUser); // Ensure session data is updated
                    } catch (error) {
                        console.error('Error updating user data:', error);
                    }
                }
            });

            noteElement.appendChild(noteText);
            noteElement.appendChild(removeIcon);
            notesContainer.appendChild(noteElement);
        });
    }
}

document.getElementById('save-button').addEventListener('click', async function () {
    const noteInput = document.getElementById('note-input');
    const notesContainer = document.getElementById('notes-container');

    if (noteInput.value.trim() !== '') {
        if (noteInput.value.length > MAX_NOTE_LENGTH) {
            alert(`Note is too long. Maximum length is ${MAX_NOTE_LENGTH} characters.`);
            return;
        }

        const noteId = `note${Date.now()}`; // Unique ID using timestamp
        const noteContent = noteInput.value;

        // Add note to loggedInUser.notes
        loggedInUser.notes.push({ id: noteId, content: noteContent });

        // Update userData and session storage
        const userIndex = userData.findIndex(user => user.username === loggedInUser.username);
        if (userIndex > -1) {
            userData[userIndex] = loggedInUser;
        } else {
            userData.push(loggedInUser);
        }

        try {
            await updateUserData(); // Ensure this function updates the backend or storage
            updateSessionUserData(loggedInUser); // Ensure session data is updated
        } catch (error) {
            console.error('Error updating user data:', error);
        }

        // Create and display note element
        const noteElement = document.createElement('div');
        noteElement.className = 'note';

        const noteText = document.createElement('span');
        noteText.textContent = noteContent;

        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-trash-alt remove-icon';
        removeIcon.addEventListener('click', async function () {
            // Remove note from UI
            notesContainer.removeChild(noteElement);

            // Remove note from loggedInUser.notes
            const noteIndex = loggedInUser.notes.findIndex(n => n.id === noteId);
            if (noteIndex > -1) {
                loggedInUser.notes.splice(noteIndex, 1);
                try {
                    await updateUserData(); // Ensure this function updates the backend or storage
                    updateSessionUserData(loggedInUser); // Ensure session data is updated
                } catch (error) {
                    console.error('Error updating user data:', error);
                }
            }
        });

        noteElement.appendChild(noteText);
        noteElement.appendChild(removeIcon);
        notesContainer.appendChild(noteElement);

        noteInput.value = '';
    } else {
        alert('Please enter a note before saving.');
    }
});

//----------------------------------------------------------------meal plan------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    let mealPlans = [];
    let nextMealPlanNumber = 1;

    // Initialize the application
    function init() {
        fetchUserData();
        displayMealPlans();
        attachEventListeners();
    }

    // Fetch user data
    function fetchUserData() {
        // Retrieve logged-in user data from session storage
        loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

        if (loggedInUser && loggedInUser.mealPlans) {
            mealPlans = loggedInUser.mealPlans;
            updateNextMealPlanNumber();
        } else {
            mealPlans = [];
            nextMealPlanNumber = 1;
        }
    }

    // Attach event listeners
    function attachEventListeners() {
        document.getElementById("createMealPlanBtn").addEventListener("click", openCreateModal);
        document.getElementById("surpriseMeBtn").addEventListener("click", generateSurpriseMealPlan);
        document.getElementById("saveMealPlanBtn").addEventListener("click", saveMealPlan);
    }

    // Open create modal
    function openCreateModal() {
        document.getElementById("mealPlanForm").reset();
        document.getElementById("modalTitle").textContent = "Create Meal Plan";
        openModal("mealPlanModal");
    }

    // Generate surprise meal plan
    function generateSurpriseMealPlan() {
        const vegetarian = confirm("Are you a vegetarian?");
        const heavyEater = confirm("Are you a heavy eater?");
        const newPlan = generateRandomMealPlan(vegetarian, heavyEater);
        mealPlans.push(newPlan);
        saveMealPlans();
        updateNextMealPlanNumber();
        displayMealPlans();
    }

    // Save meal plan
    function saveMealPlan() {
        const planName = document.getElementById("planName").value.trim();
        if (planName === "") {
            alert("Please enter a meal plan name.");
            return;
        }

        const meals = getDaysOfWeek().map(day => ({
            day: day,
            meals: document.getElementById(day.toLowerCase()).value.trim()
        }));

        const mealPlan = {
            id: generateId(),
            name: planName,
            meals: meals
        };

        mealPlans.push(mealPlan);
        saveMealPlans();
        displayMealPlans();
        closeModal("mealPlanModal");
    }

    // Save meal plans to localStorage and JSONBin
    function saveMealPlans() {
        try {
            localStorage.setItem("mealPlans", JSON.stringify(mealPlans));
            loggedInUser.mealPlans = mealPlans;
            updateUserData();
            updateSessionUserData(loggedInUser);
        } catch (error) {
            console.error("Error saving meal plans:", error);
            alert("There was an error saving your meal plans. Please try again.");
        }
    }

    // Generate random meal plan
    function generateRandomMealPlan(vegetarian, heavyEater) {
        const planMeals = getDaysOfWeek().map(day => ({
            day: day,
            meals: [
                generateRandomMeal('Breakfast', vegetarian, heavyEater),
                generateRandomMeal('Lunch', vegetarian, heavyEater),
                generateRandomMeal('Dinner', vegetarian, heavyEater)
            ].join(', ')
        }));

        return {
            id: generateId(),
            name: `Meal_${nextMealPlanNumber}`,
            meals: planMeals
        };
    }

    // Generate random meal
    function generateRandomMeal(mealType, vegetarian, heavyEater) {
        const mealsDatabase = {
            'Breakfast': vegetarian ? ['Oatmeal with fruits', 'Avocado toast', 'Smoothie bowl'] : ['Bacon and eggs', 'Pancakes', 'Breakfast burrito'],
            'Lunch': vegetarian ? ['Grilled vegetable sandwich', 'Quinoa salad', 'Lentil soup'] : ['Chicken salad', 'Turkey wrap', 'Steak sandwich'],
            'Dinner': vegetarian ? ['Vegetable stir-fry', 'Pasta primavera', 'Vegetarian chili'] : ['Grilled salmon', 'Beef stew', 'Chicken curry']
        };

        const meals = mealsDatabase[mealType];
        const randomMeal = meals[Math.floor(Math.random() * meals.length)];
        const portionSize = heavyEater ? 'Large portion of ' : 'Small portion of ';

        return portionSize + randomMeal;
    }

    // Update next meal plan number
    function updateNextMealPlanNumber() {
        nextMealPlanNumber = Math.max(...mealPlans.map(plan => {
            const number = parseInt(plan.name.split('_')[1]);
            return isNaN(number) ? 0 : number;
        })) + 1;
    }

    // Display meal plans
    function displayMealPlans(filteredPlans) {
        const plansList = document.getElementById("mealPlansList");
        plansList.innerHTML = "";

        (filteredPlans || mealPlans).forEach(plan => {
            const planItem = document.createElement("li");
            planItem.classList.add("meal-plan-item");

            const planName = document.createElement("strong");
            planName.textContent = plan.name;

            const buttons = [
                createButton('Edit', () => editMealPlan(plan.id)),
                createButton('Delete', () => deleteMealPlan(plan.id)),
                createButton('Share', () => shareMealPlan(plan.id)),
                createButton('View Meal Plan', () => viewMealPlan(plan.id))
            ];

            planItem.appendChild(planName);
            buttons.forEach(button => planItem.appendChild(button));

            plansList.appendChild(planItem);
        });
    }

    // Create button helper function
    function createButton(text, onClickFunction) {
        const button = document.createElement("button");
        button.classList.add("button");
        button.textContent = text;
        button.setAttribute("title", `${text} this meal plan`);
        button.setAttribute("aria-label", `${text} meal plan`);
        button.addEventListener("click", onClickFunction);
        return button;
    }

    // Edit meal plan
    function editMealPlan(planId) {
        const plan = mealPlans.find(plan => plan.id === planId);
        if (plan) {
            document.getElementById("planName").value = plan.name;
            plan.meals.forEach(meal => {
                document.getElementById(meal.day.toLowerCase()).value = meal.meals;
            });
            document.getElementById("modalTitle").textContent = "Edit Meal Plan";
            openModal("mealPlanModal");

            document.getElementById("saveMealPlanBtn").onclick = function () {
                updateMealPlan(plan);
            };
        }
    }

    // Update meal plan
    function updateMealPlan(plan) {
        plan.name = document.getElementById("planName").value.trim();
        plan.meals.forEach(meal => {
            meal.meals = document.getElementById(meal.day.toLowerCase()).value.trim();
        });

        saveMealPlans();
        displayMealPlans();
        closeModal("mealPlanModal");
    }

    // Delete meal plan
    function deleteMealPlan(planId) {
        if (confirm("Are you sure you want to delete this meal plan?")) {
            mealPlans = mealPlans.filter(plan => plan.id !== planId);
            saveMealPlans();
            displayMealPlans();
        }
    }

    // Share meal plan
    function shareMealPlan(planId) {
        const plan = mealPlans.find(plan => plan.id === planId);
        if (plan) {
            let shareText = `Meal Plan: ${plan.name}\n\n`;
            plan.meals.forEach(meal => {
                shareText += `${meal.day}\n${meal.meals}\n\n`;
            });

            if (navigator.share) {
                navigator.share({
                    title: plan.name,
                    text: shareText,
                }).then(() => {
                    console.log('Meal plan shared successfully.');
                }).catch(error => {
                    console.error('Error sharing meal plan:', error);
                    fallbackShare(shareText);
                });
            } else {
                fallbackShare(shareText);
            }
        }
    }

    // Fallback share method
    function fallbackShare(shareText) {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = shareText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
        alert("Meal plan copied to clipboard. You can now paste it to share.");
    }

    // View meal plan
    function viewMealPlan(planId) {
        const plan = mealPlans.find(plan => plan.id === planId);
        if (plan) {
            const modalContent = createMealPlanModalContent(plan);
            const mealPlanModal = document.getElementById("mealPlanModal");
            mealPlanModal.innerHTML = "";
            mealPlanModal.appendChild(modalContent);
            openModal("mealPlanModal");
        }
    }

    // Create meal plan modal content
    function createMealPlanModalContent(plan) {
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");

        const closeButton = document.createElement("span");
        closeButton.classList.add("close");
        closeButton.innerHTML = "&times;";
        closeButton.addEventListener("click", () => closeModal("mealPlanModal"));
        modalContent.appendChild(closeButton);

        const heading = document.createElement("h2");
        heading.textContent = plan.name;
        modalContent.appendChild(heading);

        const table = document.createElement("table");
        table.innerHTML = `
        <thead>
        <tr>
        <th>Day</th>
        <th>Meals</th>
        </tr>
        </thead>
        <tbody>
        ${plan.meals.map(meal => `
            <tr>
            <td>${meal.day}</td>
            <td>${meal.meals}</td>
            </tr>
            `).join('')}
            </tbody>
            `;

        modalContent.appendChild(table);
        return modalContent;
    }

    // Generate unique ID
    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Open modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "block";
        
        function onWindowClick(event) {
            if (event.target === modal) {
                closeModal(modalId);
            }
        }

        window.addEventListener("click", onWindowClick);
    }

    // Close modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "none";
        document.getElementById("mealPlanForm").reset();
        // window.removeEventListener("click", onWindowClick);
    }

    // Helper function to get days of the week
    function getDaysOfWeek() {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }

    // Initialize the application
    init();
});


document.getElementById('fetch-user-info').onclick = function () {
    // Retrieve logged-in user data from session storage
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        // Display user information
        document.getElementById('user-username').textContent = loggedInUser.username || 'N/A';
        document.getElementById('user-email').textContent = loggedInUser.email || 'N/A';
        document.getElementById('user-password').textContent = loggedInUser.password || 'N/A'; // Ensure password handling is secure
        document.getElementById('user-event').textContent = loggedInUser.events && loggedInUser.events.length > 0
            ? loggedInUser.events.map(e => `${e.eventName} (${e.date})`).join(', ')
            : 'No events';
        document.getElementById('user-notes').textContent = loggedInUser.notes && loggedInUser.notes.length > 0
            ? loggedInUser.notes.map(note => note.content).join(', ')
            : 'No notes';
        document.getElementById('user-meals').textContent = loggedInUser.mealPlans && loggedInUser.mealPlans.length > 0
                ? loggedInUser.mealPlans.map(meal => meal.name).join(', ')
                : 'No meal plans';
    } else {
        alert('No user is logged in.');
    }
};

window.onload = async function () {
    await fetchUserData();

    const storedUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (storedUser) {
        loggedInUser = storedUser;
        displayNotes();
    }
};
