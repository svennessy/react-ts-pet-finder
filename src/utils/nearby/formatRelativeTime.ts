export function formatRelativeTime(dateString: string) {
    const now = Date.now();
    const then = new Date(dateString).getTime();
  
    const seconds = Math.floor((now - then) / 1000);
  
    if (seconds < 60) {
      return "Just now";
    }
  
    const minutes = Math.floor(seconds / 60);
  
    if (minutes < 60) {
      return `${minutes} min ago`;
    }
  
    const hours = Math.floor(minutes / 60);
  
    if (hours < 24) {
      return `${hours} hr ago`;
    }
  
    const days = Math.floor(hours / 24);
  
    if (days < 30) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }
  
    const months = Math.floor(days / 30);
  
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }