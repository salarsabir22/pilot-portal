export function isDemo() {
  return process.env.PILOT_DEMO !== "false";
}

export function showDemoOtp() {
  return process.env.PILOT_DEMO_OTP !== "false";
}
