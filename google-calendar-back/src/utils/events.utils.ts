export const checkIsFullDay = (startDate:number, endDate:number) =>{
  return endDate - startDate >= 86400000
  
}