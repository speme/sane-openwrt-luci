include $(TOPDIR)/rules.mk

LUCI_TITLE:=SANE Scanner Management
LUCI_DEPENDS:=+luci-base +rpcd-mod-file +sane-frontends +sane-daemon +m158ab-saned
LUCI_PKGARCH:=all

PKG_LICENSE:=LGPL-2.1-or-later
PKG_LICENSE_FILES:=LICENSE

include ../../luci.mk
