export function convertDateToICalFormat(date: Date) {
    const year = date.getUTCFullYear();
    const month = padZeroes(date.getUTCMonth() + 1); // Months are zero-based
    const day = padZeroes(date.getUTCDate());
    const hours = padZeroes(date.getUTCHours());
    const minutes = padZeroes(date.getUTCMinutes());
    const seconds = padZeroes(date.getUTCSeconds());
  
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  function padZeroes(number: number) {
    return number < 10 ? `0${number}` : `${number}`;
  }