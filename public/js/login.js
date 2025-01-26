axios.defaults.withCredentials = true;
const login = async (email, password) => {
  // console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
      withCredentials: true, // This ensures cookies are sent and received
    });
    if (res.data.status === 'success') {
      alert('Logged in successfully');
      location.assign('/'); // Redirect immediately without delay
    }
    console.log(res);
  } catch (err) {
    alert(err.response.data.message);
    console.log(err.response.data); // you can see from axios library documentation
  }
};

//querySelector= is used to select a el based on a class.
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault(); //this prevent's the form,from loading any other page
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
