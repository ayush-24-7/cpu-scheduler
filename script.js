const processList = [];

// Handle form submission
document.getElementById('process-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    const processName = document.getElementById('process-name').value;
    const burstTime = parseInt(document.getElementById('burst-time').value);
    const arrivalTime = parseInt(document.getElementById('arrival-time').value);
    const algorithm = document.getElementById('scheduling-algorithm').value;

    // Validate burst time and arrival time
    if (burstTime < 0 || arrivalTime < 0) {
        alert("Burst Time and Arrival Time must be non-negative.");
        return;
    }

    // Check if we are editing a process
    if (this.dataset.editIndex !== undefined) {
        const index = this.dataset.editIndex;
        processList[index] = { name: processName, burstTime, arrivalTime }; // Update the process
        delete this.dataset.editIndex; // Clear the edit index
    } else {
        // Add the new process to the list
        processList.push({ name: processName, burstTime, arrivalTime });
    }
    
    // Clear the form
    this.reset();
    
    // Call the scheduling function based on the selected algorithm
    if (algorithm === 'fcfs') {
        scheduleProcesses();
    } else if (algorithm === 'sjf') {
        scheduleProcessesSJF();
    }
});

// Function to edit a process
function editProcess(index) {
    const process = processList[index];
    document.getElementById('process-name').value = process.name;
    document.getElementById('burst-time').value = process.burstTime;
    document.getElementById('arrival-time').value = process.arrivalTime;
    
    // Set the edit index for the form
    document.getElementById('process-form').dataset.editIndex = index;

    // Optional: Scroll to the form to make it more user-friendly
    document.getElementById('process-form').scrollIntoView({ behavior: 'smooth' });
}

// Schedule processes using FCFS
function scheduleProcesses() {
    const sortedProcesses = processList.sort((a, b) => a.arrivalTime - b.arrivalTime);

    let currentTime = 0;
    const results = sortedProcesses.map(process => {
        const waitingTime = Math.max(0, currentTime - process.arrivalTime);
        currentTime = Math.max(currentTime, process.arrivalTime) + process.burstTime;
        const turnaroundTime = waitingTime + process.burstTime;

        return {
            name: process.name,
            waitingTime,
            turnaroundTime,
        };
    });

    displayResults(results);
    visualizeProcesses(results);
}

// Schedule processes using SJF
function scheduleProcessesSJF() {
    const sortedProcesses = processList.slice().sort((a, b) => a.burstTime - b.burstTime);

    let currentTime = 0;
    const results = sortedProcesses.map(process => {
        const waitingTime = currentTime;
        currentTime += process.burstTime;
        const turnaroundTime = waitingTime + process.burstTime;

        return {
            name: process.name,
            waitingTime,
            turnaroundTime,
        };
    });

    displayResults(results);
    visualizeProcesses(results);
}

// Display results in the table
function displayResults(results) {
    const processListDiv = document.getElementById('process-list');
    processListDiv.innerHTML = ''; // Clear previous results

    const table = document.createElement('table');
    table.className = 'min-w-full bg-white border border-gray-300 mt-4 rounded-lg';

    const thead = document.createElement('thead');
    thead.className = 'bg-gray-200';
    thead.innerHTML = `
        <tr>
            <th class="border px-4 py-2">Process Name</th>
            <th class="border px-4 py-2">Waiting Time</th>
            <th class="border px-4 py-2">Turnaround Time</th>
            <th class="border px-4 py-2">Actions</th>
        </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    results.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border px-4 py-2">${result.name}</td>
            <td class="border px-4 py-2">${result.waitingTime}</td>
            <td class="border px-4 py-2">${result.turnaroundTime}</td>
            <td class="border px-4 py-2">
                <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" onclick="editProcess(${index})">Edit</button>
                <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteProcess(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    processListDiv.appendChild(table);

    // Calculate and display total waiting and turnaround times
    const totalWaitingTime = results.reduce((sum, process) => sum + process.waitingTime, 0);
    const totalTurnaroundTime = results.reduce((sum, process) => sum + process.turnaroundTime, 0);
    document.getElementById('total-waiting-time').innerText = `Total Waiting Time: ${totalWaitingTime}`;
    document.getElementById('total-turnaround-time').innerText = `Total Turnaround Time: ${totalTurnaroundTime}`;
}

// Delete a process
function deleteProcess(index) {
    const confirmDelete = confirm("Are you sure you want to delete this process?");
    if (confirmDelete) {
        processList.splice(index, 1); // Remove the process from the list
        scheduleProcesses(); // Recalculate and display results
    }
}

// Visualize the process scheduling
function visualizeProcesses(results) {
    const visualizationDiv = document.getElementById('visualization');
    visualizationDiv.innerHTML = ''; // Clear previous visualizations

    let currentTime = 0;

    results.forEach(process => {
        const processDiv = document.createElement('div');
        processDiv.style.position = 'absolute';
        processDiv.style.left = `${currentTime * 20}px`; // Adjust for spacing
        processDiv.style.width = `${process.burstTime * 20}px`; // Width based on burst time
        processDiv.style.height = '30px'; // Fixed height for visualization
        processDiv.className = 'bg-blue-500 text-white flex items-center justify-center';
        processDiv.innerText = process.name;

        visualizationDiv.appendChild(processDiv);
        currentTime += process.burstTime; // Move current time forward
    });
}

// Clear button functionality
document.getElementById('clear-button').addEventListener('click', function () {
    processList.length = 0; // Clear the process list
    document.getElementById('process-list').innerHTML = ''; // Clear displayed results
    document.getElementById('visualization').innerHTML = ''; // Clear visualization
    document.getElementById('total-waiting-time').innerText = `Total Waiting Time: 0`;
    document.getElementById('total-turnaround-time').innerText = `Total Turnaround Time: 0`;
});
