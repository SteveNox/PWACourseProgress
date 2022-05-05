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
  videoPlayer: null,
  canvasElement: null,
  captureButton: null,
  imagePicker: null,
  imagePickerArea: null,
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

    loglist.videoPlayer = document.querySelector('#player');
    loglist.canvasElement = document.querySelector('#canvas');
    loglist.captureButton = document.querySelector('#capture-button');
    loglist.imagePicker = document.querySelector('#image-picker');
    loglist.imagePickerArea = document.querySelector('#pick-image');

    loglist.captureButton.addEventListener('click', loglist.capture);

    loglist.videoPlayer.style.display = 'none';
    loglist.imagePickerArea.style.display = 'none';

    //initialize media
    if (!('mediaDevices' in navigator)) {
        navigator.mediaDevices = {};
    }

    if (!('getUserMedia' in navigator.mediaDevices)) {
      //take advantage of older methods for special browsers
      navigator.mediaDevices.getUserMedia = function(constraints) {
        var getUserMedia = navigator.webkitGetUserMedia() || navigator.mozGetUserMedia;
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented!'));
        }

        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      } 
    }

    //will automatically ask for permissions
    navigator.mediaDevices.getUserMedia({video: true})
      .then(function(stream) {
        loglist.videoPlayer.srcObject = stream;
        loglist.videoPlayer.style.display = 'block';
      })
      .catch(function(err) {
        //show image picker?!
        loglist.imagePickerArea.style.display = 'block';
      });


    //initialize location
    if (!('geolocation' in navigator)) {
      //hide button
    }

    var networkDataReceived = false;

    fetch(dbUrl + ".json")
      .then(response => response.json())
      .then(function(data) {
          networkDataReceived = true;
          loglist.items = [];
          for (var key in data) {
            loglist.items.push({key: key, id: data[key].id, description: data[key].description, reportedAt: data[key].reportedAt, picture: data[key].picture, licensePlate: data[key].licensePlate}); 
          }
          console.log("from web", loglist.items);
          loglist.draw();
      })
      .catch(function(err) {
        //prevent red line in console
      }); 

    //network cache racing
    if('indexedDB' in window) {
      readAllData('damages')
        .then(function(data) {
          if(!networkDataReceived) {
            loglist.items = [];
            for (var key in data) {
              loglist.items.push({key: key, id: data[key].id, description: data[key].description, reportedAt: data[key].reportedAt, picture: data[key].picture, licensePlate: data[key].licensePlate}); 
             }
            console.log("from indexedDB", loglist.items);
            loglist.draw();
          }
        })
    }
  },
  capture: () => {
    var context = loglist.canvasElement.getContext('2d');
    loglist.canvasElement.style.display = 'block';
    loglist.videoPlayer.style.display = 'none';
    context.drawImage(loglist.videoPlayer, 0, 0, canvas.width, loglist.videoPlayer.videoHeight / (loglist.videoPlayer.videoWidth / canvas.width));
    loglist.videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
      track.stop();
    });
    loglist.picture = dataURItoBlob(loglist.canvasElement.toDataURL());
  },
  locate: () => {
    navigator.geolocation.getCurrentPosition(function(position) {
      //var location = position.coords.latitude;
    }, function(err) {
      console.log(err);
    }, {timeout: 7000});
  },
  add : (evt) => {
    evt.preventDefault();
    
    var newItem = {
      reportedAt: loglist.reportedAt.value,
      licensePlate: loglist.licensePlate.value,
      description: loglist.description.value,
      picture: loglist.picture.value,
      id: new Date().toISOString(),
    }

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(function(sw) {
            writeData('sync-damages', newItem)
            .then(function() {
              sw.sync.register('sync-new-damagelog');
            })
            .then(function() {
              //show toast or so on
              writeData('damages', newItem);
              loglist.items.push(newItem);
              loglist.draw();
            })
            .catch(function(err) {
              // console.log(err);
            })
        });
    } else {
      fetch(dbUrl + ".json", {
        method: "POST", 
        body: JSON.stringify(newItem), 
        headers: {"Content-type": "application/json; charset=UTF-8", 'Accept': 'application/json'}
      })
      .then(function() {
          loglist.items.push(newItem);
          loglist.draw();
      })
      .catch(function(err) {
        //prevent red line in console
      });
    }


  },

  delete : (id) => { if (confirm("Remove this item?")) {
    var item = loglist.items.find(i=>i.key==id);
    
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(function(sw) {
            writeData('sync-damages-delete', item)
            .then(function() {
              sw.sync.register('sync-new-damagelog-delete');
            })
            .then(function() {
              //show toast or so on
              deleteItemFromData('damages', id);
              loglist.items.splice(loglist.items.findIndex(i=>i.key==id), 1);
              loglist.draw();
            })
            .catch(function(err) {
              // console.log(err);
            })
        });
    } else {
      fetch(dbUrl + "/" + item.key + ".json", {
        method: "DELETE"
      })
      .then(function() {
          deleteItemFromData('damages', id);
          loglist.items.splice(loglist.items.findIndex(i=>i.key==id), 1);
          loglist.draw();          
      })
      .catch(function(err) {
        //prevent red line in console
      });
    }
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