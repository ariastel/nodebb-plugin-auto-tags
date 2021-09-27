'use strict';

const constants = require('./constants');
const logger = require('./logger');
const { meta, routesHelpers } = require('./nodebb');


// NodeBB list of Hooks: https://github.com/NodeBB/NodeBB/wiki/Hooks
const Plugin = {
	words: new Map(),

	hooks: {
		actions: {},
		filters: {},
		statics: {
			load: async function (params) {
				const { router, middleware } = params;

				function renderAdmin(req, res) {
					res.render(`admin/plugins/${constants.PLUGIN_TOKEN}`, {});
				}
				routesHelpers.setupAdminPageRoute(router, `/admin/plugins/${constants.PLUGIN_TOKEN}`, middleware, [], renderAdmin);

				const settings = await meta.settings.get('auto-tags');
				Plugin.restructure(settings);
			},
		},
	},

	restructure(settings) {
		const autotags = settings.autotag ?? [];
		if (!autotags.length) {
			return;
		}

		Plugin.words = new Map();

		for (const autotag of autotags) {
			for (const word of autotag.words.split(',')) {
				const trimmedTag = autotag.tag.trim();
				const trimmedWord = word.trim();
				if (!Plugin.words.has(trimmedWord)) {
					Plugin.words.set(trimmedWord, new Set());
				}
				Plugin.words.get(trimmedWord).add(trimmedTag);
			}
		}
	},
};

/**
 * Called on `action:settings.set`
 */
Plugin.hooks.actions.settingsSet = function (data) {
	if (data.plugin === constants.PLUGIN_TOKEN) {
		Plugin.restructure(data.settings);
	}
};

/**
 * Called on `filter:admin.header.build`
 */
Plugin.hooks.filters.adminHeaderBuild = async function (header) {
	header.plugins.push({
		route: `/plugins/${constants.PLUGIN_TOKEN}`,
		icon: 'fa-tag',
		name: 'Auto Tags',
	});
	return header;
};

function getWordsFromTopic(topicData) {
	const words = new Set();
	for (const word of topicData.title.split(' ')) {
		words.add(word.trim());
	}
	for (const word of topicData.content.split(' ')) {
		words.add(word.trim());
	}
	return words;
}

function getTagsFromTopic(topicData) {
	const words = getWordsFromTopic(topicData);
	const tags = new Set(topicData.tags ?? []);

	for (const word of words) {
		if (Plugin.words.has(word)) {
			Plugin.words.get(word).forEach(tag => tags.add(tag));
		}
	}

	return Array.from(tags);
}

/**
 * Called on `filter:topic.edit`
 */
Plugin.hooks.filters.topicEdit = async function topicEdit(payload) {
	try {
		payload.data.tags = getTagsFromTopic(payload.data);
	} catch (e) {
		logger.error(e);
	}
	return payload;
};

/**
 * Called on `filter:topic.post`
 */
Plugin.hooks.filters.topicPost = async function topicPost(payload) {
	try {
		payload.tags = getTagsFromTopic(payload);
	} catch (e) {
		logger.error(e);
	}
	return payload;
};


module.exports = Plugin;
