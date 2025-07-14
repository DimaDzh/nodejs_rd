const getStartOfDay = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

const generateProgress = (freq, startDate = getStartOfDay()) => {
  let progress = [];

  if (freq === "daily") {
    progress = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return {
        timestamp: date.getTime(),
        date: date.toISOString().split("T")[0],
        done: false,
      };
    });
  } else if (freq === "weekly") {
    progress = Array.from({ length: 4 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * 7);
      return {
        timestamp: date.getTime(),
        date: date.toISOString().split("T")[0],
        week: i + 1,
        done: false,
      };
    });
  } else if (freq === "monthly") {
    const date = new Date(startDate);
    progress = [
      {
        timestamp: date.getTime(),
        date: date.toISOString().split("T")[0],
        month: 1,
        done: false,
      },
    ];
  }

  return progress;
};

export { generateProgress, getStartOfDay };
