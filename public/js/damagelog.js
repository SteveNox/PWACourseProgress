const dbUrl = "https://pwademo-66c7b-default-rtdb.europe-west1.firebasedatabase.app/damagelog";

var logger = {
  log: (aMessage) => {
    isLogging = true;

    if (isLogging) {
      console.log(aMessage);
    }
  }
}

var loglist = {
  items : [],   // current damage list
  inputForm: null,
  addButton: null,
  reportedAt: null, 
  licensePlate: null, 
  description: null, 
  picture: null,

  init : () => {
    loglist.inputForm = document.getElementById('damageForm');
    loglist.addButton = document.getElementById('list-add');
    loglist.reportedAt = document.getElementById('reportedAt');
    loglist.licensePlate = document.getElementById('licensePlate');
    loglist.description = document.getElementById('description');
    loglist.picture = document.getElementById('picture');

    loglist.inputForm.onsubmit = loglist.add;
    loglist.addButton.disabled = false;


    var networkDataReceived = false;

    fetch(dbUrl + ".json")
      .then(response => response.json())
      .then(function(data) {
          networkDataReceived = true;
          loglist.items = [];
          for (var key in data) {
            loglist.items.push({key: key, description: data[key].description, reportedAt: data[key].reportedAt, picture: data[key].picture, licensePlate: data[key].licensePlate}); 
          }
          console.log("from web", loglist.items);
          loglist.draw();
      });    

    //network cache racing
    if ('caches' in window) {
      caches.match(dbUrl + ".json")
        .then(function(response) {
          if (response) {
            return response.json();
          }
        })
        .then(function(data) {
          if(!networkDataReceived) {
            loglist.items = [];
            for (var key in data) {
            loglist.items.push({key: key, description: data[key].description, reportedAt: data[key].reportedAt, picture: data[key].picture, licensePlate: data[key].licensePlate}); 
          }
          console.log("from cache", loglist.items);
          loglist.draw();
        }
        });
    }


  },

  add : (evt) => {
    evt.preventDefault();
    
    var newItem = {
      reportedAt: loglist.reportedAt.value,
      licensePlate: loglist.licensePlate.value,
      description: loglist.description.value,
      picture: loglist.picture.value
    }

    fetch(dbUrl + ".json", {
      method: "POST", 
      body: JSON.stringify(newItem), 
      headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(function() {
        loglist.items.push(newItem);
        loglist.draw();
    });
  },

  delete : (id) => { if (confirm("Remove this item?")) {
    var item = loglist.items.find(i=>i.key==id);
    
    fetch(dbUrl + "/" + item.key + ".json", {
      method: "DELETE"
    });
    
    loglist.items.splice(loglist.items.findIndex(i=>i.key==id), 1);
    loglist.draw();
  }},

  draw : () => {
    log = document.getElementById("damageLogEntries");
    log.innerHTML = "";

    // NO ITEMS
    if (loglist.items.length == 0) {
      loglist.hlist.innerHTML = "<div class='item-row item-name'>No items found.</div>";
    }

    // DRAW ITEMS
    else {
      for (let i in loglist.items) {
        let card = document.createElement("div");
        card.className='card col-mb-3 m-2';
        card.style="width: 18rem;"
        let img = document.createElement("img");
        img.src=loglist.items[i].picture;
        img.className="card-img-top";
        let body = document.createElement("div");
        body.className="card-body";
        let title = document.createElement("h5");
        title.className="card-title";
        title.textContent=loglist.items[i].licensePlate;
        let subTitle = document.createElement("h6");
        subTitle.className="card-subtitle";
        subTitle.textContent=loglist.items[i].reportedAt;
        
        let description = document.createElement("p");
        description.className="card-text";
        description.textContent = loglist.items[i].description

        // DELETE BUTTON
        let del = document.createElement("input");
        del.className = "item-del";
        del.type = "button";
        del.value = "Delete";;
        del.onclick = () => { loglist.delete(loglist.items[i].key); };
        
        body.appendChild(title);
        body.appendChild(subTitle);
        body.appendChild(description)
        card.appendChild(img);
        card.appendChild(body);
        card.appendChild(del);
        log.appendChild(card);       
      }
    }
  }
};
window.addEventListener("load", loglist.init);