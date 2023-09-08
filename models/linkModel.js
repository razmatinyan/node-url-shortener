const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
	{
		link: {
			type: String,
			trim: true,
			required: [true, 'Link cannot be empty!'],
		},
        shortLink: {
            type: String,
            trim: true,
            required: [true, 'Short Link is required!']
        },
        visited: {
            type: Number,
            default: 0
        }
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;