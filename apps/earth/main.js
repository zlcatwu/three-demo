import Earth from './earth';


const canvas = document.querySelector('canvas#webgl');
const container = document.querySelector('div#container');

const earth = new Earth({ dom: canvas, debug: true, resizeDom: container });

const rand = (left, right) => {
    const range = right - left + 1;
    return Math.floor(Math.random() * range) + left;
};

let markerID = 0;
setInterval(() => {
    const lon = rand(-180, 180);
    const lat = rand(-90, 90);
    const uid = markerID++;
    earth.addMarker({ id: uid, lon, lat });
    setTimeout(() => {
        earth.removeMarker(uid);
    }, 1000);
}, 20);

let lineID = 0;
setInterval(() => {
    const lon = rand(-180, 180);
    const lat = rand(-90, 90);
    const uid = lineID++;
    earth.addLine({
        id: uid,
        from: {
            lon: rand(-180, 180),
            lat: rand(-90, 90)
        },
        to: {
            lon: rand(-180, 180),
            lat: rand(-90, 90)
        }
    });
}, 100);
