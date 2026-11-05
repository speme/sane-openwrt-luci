# SANE Scanner Management for OpenWrt LuCI

A lightweight LuCI application for discovering locally attached SANE scanners and managing the `m158ab-saned` service shipped with the M158ab OpenWrt backend.

## Features

- Detect a connected M158ab using the installed SANE backend (`scanimage -L`).
- Show service state, autostart state, and saned TCP port.
- Start, stop, and restart `m158ab-saned`; enable or disable service autostart with dedicated controls.
- Configure the bind interface and client address/CIDR allowlist from LuCI.
- Query scanner capabilities from SANE, including source, modes, resolutions, and backend options.
- USB hotplug permission handling and scanner recovery stay in the backend/service packages. No USB/IP client is required when the scanner is attached directly to the router.
- Scan data is not buffered on the router; scanning remains handled by a SANE client.

## Requirements

- OpenWrt 25.12 or compatible LuCI build.
- `luci-base`, `rpcd-mod-file`, `sane-frontends`, `sane-daemon`, and the `m158ab-saned` service package.
- The scanner must be attached to the router USB host and visible to `scanimage -L`.

The LuCI package menu appears under **Services → SANE Scanner** (depending on the installed LuCI theme/menu layout).

## Configuration

The page edits `/etc/config/m158ab-saned`:

- **Allow the SANE service to run** sets the service package enabled flag. Save the form to apply settings.
- **Enable at boot / Disable at boot** controls the OpenWrt init-script autostart link.
- **Listen on network interface** selects the logical OpenWrt interface address to bind.
- **Allowed client addresses** sets saned's TCP-wrapper address list.
- TCP port is 6566. If binding on WAN, add a firewall rule allowing TCP/6566 only from trusted client addresses. The app does not alter firewall rules automatically.

For an Internet-facing WAN, do not allow the port from arbitrary networks. Prefer a trusted VPN or a narrow source CIDR.

The app grants rpcd access only to fixed helper executables. These helpers accept no parameters and perform a single fixed read or service operation; the page does not expose a general shell command interface.

## Build

Clone this repository into `feeds/luci/applications/luci-app-sane-openwrt` in an OpenWrt source tree, install the feed package, then build with the matching OpenWrt source tree / SDK:

```sh
./scripts/feeds install -p luci luci-app-sane-openwrt
make package/feeds/luci/luci-app-sane-openwrt/compile V=s
```

Install the resulting `luci-app-sane-openwrt` APK with the matching architecture and OpenWrt release. The service settings are preserved by UCI package upgrades.

## License

LGPL-2.1-or-later. See [LICENSE](LICENSE).
