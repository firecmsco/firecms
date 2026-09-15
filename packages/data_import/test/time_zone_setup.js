// Every test runs west of UTC. The .xlsx reader returns dates as UTC readings,
// which only differ from what the cell shows when the tab is not on UTC: under
// TZ=UTC, as on CI, the date tests would pass with that bug in place. Set here,
// before jest starts its workers, because a test file's process.env is a copy and
// assigning TZ there changes nothing.
module.exports = async () => {
    process.env.TZ = "America/New_York";
};
