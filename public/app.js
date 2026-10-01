const cpu = document.querySelector("#cpu");
const mem = document.querySelector("#mem");
const disk = document.querySelector("#disk");
const alertBox = document.querySelector("#alert");
const history = document.querySelector("#history");

async function refresh() {
  const response = await fetch("/api/metrics");
  const data = await response.json();
  cpu.textContent = `${data.current.cpu}%`;
  mem.textContent = `${data.current.mem}%`;
  disk.textContent = `${data.current.disk}%`;
  if (data.alert) {
    alertBox.hidden = false;
    alertBox.textContent = data.alert.message;
  } else {
    alertBox.hidden = true;
  }
  history.replaceChildren();
  data.history.slice(-8).reverse().forEach((sample) => {
    const item = document.createElement("li");
    const when = new Date(sample.ts).toLocaleTimeString();
    item.textContent = `${when}  cpu ${sample.cpu}%  mem ${sample.mem}%  disk ${sample.disk}%`;
    history.append(item);
  });
}

refresh();
setInterval(refresh, 3000);
