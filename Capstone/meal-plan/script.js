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
    function displayMealPlans() {
        const plansList = document.getElementById("mealPlansList");
        plansList.innerHTML = "";
    
        mealPlans.forEach(plan => {
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

            document.getElementById("saveMealPlanBtn").onclick = function() {
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

    // Save meal plans to localStorage
    function saveMealPlans() {
        try {
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
        window.onclick = function(event) {
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