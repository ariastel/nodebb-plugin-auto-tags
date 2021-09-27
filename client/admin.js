'use strict';

define('admin/plugins/auto-tags', ['settings'], function (settings) {
	var ACP = {};

	ACP.init = function () {
		settings.load('auto-tags', $('.auto-tags-settings'));
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('auto-tags', $('.auto-tags-settings'), function () {
			app.alert({
				type: 'success',
				alert_id: 'auto-tags-saved',
				title: 'Settings Saved',
				message: 'Please reload your NodeBB to apply these settings',
				clickfn: function () {
					socket.emit('admin.restart');
				},
			});
		});
	}

	return ACP;
});
