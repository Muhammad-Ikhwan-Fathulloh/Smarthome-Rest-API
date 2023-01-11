let control_name = document.getElementById('control_name');
let control_pin = document.getElementById('control_pin');
let control_value = document.getElementById('control_value');

let control_button = document.getElementById('control_button');
let control_button_clear = document.getElementById('control_button_clear');

let control_list = document.getElementById('control_list');
let monitoring_list = document.getElementById('monitoring_list');

let update = false;
let update_control_id = null;

let url = "https://63b733ad4d97e82aa3b7143b.mockapi.io/api/v1/";

function myFetch(url, type, data){
    // Delete
    if (type === "DELETE") {
        return fetch(url, {
            method: type,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                console.log("HTTP request successfully");
            }else{
                console.log("HTTP request unsuccessfully");
            }
            return res;
        }).catch(error => error)
    }

    // POST / PUT
    if (type === "POST" | type === "PUT") {
        return fetch(url, {
            method: type,
            mode:'cors',
            cache:'no-cache',
            credentials:'same-origin',
            redirect:'follow',
            referrerPolicy:'no-referrer',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        }).then(res => {
            if (res.ok) {
                console.log("HTTP request successfully");
            }else{
                console.log("HTTP request unsuccessfully");
            }
            return res;
        })
        .then(res => res.json())
        .then(data => data)
        .catch(error => error)
    }
}

function getControl(){
    fetch(url+"control")
    .then((response) => response.json())
    .then((data) => listControls(data));
}

function getMonitoring(){
    fetch(url+"monitoring")
    .then((response) => response.json())
    .then((data) => listMonitorings(data));
}

function listMonitorings(data){
    console.log(data);
    monitoring_list.innerHTML = `<ul id="monitoring_list"></ul>`;

    for (const value of data) {
       const monitoringUL = document.querySelector('#monitoring_list');
       const monitoringLI = document.createElement('li');
       console.log(value.monitoring_name); 
       let status;
       if (value.monitoring_name == "Suhu") {
        status = `°C`;
       }else{
        status = `%`;
       }
       monitoringLI.innerHTML = `
        <div class="card mb-3">
        <div class="card-body">
            <div class="row">
                <div class="col">
                    <strong>${value.monitoring_name}</strong>
                </div>
                <div class="col">
                    <strong>${value.monitoring_value} ${status}</strong>
                </div>
            </div>
        </div>
        </div>`;
       monitoringUL.append(monitoringLI);
    }
}

function listControls(data){
    console.log(data);

    for (const value of data) {
       const controlUL = document.querySelector('#control_list');
       const controlLI = document.createElement('li');
       console.log(value.control_name); 
       let status;
       let button_action;
       if (value.control_value == 1) {
        status = `<button class="btn btn-success" id="${value.id}" onClick="controlStatus(${value.control_value}, this.id)">ON</button>`;
       }else{
        status = `<button class="btn btn-danger" id="${value.id}" onClick="controlStatus(${value.control_value}, this.id)">OFF</button>`;
       }
       button_action = `
       <button class="btn btn-primary" id="${value.id}" onClick="controlEdit(this.id)">Edit</button>
       <button class="btn btn-danger" id="${value.id}" onClick="controlDelete(this.id)">Delete</button>`;
       
       controlLI.innerHTML = `
        <div class="card mb-3">
        <div class="card-body">
            <div class="row">
                <div class="col">
                    <strong>${value.control_name}</strong>
                </div>
                <div class="col">
                    <strong>${value.control_pin}</strong>
                </div>
                <div class="col">
                    <strong>${status}</strong>
                </div>
                <div class="col">
                    <strong>${button_action}</strong>
                </div>
            </div>
        </div>
        </div>`;
       controlUL.append(controlLI);
    }
}

function controlClear(){
    control_name.value = '';
    control_pin.value = '';
    control_value.value = '';
    update = false;
    update_control_id = null;
}

function controlEdit(id){
    console.log(id);
    fetch(url+"control/"+id)
    .then((response) => response.json())
    .then((data) => controlDetail(data));
    update = true;
    update_control_id = id;
}

function controlDetail(data){
    console.log(data);
    control_name.value = data.control_name;
    control_pin.value = data.control_pin;
    control_value.value = data.control_value;
}

function controlDelete(id){
    console.log(id);
    control_list.innerHTML = `<ul id="control_list"></ul>`;
    myFetch(`${url}/control/${id}`, "DELETE").then(res => console.log(res))
    alert("Delete data successfully");
    controlClear();
    getControl();
}

control_button_clear.addEventListener("click", () => {
    alert("Clear data successfully");
    controlClear();
});

control_button.addEventListener("click", () => {
    console.log(control_name.value);
    console.log(control_pin.value);
    console.log(control_value.value);
    control_list.innerHTML = `<ul id="control_list"></ul>`;
    if (control_name.value == "" && control_pin.value == "" && control_name.value == "") {
        alert("Please input data");
    }else{
        if (update == false) {
            myFetch(`${url}/control`, "POST",{
                control_name: control_name.value,
                control_pin: parseInt(control_pin.value),
                control_value: parseInt(control_value.value),
            }).then(res => console.log(res))
            alert("Create data successfully");
        }

        if (update == true) {
            myFetch(`${url}/control/${update_control_id}`, "PUT",{
                control_name: control_name.value,
                control_pin: parseInt(control_pin.value),
                control_value: parseInt(control_value.value),
            }).then(res => console.log(res))
            alert("Update data successfully");
        }
    }
    
    controlClear();
    getControl();
});

function controlStatus(value, id){
    console.log(value,id);
    control_list.innerHTML = `<ul id="control_list"></ul>`;
    if (value == 1) {
       myFetch(`${url}/control/${id}`, "PUT",{
        control_value: 0
       }).then(res => console.log(res))
    }
    if (value == 0) {
        myFetch(`${url}/control/${id}`, "PUT",{
         control_value: 1
        }).then(res => console.log(res))
     }
     alert("Control status updated");
     getControl();
}

getControl();
setInterval(getMonitoring, 10000);