'use strict';
'require form';
'require rpc';
'require ui';
'require view';

const execStatus = rpc.declare({
	object: 'file', method: 'exec', params: [ 'command', 'params' ],
	expect: { '': {} }
});

function runHelper(name) {
	return execStatus('/usr/libexec/sane-openwrt-luci/' + name, []);
}

function decode(result) {
	if (!result || result.code !== 0)
		throw new Error(result && result.stderr ? result.stderr : _('Command failed'));
	try {
		return JSON.parse(result.stdout || '{}');
	}
	catch (e) {
		throw new Error(_('Invalid response from scanner helper'));
	}
}

return view.extend({
	load: function() {
		return Promise.all([
			runHelper('status').then(decode).catch(function(e) { return { error: e.message }; }),
			runHelper('discover').then(decode).catch(function(e) { return { output: e.message }; })
		]);
	},

	render: function(data) {
		const status = data[0] || {};
		const discovery = data[1] || {};
		const map = new form.Map('m158ab-saned', _('SANE Scanner'),
			_('Detect the USB scanner, manage the SANE network service, and configure access. Save this form to apply settings.'));
		const section = map.section(form.NamedSection, 'main', 'server', _('Service and network'));
		section.anonymous = true;
		section.addremove = false;

		let enabled = section.option(form.Flag, 'enabled', _('Allow the SANE service to run'));
		enabled.rmempty = false;
		enabled.default = '0';

		let iface = section.option(form.Value, 'interface', _('Listen on network interface'),
			_('The service binds to this interface address. For a WAN address, allow TCP port 6566 in the firewall.'));
		iface.rmempty = false;
		iface.default = 'lan';
		iface.placeholder = 'lan';

		let allow = section.option(form.DynamicList, 'allow', _('Allowed client addresses'),
			_('IPv4/IPv6 addresses or CIDR networks permitted to use saned.'));
		allow.rmempty = true;
		allow.placeholder = '192.0.2.0/24';

		const buttons = E('div', { 'class': 'cbi-section' }, [
			E('h3', _('Scanner status')),
			E('p', { 'id': 'sane-status' }, status.error ? status.error :
				_('SANE service: %s; autostart: %s; TCP port: %s').format(
					status.service || _('unknown'), status.enabled ? _('enabled') : _('disabled'), status.port || '6566')),
			E('p', { 'id': 'sane-detection', 'class': 'pre' }, discovery.output || _('No detection output')),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'cbi-button', 'click': ui.createHandlerFn(this, 'refresh') }, _('Refresh detection')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-action', 'click': ui.createHandlerFn(this, 'service', 'restart') }, _('Restart service')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-positive', 'click': ui.createHandlerFn(this, 'service', 'start') }, _('Start')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-negative', 'click': ui.createHandlerFn(this, 'service', 'stop') }, _('Stop')),
				' ',
				E('button', { 'class': 'cbi-button', 'click': ui.createHandlerFn(this, 'service', 'enable') }, _('Enable at boot')),
				' ',
				E('button', { 'class': 'cbi-button', 'click': ui.createHandlerFn(this, 'service', 'disable') }, _('Disable at boot'))
			])
		]);

		const caps = E('div', { 'class': 'cbi-section' }, [
			E('h3', _('Scanner capabilities')),
			E('p', _('Options are read from the installed SANE backend. Scan jobs and image data stay with your SANE client.')),
			E('button', { 'class': 'cbi-button', 'click': ui.createHandlerFn(this, 'showOptions') }, _('Read scan options')),
			E('pre', { 'id': 'sane-options', 'style': 'white-space:pre-wrap; overflow-wrap:anywhere' }, _('Not queried'))
		]);

		return map.render().then(function(formEl) {
			return E('div', {}, [buttons, formEl, caps]);
		});
	},

	refresh: function() {
		return runHelper('discover').then(decode).then(function(result) {
			document.getElementById('sane-detection').textContent = result.output || _('No output');
			return runHelper('status').then(decode);
		}).then(function(result) {
			document.getElementById('sane-status').textContent = _('SANE service: %s; autostart: %s; TCP port: %s').format(
				result.service || _('unknown'), result.enabled ? _('enabled') : _('disabled'), result.port || '6566');
		}).catch(function(e) { ui.addNotification(null, E('p', e.message)); });
	},

	service: function(ev, action) {
		return runHelper(action).then(function(result) {
			if (!result || result.code !== 0)
				throw new Error(result && result.stderr ? result.stderr : _('Service action failed'));
			return this.refresh();
		}.bind(this)).catch(function(e) { ui.addNotification(null, E('p', e.message)); });
	},

	showOptions: function() {
		const output = document.getElementById('sane-options');
		output.textContent = _('Reading options…');
		return runHelper('options').then(decode).then(function(result) {
			output.textContent = result.output || _('No scan options reported');
		}).catch(function(e) { output.textContent = e.message; });
	}
});
