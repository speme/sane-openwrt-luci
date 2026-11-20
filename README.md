# SANE Scanner Management for OpenWrt LuCI

A LuCI application for discovering scanners through the SANE backends installed on the router and managing a generic `saned` network service. The app does not filter devices by vendor or backend name, so it can work with Brother, Epson, HP, and other scanners supported by the installed SANE backend packages.

## Features

- Discover devices through `scanimage -L` and show their SANE names and descriptions.
- Read scanner options from any currently detected device through `scanimage -A`.
- Start, stop, restart, and enable or disable the generic SANE network service.
- Configure the listening OpenWrt interface and the client address/CIDR allowlist.
- Use the installed `/etc/sane.d` backend configuration without overwriting it.
- Keep scan jobs and image data on the SANE client; the router provides the scanner connection.

## Requirements

- OpenWrt 25.12 or a compatible LuCI build.
- `luci-base`, `rpcd-mod-file`, `sane-frontends`, and `sane-daemon`.
- The SANE backend package and firmware/driver needed by the attached scanner.
- The scanner must be attached to the router and visible to `scanimage -L`.

The app supports any scanner exposed by the SANE backends installed on the router. It cannot add a backend or proprietary firmware that is not installed.

## Configuration

The page edits `/etc/config/sane-openwrt`:

- **Allow the SANE service to run** controls the generic service.
- **Enable at boot / Disable at boot** controls its OpenWrt init-script autostart link.
- **Listen on network interface** selects the logical OpenWrt interface address to bind.
- **Allowed client addresses** controls which clients can connect. The default is `192.168.1.0/24`; change it to match the router's trusted LAN.

The service listens on TCP port 6566 and uses TCP ports 10000–10010 for scan data. If clients connect through a firewall, allow those ports only from trusted client addresses. The app does not change firewall rules automatically.

If upgrading from the older M158ab-specific package, stop and disable its service before starting the generic service, since both use TCP port 6566:

```sh
/etc/init.d/m158ab-saned stop
/etc/init.d/m158ab-saned disable
```

The app grants rpcd access only to fixed helper executables. A scanner name passed to the options helper is checked against current SANE discovery output before use.

## Build

Clone this repository into `feeds/luci/applications/luci-app-sane-openwrt` in an OpenWrt source tree, install the feed package, then build with the matching OpenWrt source tree or SDK:

```sh
./scripts/feeds install -p luci luci-app-sane-openwrt
make package/feeds/luci/luci-app-sane-openwrt/compile V=s
```

Install the resulting `luci-app-sane-openwrt` APK with the matching architecture and OpenWrt release. The app settings are preserved by UCI package upgrades.

## License

LGPL-2.1-or-later. See [LICENSE](LICENSE).
