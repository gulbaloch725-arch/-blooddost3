
export const isEligible = (lastDonationDate: string, coolOffDays: number = 90): boolean => {
  if (!lastDonationDate) return true;
  
  const last = new Date(lastDonationDate);
  last.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextAvailableDate = new Date(last);
  nextAvailableDate.setDate(last.getDate() + coolOffDays);
  
  return today.getTime() >= nextAvailableDate.getTime();
};

export const isNearlyEligible = (lastDonationDate: string, coolOffDays: number = 90, thresholdDays: number = 5): boolean => {
  if (!lastDonationDate) return false;
  
  const last = new Date(lastDonationDate);
  last.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextAvailableDate = new Date(last);
  nextAvailableDate.setDate(last.getDate() + coolOffDays);
  
  const diffTime = nextAvailableDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Nearly eligible if not currently eligible but will be within thresholdDays
  return diffDays > 0 && diffDays <= thresholdDays;
};

export const getRemainingDays = (lastDonationDate: string, coolOffDays: number = 90): string => {
  if (!lastDonationDate) return "Ready to Donate";
  
  const last = new Date(lastDonationDate);
  last.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextAvailableDate = new Date(last);
  nextAvailableDate.setDate(last.getDate() + coolOffDays);
  
  const diffTime = nextAvailableDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? `Wait ${diffDays} days` : "Ready to Donate";
};
