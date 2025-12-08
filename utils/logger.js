export const addLog = (checklistId, message, userId) => {
  console.log("LOG:", { checklistId, message, userId, timestamp: new Date() });
};
