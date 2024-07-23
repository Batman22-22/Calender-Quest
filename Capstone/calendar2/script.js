const jsonBinUrl = 'https://api.jsonbin.io/v3/b/6699d64facd3cb34a868209e'; // Corrected JSONBin URL
const apiKey = '$2a$10$PAC1aWUZ1v6nYdASdlU9T.pSkUw29Ys.uKrdoYRZVL36dlUzxLRgK'; // Your API key

// let userData = null;
let loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || { 
    events: [], 
    notes: [], 
    mealPlan: [] 
};

async function fetchUserData() {
    try {
        const response = await fetch(jsonBinUrl, {
            headers: {
                'X-Master-Key': apiKey
            }
        });
        const data = await response.json();
        userData = data.record;
        console.log(userData);
        loggedInUser = userData.loggedInUser || loggedInUser;
        sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function updateUserData(userData) {
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
    
    let events = loggedInUser.events || {};
    
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
    //-------------------------------------------------------------------------------------------------



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
        const duration = document.getElementById('output').innerText.split('Duration: ')[1];

        events[date] = {
            eventName,
            startTime,
            endTime,
            destination,
            duration
        };

        loggedInUser.events = events;
        await updateUserData(userData);
        updateSessionUserData(loggedInUser);

        $("#event-modal").css("display", "none");
        renderCalendar(currentMonth, currentYear);
    });
    
    function clearDistanceCalculation() {
        document.getElementById('output').innerHTML = '';
    }
    
    
    // Function to show event modal with existing event details or for adding new event
    function showEventModal(date) {
        $("#event-date").val(date);
        const existingEvent = events[date];
        clearDistanceCalculation();
        if (existingEvent) {
            $("#event-name").val(existingEvent.eventName);
            $("#start-time").val(existingEvent.startTime);
            $("#end-time").val(existingEvent.endTime);
            $("#end").val(existingEvent.destination);
            $(".modal-content").append(`<button id="delete-event" data-event-date="${date}">Delete Event</button>`);
            $("#delete-event").click(async function () {
                const eventDate = $(this).attr("data-event-date");
                delete events[eventDate];
                loggedInUser.events = events;
                await updateUserData(userData);
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
}

function initMapasync() {
    initAutocomplete();
}

function loadScript() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB-Ep4rBtq2tecPJgVqHYS9vt6vKwFLFuE&libraries=places&callback=initMapasync';
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

// $(document).ready(function () {
//     const urlParams = new URLSearchParams(window.location.search);
//     const date = urlParams.get('date');
//     $("#event-date").val(date);
    
//     $("#event-scheduler").submit(function (event) {
//         event.preventDefault();
//         const eventName = $("#event-name").val();
//         const startTime = $("#start-time").val();
//         const endTime = $("#end-time").val();
//         const start = $("#start").val();
//         const end = $("#end").val();
//         const avoidHighways = $("#avoid-highways").is(':checked');
//         const avoidTolls = $("#avoid-tolls").is(':checked');
//         const mode = $("#mode").val();
        
//         const eventDetails = {
//             eventName,
//             startTime,
//             endTime,
//             start,
//             end,
//             avoidHighways,
//             avoidTolls,
//             mode
//         };
        
//         const events = JSON.parse(localStorage.getItem("events")) || {};
//         events[date] = eventDetails;
//         localStorage.setItem("events", JSON.stringify(events));
//     });
// });

loadScript();

document.getElementById("event-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get form values
    let eventName = document.getElementById("event-name").value;
    let eventDate = document.getElementById("event-date").value;
    let startTime = document.getElementById("start-time").value;
    let endTime = document.getElementById("end-time").value;
    let destination = document.getElementById("end").value;
    let duration = document.getElementById("output").innerText.split('Duration: ')[1]; // Assuming the distance calculation is done

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
        // Remove the event item when the delete button is clicked
        eventItem.remove();

        // Remove the event from loggedInUser.events and update JSONBin
        delete loggedInUser.events[eventDate];
        await updateUserData(userData);
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
    await updateUserData(userData);
    updateSessionUserData(loggedInUser);
});

// Function to convert time to 12-hour format
function formatTimeTo12H(time) {
    let formattedTime = new Date("2000-01-01T" + time + ":00Z").toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    return formattedTime;
}



document.addEventListener("DOMContentLoaded", async function () {
    await fetchUserData();
    renderEvents();
});
function renderEvents() {
    const events = loggedInUser.events || {};
    const eventsList = document.getElementById("events");
    eventsList.innerHTML = "";

    for (const [date, eventDetails] of Object.entries(events)) {
        const eventItem = document.createElement("li");
        const eventDetail = document.createElement("span");
        const startTime12h = formatTimeTo12H(eventDetails.startTime);
        const endTime12h = formatTimeTo12H(eventDetails.endTime);

        eventDetail.innerHTML = `<b>${eventDetails.eventName}</b><br>Date: ${date}<br>Time: ${startTime12h} to ${endTime12h}<br>Destination: ${eventDetails.destination}<br>Duration: ${eventDetails.duration}`;
        eventItem.appendChild(eventDetail);

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using FontAwesome trash icon
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener("click", async function () {
            eventItem.remove();
            delete loggedInUser.events[date];
            await updateUserData(userData);
            updateSessionUserData(loggedInUser);
        });

        eventItem.appendChild(deleteButton);
        eventsList.appendChild(eventItem);
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------






//-------------------------------------------------------------------------notes----------------------------------------------------------------------------
document.getElementById('save-button').addEventListener('click', async function () {
    const noteInput = document.getElementById('note-input');
    const notesContainer = document.getElementById('notes-container');

    if (noteInput.value.trim() !== '') {
        const noteId = `note${loggedInUser.notes.length + 1}`;
        const noteContent = noteInput.value;

        // Add note to loggedInUser.notes
        loggedInUser.notes.push({ id: noteId, content: noteContent });

        

        // Create and display note element
        const note = document.createElement('div');
        note.className = 'note';

        const noteText = document.createElement('span');
        noteText.textContent = noteContent;

        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-trash-alt remove-icon';
        removeIcon.addEventListener('click', async function () {
            // Remove note from DOM
            notesContainer.removeChild(note);

            // Find the index of the note to delete
            const noteIndex = loggedInUser.notes.findIndex(note => note.id === noteId);
            if (noteIndex > -1) {
                // Remove note from loggedInUser.notes
                loggedInUser.notes.splice(noteIndex, 1);

                // Update user data
                await updateUserData(loggedInUser);
                updateSessionUserData(loggedInUser);
            }
        });

        note.appendChild(noteText);
        note.appendChild(removeIcon);
        notesContainer.appendChild(note);

        // Clear input field
        noteInput.value = '';

        // Update user data
        await updateUserData(loggedInUser);
        updateSessionUserData(loggedInUser);
    } else {
        alert('Please enter a note before saving.');
    }
});


//------------------------------------------------------------------------------------------------------------------------------------














//----------------------------------------------------------------meal plan------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    let mealPlans = [];
    let nextMealPlanNumber = 1;
    
    // Initialize the application
    function init() {
        loadMealPlans();
        attachEventListeners();
        displayMealPlans();
    }
    
    // Load meal plans from localStorage
    function loadMealPlans() {
        try {
            const storedPlans = localStorage.getItem("mealPlans");
            if (storedPlans) {
                mealPlans = JSON.parse(storedPlans);
                updateNextMealPlanNumber();
            }
        } catch (error) {
            console.error("Error loading meal plans:", error);
            alert("There was an error loading your meal plans. Please try refreshing the page.");
        }
    }
    
    // Attach event listeners
    function attachEventListeners() {
        document.getElementById("createMealPlanBtn").addEventListener("click", openCreateModal);
        document.getElementById("surpriseMeBtn").addEventListener("click", generateSurpriseMealPlan);
        document.getElementById("saveMealPlanBtn").addEventListener("click", saveMealPlan);
        document.getElementById("searchMealPlans").addEventListener("input", searchMealPlans);
        document.getElementById("exportMealPlansBtn").addEventListener("click", exportMealPlans);
        document.getElementById("importMealPlansBtn").addEventListener("change", importMealPlans);
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

        // Search meal plans
        function searchMealPlans() {
            const query = document.getElementById("searchMealPlans").value.toLowerCase();
            const filteredPlans = mealPlans.filter(plan => plan.name.toLowerCase().includes(query));
            displayMealPlans(filteredPlans);
        }
        
        // Export meal plans to JSON
        function exportMealPlans() {
            const dataStr = JSON.stringify(mealPlans);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'mealPlans.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Import meal plans from JSON
    function importMealPlans(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedPlans = JSON.parse(e.target.result);
                    if (Array.isArray(importedPlans)) {
                        mealPlans = importedPlans;
                        saveMealPlans();
                        updateNextMealPlanNumber();
                        displayMealPlans();
                        alert("Meal plans imported successfully!");
                    } else {
                        alert("Invalid file format. Please upload a valid JSON file.");
                    }
                } catch (error) {
                    alert("Error importing meal plans. Please check the file format and try again.");
                }
            };
            reader.readAsText(file);
        }
    }
    
    // Save meal plans to localStorage
    function saveMealPlans() {
        try {
            //alert(JSON.stringify(mealPlans));
            localStorage.setItem("mealPlans", JSON.stringify(mealPlans));
        } catch (error) {
            console.error("Error saving meal plans:", error);
            alert("There was an error saving your meal plans. Please try again.");
        }
    }
    
    // Generate unique ID
    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Open modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "block";
        window.onclick = function (event) {
            if (event.target === modal) {
                closeModal(modalId);
            }
        };
    }
    
    // Close modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "none";
        document.getElementById("mealPlanForm").reset();
        window.onclick = null;
    }
    
    // Helper function to get days of the week
    function getDaysOfWeek() {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }
    
    // Initialize the application
    init();
});
//------------------------------------------------------------------------------------------------------------------------------------------------------

