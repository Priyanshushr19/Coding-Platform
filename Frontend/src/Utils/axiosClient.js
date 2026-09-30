import axios from "axios"

const axiosClient =  axios.create({
    // baseURL: 'http://localhost:5005',
    baseURL:'https://coding-platform-httt.onrender.com/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

