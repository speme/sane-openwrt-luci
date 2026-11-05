include $(TOPDIR)/rules.mk

LUCI_TITLE:=SANE Scanner Management
LUCI_DEPENDS:=+luci-base +rpcd-mod-file +sane-frontends +sane-daemon +m158ab-saned
LUCI_PKGARCH:=all
LUCI_URL:=https://github.com/speme/sane-openwrt-luci
LUCI_MAINTAINER:=speme

PKG_LICENSE:=LGPL-2.1-or-later
PKG_LICENSE_FILES:=LICENSE

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
