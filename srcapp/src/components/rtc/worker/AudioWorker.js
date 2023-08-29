
// audioWorker.js

onmessage = function(e) {
    const array = e.data;
    let values = 0;
    const length = array.length;

    for (let i = 0; i < length; i++) {
        values += array[i];
    }

    const average = values / length;
    postMessage(average);
};
