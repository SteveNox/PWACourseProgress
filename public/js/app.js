if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log('SERVICE WORKER registerd!');
        });
}

//a lot of demos for promise and fetch
// console.log('BEFORE TIMEOUT!')

// var promise = new Promise(function(resolve, reject) {
//     setTimeout(function() {
//         resolve('TIMEOUT COMPLETE')
//         //reject({code: 500, message: 'An error occurred!'});
//     }, 3000);    
// });

// fetch('https://httpbin.org/ip')
//     .then(function(response) {
//         console.log(response);
//         return response.json();
//     })
//     .then(function(data) {
//         console.log(data);
//     })
//     .catch(function(err) {
//         console.log(err);
//     });

    // fetch('https://httpbin.org/post', {
    //     method: 'POST',
    //     mode: 'cors', //'no-cors',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'
    //     },
    //     body: JSON.stringify({message: 'Hello World?!'})
    // })
    // .then(function(response) {
    //     console.log(response);
    //     return response.json();
    // })
    // .then(function(data) {
    //     console.log(data);
    // })
    // .catch(function(err) {
    //     console.log(err);
    // });
    
// promise.then(function(text) {
//     //console.log(text);
//     return(text);
// }).then(function(newText) {
//     console.log(newText);
// }, function(err) {
//     console.log(err.code, err.message);
// }).finally(function() {
//     console.log("FINALLY!!!!");
// });

// promise.then(function(text) {
//         console.log(text);
//     }).catch(function(err) {
//         console.log(err.code, err.message);
//     }).finally(function() {
//         console.log("FINALLY!!!!");
//     });
    
// console.log('AFTER TIMEOUT!')