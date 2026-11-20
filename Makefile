include $(TOPDIR)/rules.mk

LUCI_TITLE:=SANE Scanner Management
LUCI_DEPENDS:=+luci-base +rpcd-mod-file +sane-frontends +sane-daemon
LUCI_PKGARCH:=all
LUCI_URL:=https://github.com/speme/sane-openwrt-luci
LUCI_MAINTAINER:=speme

PKG_VERSION:=26.309.26052
PKG_RELEASE:=3

PKG_LICENSE:=LGPL-2.1-or-later
PKG_LICENSE_FILES:=LICENSE

define Package/luci-app-sane-openwrt/conffiles
/etc/config/sane-openwrt
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
