# OS Process Scheduling Simulator

A **frontend-only OS Process Scheduling Simulator** with **Light/Dark mode**, **animated Gantt chart**, and **performance metrics**.  
Designed for **OS labs, mini-projects, and learning CPU scheduling algorithms**.

## Features

- Add multiple processes dynamically with:
  - Process ID
  - Arrival Time
  - Burst Time
  - Priority (optional)
- Select scheduling algorithms:
  - First Come First Serve (FCFS)
  - Shortest Job First (SJF – Non-Preemptive)
  - Shortest Remaining Time First (SRTF – Preemptive)
  - Priority Scheduling (Preemptive & Non-Preemptive)
  - Round Robin (with Time Quantum)
- Step-by-step simulation with **Play / Pause / Reset**
- **Dynamic Gantt Chart** with animated transitions
- Real-time process states: Ready, Running, Waiting, Completed
- Performance Metrics:
  - Completion Time (CT)
  - Turnaround Time (TAT)
  - Waiting Time (WT)
  - Response Time (RT)
  - Average Waiting Time
  - Average Turnaround Time
  - CPU Utilization
  - Throughput
- Modern, **responsive UI** with **Light/Dark mode toggle**
- Educational enhancements:
  - Short explanations of selected algorithms
  - Advantages & disadvantages
  - Tooltip explanations for metrics

## Project Structure
os-scheduling-simulator/
├── index.html
├── style.css
├── script.js
└── README.md


## How to Run

1. Download or clone the repository.
2. Open `index.html` in any modern browser.
3. Add processes, select a scheduling algorithm, and run the simulation.

## Technologies Used

- HTML5
- CSS3 (Light/Dark theme)
- Vanilla JavaScript

## Author

**Kunal Navdhinge**


