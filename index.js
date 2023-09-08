const crypto = require('crypto');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const Link = require('./models/linkModel');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname + '/views'));

app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
	res.render('home', {
		domain: process.env.DOMAIN || 'http://127.0.0.1:3000/'
	});
});

app.get('/:id', async (req, res) => {
	const doc = await Link.findOne({ shortLink: req.params.id });

	if ( doc ) {
		await Link.findOneAndUpdate(
			{ shortLink: req.params.id },
			{ visited: doc.visited + 1 },
			null
		);
		res.redirect(doc.link);
	} else {
		res.sendStatus(404);
	}
});

app.post('/url', async (req, res) => {
	const originalUrl = req.body.url;
	if ( !originalUrl ) {
		return res.json({
			status: 400,
			message: 'URL is required!'
		});
	}

	const id = crypto.randomBytes(6).toString('hex');
	const doc = await Link.create({ 
		link: originalUrl,
		shortLink: id
	});

	return res.json({
		status: 200,
		data: {
			id,
			domain: process.env.DOMAIN || 'http://127.0.0.1:3000/'
		}
	});
});

process.on('uncaughtException', (err) => {
	console.log('Uncaught Exception! Shutting down...');
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DB;
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((con) => {
		console.log('DB Connected');
	});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
	console.log('Server is started.');
});

process.on('unhandledRejection', (err) => {
	console.log(err.name, err.message);
	console.log('Unhandled Rejection! Shutting down...');
	server.close(() => process.exit(1));
});