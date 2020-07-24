const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const axios = require('axios').default;

const app = express();
app.use(express.json());
app.use(cors());

// limit requests
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 20, // limit each IP requests per windowMs
	message: 'too many requests, try again in a minute',
});

//  apply to all requests
app.use(limiter);

// configure cache
// caches the response for faster loading, set to false if using pagination
let USE_CACHE = true; 
let cachedData;
let cacheTime;

// redirect calls
app.get('/', (req, res) => {
	console.log('ping');
	const BASE_URL = 'https://jobs.github.com/positions.json';
	const params = req.query;
	console.log(params);
    // check for cached data
	if (USE_CACHE && cachedData && cacheTime > Date.now() - 1 * 60 * 1000){
        console.log('sending cached content');
        return res.send(cachedData);
    }
	axios
		.get(BASE_URL, {
			params: params,
		})
		.then(function (response) {
			// handle success
			console.log('sending brand new content');
			cachedData = response.data;
			cacheTime = Date.now();
			res.send(cachedData);
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		});
});

app.listen(4000, () => {
	console.log('server started on port 4000');
});
