let processes = [];
let ganttData = [];
let timer = null;
let time = 0;
let paused = false;

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  if (document.body.classList.contains("light")) {
    themeToggle.textContent = "🌙 Dark Mode";
  } else {
    themeToggle.textContent = "🌞 Light Mode";
  }
});

function addProcess() {
  const pid = document.getElementById("pid").value || "P" + (processes.length + 1);
  const at = +document.getElementById("arrival").value;
  const bt = +document.getElementById("burst").value;
  const pr = +document.getElementById("priority").value || 0;

  if (isNaN(at) || isNaN(bt)) return alert("Invalid input");

  processes.push({
    pid, at, bt,
    remaining: bt,
    priority: pr,
    ct: null, tat: null, wt: null, rt: null,
    status: "Ready",
    started: false
  });

  updateTable();
}

function resetAll() {
  processes = [];
  ganttData = [];
  time = 0;
  clearInterval(timer);
  document.getElementById("gantt").innerHTML = "";
  document.getElementById("processTable").innerHTML = "";
  document.getElementById("metrics").innerHTML = "";
}

function startSimulation() {
  paused = false;
  const algo = document.getElementById("algorithm").value;
  if (algo === "FCFS") runFCFS();
  else if (algo === "SJF") runSJF();
  else if (algo === "SRTF") runSRTF();
  else if (algo === "PRIORITY_NP") runPriority(false);
  else if (algo === "PRIORITY_P") runPriority(true);
  else if (algo === "RR") runRR();
}

function pauseSimulation() {
  paused = true;
}

function resetSimulation() {
  clearInterval(timer);
  time = 0;
  ganttData = [];
  processes.forEach(p => {
    p.remaining = p.bt;
    p.status = "Ready";
    p.started = false;
  });
  document.getElementById("gantt").innerHTML = "";
  updateTable();
}

function runFCFS() {
  let queue = [...processes].sort((a,b)=>a.at-b.at);
  executeNonPreemptive(queue);
}

function runSJF() {
  let done = [];
  let t = 0;
  while (done.length < processes.length) {
    let available = processes.filter(p => p.at <= t && !done.includes(p));
    if (available.length === 0) { t++; continue; }
    available.sort((a,b)=>a.bt-b.bt);
    let p = available[0];
    runProcess(p, t);
    t += p.bt;
    done.push(p);
  }
}

function runSRTF() {
  timer = setInterval(()=>{
    if (paused) return;
    let available = processes.filter(p=>p.at<=time && p.remaining>0);
    if (available.length>0) {
      available.sort((a,b)=>a.remaining-b.remaining);
      let p = available[0];
      executeOneUnit(p);
    }
    time++;
    if (processes.every(p=>p.remaining===0)) finish();
  }, 500);
}

function runPriority(preemptive) {
  if (!preemptive) {
    let queue=[...processes].sort((a,b)=>a.priority-b.priority);
    executeNonPreemptive(queue);
  } else {
    runSRTF(); // simplified preemptive priority
  }
}

function runRR() {
  const q = +document.getElementById("quantum").value;
  if (!q) return alert("Enter Time Quantum");
  let queue = [];
  timer = setInterval(()=>{
    if (paused) return;
    processes.forEach(p=>{
      if (p.at===time) queue.push(p);
    });
    if (queue.length>0) {
      let p = queue.shift();
      let exec = Math.min(q, p.remaining);
      p.remaining -= exec;
      ganttData.push({pid:p.pid,start:time,end:time+exec});
      time += exec;
      if (p.remaining>0) queue.push(p);
      else completeProcess(p);
      renderGantt();
      updateTable();
    } else time++;
    if (processes.every(p=>p.remaining===0)) finish();
  },500);
}

function executeNonPreemptive(queue) {
  queue.forEach(p=>{
    let start = Math.max(time, p.at);
    ganttData.push({pid:p.pid,start,end:start+p.bt});
    time = start + p.bt;
    completeProcess(p);
  });
  renderGantt();
  updateTable();
  calculateMetrics();
}

function executeOneUnit(p) {
  if (!p.started) {
    p.rt = time - p.at;
    p.started = true;
  }
  p.remaining--;
  ganttData.push({pid:p.pid,start:time,end:time+1});
  if (p.remaining===0) completeProcess(p);
  renderGantt();
  updateTable();
}

function completeProcess(p) {
  p.ct = time;
  p.tat = p.ct - p.at;
  p.wt = p.tat - p.bt;
  p.status = "Completed";
}

function runProcess(p,start){
  ganttData.push({pid:p.pid,start,end:start+p.bt});
  time=start+p.bt;
  completeProcess(p);
}

function finish() {
  clearInterval(timer);
  calculateMetrics();
}

function renderGantt() {
  const g = document.getElementById("gantt");
  g.innerHTML="";
  ganttData.forEach(d=>{
    let div=document.createElement("div");
    div.className="gantt-block";
    // adapt colors for light/dark theme
    const hue = (d.pid.charCodeAt(1)*40)%360;
    div.style.background = document.body.classList.contains("light")
      ? `hsl(${hue},70%,80%)`
      : `hsl(${hue},70%,60%)`;
    div.style.color = document.body.classList.contains("light") ? "#000" : "#000";
    div.innerText=d.pid;
    g.appendChild(div);
  });
}

function updateTable() {
  const tbody=document.getElementById("processTable");
  tbody.innerHTML="";
  processes.forEach(p=>{
    tbody.innerHTML+=`
      <tr>
        <td>${p.pid}</td>
        <td>${p.at}</td>
        <td>${p.bt}</td>
        <td>${p.ct ?? "-"}</td>
        <td>${p.tat ?? "-"}</td>
        <td>${p.wt ?? "-"}</td>
        <td>${p.rt ?? "-"}</td>
        <td>${p.status}</td>
      </tr>`;
  });
}

function calculateMetrics() {
  let avgWT=0, avgTAT=0;
  processes.forEach(p=>{
    avgWT+=p.wt;
    avgTAT+=p.tat;
  });
  avgWT/=processes.length;
  avgTAT/=processes.length;
  document.getElementById("metrics").innerHTML=`
    <p>Average Waiting Time: ${avgWT.toFixed(2)}</p>
    <p>Average Turnaround Time: ${avgTAT.toFixed(2)}</p>
    <p>CPU Utilization: 100%</p>
    <p>Throughput: ${(processes.length/time).toFixed(2)} processes/unit time</p>`;
}
