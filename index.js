require("@babel/polyfill");
var $knI9B$axios = require("axios");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
// this is our entry file, we get data from user interface.

const $f60945d37f8e594c$export$4c5dd147b21b9176 = (locations)=>{
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXNob2trdW1hcmthcnJpIiwiYSI6ImNtNW45eTk5dDA3bjcycXI0NGw1dDE3a3UifQ.WGthlWARGmAPnZdgW7GBtg';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ashokkumarkarri/cm5nu3wk000e901qyfsx50do3',
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        //Create marker
        const el = document.createElement('div');
        el.className = 'marker'; //it was already written in css file
        //Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates) //cordiantes is an array of lng and lat
        .addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        //extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 200,
            right: 200
        }
    });
};



const $c67cb762f0198593$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};
const $c67cb762f0198593$export$de026b00723010c1 = (type, msg)=>{
    $c67cb762f0198593$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}"> ${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout($c67cb762f0198593$export$516836c6a9dfc573, 5000);
};


const $70af9284e599e604$export$596d806903d1f59e = async (email, password)=>{
    try {
        const res = await (0, ($parcel$interopDefault($knI9B$axios)))({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });
        if (res.data.status === 'success') {
            (0, $c67cb762f0198593$export$de026b00723010c1)('success', 'Logged in successfully');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500);
        }
        console.log(res);
    } catch (err) {
        (0, $c67cb762f0198593$export$de026b00723010c1)('error', err.response.data.message);
    }
};
const $70af9284e599e604$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await (0, ($parcel$interopDefault($knI9B$axios)))({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
        });
        res.data.status = 'success'; //it will reload server
        location.reload(true);
    } catch (err) {
        console.log(err.response);
        (0, $c67cb762f0198593$export$de026b00723010c1)('error', 'Error logging out! Tru again');
    }
};


//DOM ELEMENTS
const $d0f7ce18c37ad6f6$var$mapBox = document.getElementById('map');
const $d0f7ce18c37ad6f6$var$loginForm = document.querySelector('.form');
const $d0f7ce18c37ad6f6$var$logOutBtn = document.querySelector('.nav__el--logout');
//DELEGATION
if ($d0f7ce18c37ad6f6$var$mapBox) {
    const locations = JSON.parse($d0f7ce18c37ad6f6$var$mapBox.dataset.locations);
    (0, $f60945d37f8e594c$export$4c5dd147b21b9176)(locations);
}
if ($d0f7ce18c37ad6f6$var$loginForm) $d0f7ce18c37ad6f6$var$loginForm.addEventListener('submit', (e)=>{
    console.log(email, password);
    e.preventDefault(); //this prevent's the form,from loading any other page
    //Values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    (0, $70af9284e599e604$export$596d806903d1f59e)(email, password);
});
if ($d0f7ce18c37ad6f6$var$logOutBtn) $d0f7ce18c37ad6f6$var$logOutBtn.addEventListener('click', (0, $70af9284e599e604$export$a0973bcfe11b05c9));


//# sourceMappingURL=index.js.map
