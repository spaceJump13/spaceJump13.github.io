var installButton = document.querySelector('#installTrigger');
// var createPostArea = document.querySelector('#create-post');
// var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#myCard');

installButton.addEventListener('click', openCreatePostModal);

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

// function closeCreatePostModal() {
//   createPostArea.style.display = 'none';
// }

// shareImageButton.addEventListener('click', openCreatePostModal);

// closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
// function onSaveButtonClicked(event) {
//   console.log('clicked');
//   if ('caches' in window) {
//     caches.open('user-requested')
//       .then(function(cache) {
//         cache.add('https://httpbin.org/get');
//         cache.add('/src/images/sf-boat.jpg');
//       });
//   }
// }

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.innerHTML = 
  `<div class="col-md-12 col-lg-8">
      <div class="customCard">
        <img src="${data.img}" class="card-img" alt="...">
        <div class="card-body">
            <h3 class="card-title text-light">${data.name}</h3>
            <p class="card-info text-light">${data.header}</p>
            <a href=""><button id="detailButton" class="btn btn-outline-custom">See Detail</button></a>
        </div>
      </div>
    </div>`;
  cardWrapper.querySelector('#detailButton').addEventListener('click', function(event) {
    event.preventDefault();
    seeDetail(data);
  }); 

  componentHandler.upgradeElement(cardWrapper); 
  sharedMomentsArea.appendChild(cardWrapper);
}

async function seeDetail(data) {
  const url = `https://tes1-3abcd-default-rtdb.asia-southeast1.firebasedatabase.app/tes1/${data.id}.json`;
  
  try {
    const response = await fetch(url);
    const cardDetail = await response.json();
    
    // Store data only if not already present
    if (!localStorage.getItem(data.id)) {
      localStorage.setItem(data.id, JSON.stringify(cardDetail));
    }
    
    localStorage.setItem('now', JSON.stringify(data));
    window.location.href = "/detail.html";
  } catch (error) {
    if(!localStorage.getItem(data.id)){
      console.error('Error fetching data:', error);
      window.location.href = "/offline.html";
    }
    else{
      localStorage.setItem('now', JSON.stringify(data));
      window.location.href = "/detail.html";
    }
  }
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url = 'https://tes1-3abcd-default-rtdb.asia-southeast1.firebasedatabase.app/tes1.json';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });

}