// function displayUserData(users) {
//         const userDataDiv = document.getElementById('userData');
//         users.forEach(user => {
//             let userInfo = `<div class="user-info">
//                                 <h2>Username: ${user.username}</h2>
//                                 <p>Email: ${user.email}</p>
//                                 <p>Password: ${user.password}</p>`;
            
//             userInfo += `<h3>Calendar Events:</h3>`;
//             user.calendarEvents.forEach(event => {
//                 userInfo += `<div class="event">
//                                 <p>Date: ${event.date}</p>
//                                 <p>Event Name: ${event.eventName}</p>
//                                 <p>Start Time: ${event.startTime}</p>
//                                 <p>End Time: ${event.endTime}</p>
//                                 <p>Destination: ${event.destination}</p>
//                                 <p>Duration: ${event.duration}</p>
//                             </div>`;
//             });
    
//             userInfo += `<h3>Meal Plans:</h3>`;
//             user.mealPlans.forEach(plan => {
//                 userInfo += `<div class="meal-plan">
//                                 <p>Meal Plan Name: ${plan.name}</p>
//                                 <p>Meals: ${plan.meals.map(meal => `${meal.day}: ${meal.meals}`).join(', ')}</p>
//                             </div>`;
//             });
    
//             userInfo += `<h3>Notes:</h3>`;
//             user.notes.forEach(note => {
//                 userInfo += `<div class="note">
//                                 <p>Note ID: ${note.id}</p>
//                                 <p>Content: ${note.content}</p>
//                             </div>`;
//             });
    
//             userInfo += `</div>`;
//             userDataDiv.innerHTML += userInfo;
//         });
//     }


window.onload = fetchUserData;