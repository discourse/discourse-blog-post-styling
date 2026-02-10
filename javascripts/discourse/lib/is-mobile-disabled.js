export default function isMobileDisabled(capabilities, settings) {
  const isMobile = !capabilities.viewport.sm;
  return isMobile && !settings.mobile_enabled;
}
